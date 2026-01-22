import express from 'express';
import { z } from 'zod';
import { validateRequest } from '../middleware/validate';
import { jobQuerySchema, createJobSchema, updateJobSchema } from '../schemas/job';
import { JobService } from '../services/jobService';
import { authenticate } from '../middleware/auth';
import { requirePermission, requireOwnership } from '../middleware/rbac';
import { logSecurityEvent, Severity } from '../lib/securityAudit';
import { PreApplyService } from '../services/preApplyService';
import * as cache from '../lib/redisCache';
import { jobPerformanceService } from '../services/jobPerformanceService';
import { prisma } from '../db';

const router = express.Router();

// Cache TTL for public job listings (5 minutes)
const JOBS_CACHE_TTL = 300;

// Helper to generate cache key for job listings
function getJobsCacheKey(query: Record<string, any>): string {
  const {
    page = 1,
    pageSize = 20,
    q = '',
    location = '',
    employment = '',
    minSalary = '',
    maxSalary = '',
    skills = '',
    companyVerified = '',
    rapLevel = '',
    featured = '',
  } = query;
  return `jobs:list:${page}:${pageSize}:${q}:${location}:${employment}:${minSalary}:${maxSalary}:${skills}:${companyVerified}:${rapLevel}:${featured}`;
}

// GET /jobs - Public job list with Redis caching
router.get('/', validateRequest(z.object({ query: jobQuerySchema })), async (req, res) => {
  try {
    const page = req.query.page ? Number(req.query.page) : 1;
    const pageSize = req.query.pageSize ? Number(req.query.pageSize) : 20;
    
    // Generate cache key based on query params
    const cacheKey = getJobsCacheKey({
      page,
      pageSize,
      q: req.query.q,
      location: req.query.location,
      employment: req.query.employment,
      minSalary: req.query.minSalary,
      maxSalary: req.query.maxSalary,
      skills: req.query.skills,
      companyVerified: req.query.companyVerified,
      rapLevel: req.query.rapLevel,
      featured: req.query.featured,
    });

    // Try to get from cache first
    const cached = await cache.get(cacheKey);
    if (cached) {
      return void res.json(cached);
    }
    
    const result = await JobService.findAll({
      page,
      pageSize,
      query: req.query.q as string,
      location: req.query.location as string,
      employmentType: req.query.employment as string,
      minSalary: req.query.minSalary ? Number(req.query.minSalary) : undefined,
      maxSalary: req.query.maxSalary ? Number(req.query.maxSalary) : undefined,
      skills: req.query.skills ? String(req.query.skills).split(',').map(s => s.trim()).filter(Boolean) : [],
      companyVerified: req.query.companyVerified ? String(req.query.companyVerified) === 'true' : undefined,
      rapLevel: req.query.rapLevel as string,
      featured: req.query.featured ? String(req.query.featured) === 'true' : undefined,
    });

    // Cache the result
    await cache.set(cacheKey, result, JOBS_CACHE_TTL);

    res.json(result);
  } catch (error) {
    console.error('Jobs API Error:', error);
    // Return empty result to prevent UI crash/hang
    res.json({
      data: [],
      meta: { total: 0, page: 1, pageSize: 20, totalPages: 0 }
    });
  }
});

// GET /jobs/matches - AI-style job matching for authenticated users
router.get('/matches', authenticate, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const { limit = '20', location, employment, skills, minSalary, maxSalary } = req.query;

    const userSkills = await prisma.userSkill.findMany({
      where: { userId },
      include: { skill: { select: { name: true } } },
    });

    const skillNames = (skills ? String(skills).split(',').map(s => s.trim()).filter(Boolean) : [])
      .concat(userSkills.map((s) => s.skill?.name).filter(Boolean) as string[]);

    const where: any = { isActive: true };
    if (location) where.location = { contains: String(location), mode: 'insensitive' };
    if (employment) where.employment = String(employment);
    if (minSalary) {
      where.OR = [
        ...(where.OR || []),
        { salaryHigh: { gte: Number(minSalary) } },
        { salaryLow: { gte: Number(minSalary) } },
      ];
    }
    if (maxSalary) {
      where.OR = [
        ...(where.OR || []),
        { salaryLow: { lte: Number(maxSalary) } },
        { salaryHigh: { lte: Number(maxSalary) } },
      ];
    }
    if (skillNames.length > 0) {
      where.jobSkills = {
        some: {
          OR: skillNames.map((skill) => ({
            skill: { name: { contains: skill, mode: 'insensitive' } },
          })),
        },
      };
    }

    const jobs = await prisma.job.findMany({
      where,
      take: Math.min(50, Number(limit)),
      orderBy: { postedAt: 'desc' },
      include: {
        user: { select: { id: true, email: true, companyProfile: true } },
        jobSkills: { include: { skill: true } },
      },
    });

    const matches = jobs.map((job) => {
      const jobSkills = job.jobSkills.map((js) => js.skill?.name).filter(Boolean) as string[];
      const sharedSkills = skillNames.filter((skill) =>
        jobSkills.some((js) => js.toLowerCase().includes(skill.toLowerCase()))
      );
      const skillScore = jobSkills.length ? (sharedSkills.length / jobSkills.length) * 40 : 10;
      const verifiedBonus = job.user?.companyProfile?.isVerified ? 5 : 0;
      const rapBonus = job.user?.companyProfile?.rapCertificationLevel ? 5 : 0;
      const matchScore = Math.min(99, Math.round(50 + skillScore + verifiedBonus + rapBonus));

      const companyProfile = job.user?.companyProfile;
      return {
        ...job,
        isFeatured: job.isFeatured,
        skills: jobSkills,
        matchScore,
        matchReasons: [
          ...(sharedSkills.length ? [`Matched skills: ${sharedSkills.slice(0, 4).join(', ')}`] : []),
          ...(companyProfile?.isVerified ? ['Verified employer'] : []),
          ...(companyProfile?.rapCertificationLevel ? ['RAP committed employer'] : []),
        ],
        company: companyProfile ? {
          id: companyProfile.id,
          companyName: companyProfile.companyName,
          logo: (companyProfile as any).logo,
          industry: companyProfile.industry,
          description: companyProfile.description,
          website: companyProfile.website,
          location: `${companyProfile.city || ''}, ${companyProfile.state || ''}`.replace(/^, |, $/g, ''),
          isVerified: companyProfile.isVerified,
          rapCertificationLevel: companyProfile.rapCertificationLevel,
          createdAt: companyProfile.createdAt,
        } : undefined,
      };
    });

    res.json({ jobs: matches });
  } catch (error) {
    console.error('Job matches error:', error);
    res.status(500).json({ error: 'Failed to build job matches' });
  }
});

