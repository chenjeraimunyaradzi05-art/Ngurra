// @ts-nocheck
/**
 * Resume Parser API Routes
 * 
 * Endpoints for uploading, parsing, and analyzing resumes with AI.
 */

import { Router, Request, Response } from 'express';
import multer from 'multer';
import { authenticate, optionalAuth } from '../middleware/auth';
import { parseResume, analyzeJobFit, generateResumeSuggestions, ParsedResume } from '../services/resumeParser';
import { prisma } from '../lib/database';

// Extend Request type to include file
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

const router = Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain',
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Please upload PDF, DOCX, DOC, or TXT files.'));
    }
  },
});

/**
 * POST /api/resume/parse
 * Parse a resume file and extract structured data
 */
router.post('/parse', optionalAuth, upload.single('resume'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const userId = (req as any).user?.id;

    const parsed = await parseResume(
      req.file.buffer,
      req.file.mimetype,
      userId
    );

    // Generate improvement suggestions
    const suggestions = await generateResumeSuggestions(parsed);

    res.json({
      success: true,
      data: parsed,
      suggestions,
    });
  } catch (error: any) {
    console.error('Resume parse error:', error);
    res.status(500).json({
      error: error.message || 'Failed to parse resume',
    });
  }
});

/**
 * POST /api/resume/analyze-fit
 * Analyze how well a resume matches job requirements
 */
router.post('/analyze-fit', authenticate, async (req: Request, res: Response) => {
  try {
    const { resume, jobId } = req.body;

    if (!resume || !jobId) {
      return res.status(400).json({ error: 'Resume data and job ID are required' });
    }

    // Get job requirements
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      select: {
        id: true,
        title: true,
        requiredSkills: true,
        preferredSkills: true,
        experienceYears: true,
        educationRequirement: true,
        culturalFitFactors: true,
      },
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const analysis = await analyzeJobFit(resume as ParsedResume, {
      requiredSkills: job.requiredSkills || [],
      preferredSkills: job.preferredSkills || [],
      experienceYears: job.experienceYears,
      education: job.educationRequirement,
      culturalFitFactors: job.culturalFitFactors || [],
    });

    res.json({
      job: { id: job.id, title: job.title },
      analysis,
    });
  } catch (error: any) {
    console.error('Job fit analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze job fit' });
  }
});

/**
 * POST /api/resume/import-profile
 * Import parsed resume data into user profile
 */
router.post('/import-profile', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { parsedResume, sections } = req.body;

    if (!parsedResume) {
      return res.status(400).json({ error: 'Parsed resume data is required' });
    }

    // Sections to import (default all)
    const importSections = sections || ['contact', 'summary', 'experience', 'education', 'skills'];

    // Start a transaction to update profile
    await prisma.$transaction(async (tx) => {
      // Update basic profile info
      if (importSections.includes('contact') || importSections.includes('summary')) {
        await tx.user.update({
          where: { id: userId },
          data: {
            ...(parsedResume.contact?.name && { name: parsedResume.contact.name }),
            ...(parsedResume.contact?.location && { location: parsedResume.contact.location }),
            ...(parsedResume.summary && { bio: parsedResume.summary }),
          },
        });
      }

      // Import experience
      if (importSections.includes('experience') && parsedResume.experience?.length) {
        // Delete existing experience entries
        await tx.workExperience.deleteMany({ where: { userId } });
        
        // Create new entries
        for (const exp of parsedResume.experience) {
          await tx.workExperience.create({
            data: {
              userId,
              title: exp.title,
              company: exp.company,
              location: exp.location,
              startDate: exp.startDate ? new Date(exp.startDate) : null,
              endDate: exp.endDate ? new Date(exp.endDate) : null,
              current: exp.current || false,
              description: exp.description,
              highlights: exp.highlights || [],
            },
          });
        }
      }

      // Import education
      if (importSections.includes('education') && parsedResume.education?.length) {
        await tx.education.deleteMany({ where: { userId } });
        
        for (const edu of parsedResume.education) {
          await tx.education.create({
            data: {
              userId,
              degree: edu.degree,
              institution: edu.institution,
              location: edu.location,
              graduationDate: edu.graduationDate ? new Date(edu.graduationDate) : null,
              gpa: edu.gpa,
              honors: edu.honors || [],
            },
          });
        }
      }

      // Import skills
      if (importSections.includes('skills') && parsedResume.skills) {
        // Clear existing skills
        await tx.userSkill.deleteMany({ where: { userId } });
        
        // Add all skills
        const allSkills = [
          ...parsedResume.skills.technical,
          ...parsedResume.skills.soft,
        ];
        
        for (const skillName of allSkills) {
          // Find or create skill
          let skill = await tx.skill.findFirst({
            where: { name: { equals: skillName, mode: 'insensitive' } },
          });
          
          if (!skill) {
            skill = await tx.skill.create({
              data: { name: skillName },
            });
          }
          
          await tx.userSkill.create({
            data: { userId, skillId: skill.id },
          });
        }

        // Import certifications
        for (const certName of parsedResume.skills.certifications || []) {
          await tx.certification.create({
            data: {
              userId,
              name: certName,
            },
          });
        }
      }
    });

    res.json({
      success: true,
      message: 'Profile updated from resume',
      importedSections: importSections,
    });
  } catch (error: any) {
    console.error('Profile import error:', error);
    res.status(500).json({ error: 'Failed to import resume data to profile' });
  }
});

/**
 * GET /api/resume/parse-history
 * Get user's resume parsing history
 */
router.get('/parse-history', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const history = await prisma.resumeParseResult.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        confidence: true,
        createdAt: true,
        parsedData: true,
      },
    });

    // Parse the JSON data
    const results = history.map(h => ({
      id: h.id,
      confidence: h.confidence,
      createdAt: h.createdAt,
      summary: JSON.parse(h.parsedData || '{}').contact?.name || 'Resume',
    }));

    res.json({ history: results });
  } catch (error: any) {
    console.error('Parse history error:', error);
    res.status(500).json({ error: 'Failed to get parse history' });
  }
});

export default router;