// GET /jobs/:id - Job details
router.get('/:id', async (req, res) => {
  try {
    const job = await JobService.findById(req.params.id);
    if (!job) {
      return void res.status(404).json({ message: 'Job not found' });
    }

    // Track job view asynchronously (don't block response)
    setImmediate(async () => {
      try {
        await jobPerformanceService.trackEvent({
          jobId: req.params.id,
          eventType: 'view',
        });
      } catch (trackError) {
        console.error('[Jobs] View tracking error:', trackError);
      }
    });

    res.json(job);
  } catch (error) {
     console.error('Job Details API Error:', error);
     res.status(404).json({ message: 'Job not found' });
  }
});

// POST /jobs - Create job (Protected - Company or Admin only)
router.post(
  '/',
  authenticate,
  requirePermission('job:create'),
  validateRequest(z.object({ body: createJobSchema })),
  async (req, res) => {
    try {
      // @ts-ignore - user is attached by auth middleware
      const userId = req.user.id;
      const job = await JobService.create(req.body, userId);

      // Invalidate jobs list cache
      await cache.delPattern('jobs:list:*');

      await logSecurityEvent({
        type: 'DATA_MODIFICATION',
        userId,
        description: `Created job: ${job.title}`,
        severity: Severity.INFO,
        ipAddress: req.ip || req.socket.remoteAddress,
      });

      // Process pre-apply matching asynchronously (don't block response)
      setImmediate(async () => {
        try {
          await PreApplyService.processNewJob(job.id);
        } catch (preApplyError) {
          console.error('[Jobs] Pre-apply processing error:', preApplyError);
        }
      });

      res.status(201).json(job);
    } catch (error) {
      res.status(500).json({ message: 'Failed to create job' });
    }
  }
);

// PUT /jobs/:id - Update job (Owner or Admin only)
router.put(
  '/:id',
  authenticate,
  requirePermission('job:update'),
  requireOwnership('job', 'id'),
  validateRequest(z.object({ body: updateJobSchema })),
  async (req, res) => {
    try {
      // @ts-ignore - user is attached by auth middleware
      const userId = req.user.id;
      const job = await JobService.update(req.params.id, req.body, userId);

      if (!job) {
        return void res.status(404).json({ message: 'Job not found' });
      }

      // Invalidate jobs list cache
      await cache.delPattern('jobs:list:*');

      await logSecurityEvent({
        type: 'DATA_MODIFICATION',
        userId,
        description: `Updated job: ${job.title}`,
        severity: Severity.INFO,
        ipAddress: req.ip || req.socket.remoteAddress,
      });

      res.json(job);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update job' });
    }
  }
);

// DELETE /jobs/:id - Delete job (Owner or Admin only)
router.delete(
  '/:id',
  authenticate,
  requirePermission('job:delete'),
  requireOwnership('job', 'id'),
  async (req, res) => {
    try {
      // @ts-ignore - user is attached by auth middleware
      const userId = req.user.id;
      const success = await JobService.delete(req.params.id, userId);

      if (!success) {
        return void res.status(404).json({ message: 'Job not found' });
      }

      // Invalidate jobs list cache
      await cache.delPattern('jobs:list:*');

      await logSecurityEvent({
        type: 'DATA_MODIFICATION',
        userId,
        description: `Deleted job: ${req.params.id}`,
        severity: Severity.WARNING,
        ipAddress: req.ip || req.socket.remoteAddress,
      });

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete job' });
    }
  }
);

// GET /jobs/me - Get jobs owned by current user
router.get('/me', authenticate, async (req, res) => {
  try {
    // @ts-ignore - user is attached by auth middleware
    const userId = req.user.id;
    const jobs = await JobService.findByUser(userId);
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch your jobs' });
  }
});

export default router;


