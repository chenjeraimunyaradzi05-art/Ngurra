// @ts-nocheck
/**
 * Job Matching Service
 * 
 * Advanced job recommendation algorithm with:
 * - Skills-based matching
 * - Experience level matching
 * - Location/remote preference matching
 * - Indigenous employer prioritization
 * - Cultural fit scoring
 * - Career path alignment
 * - Machine learning-ready scoring
 */

import { prisma } from '../db';
import { logger } from '../lib/logger';
import { redisCache } from '../lib/redisCacheWrapper';

// Types
export interface JobMatchScore {
  jobId: string;
  userId: string;
  totalScore: number;
  breakdown: ScoreBreakdown;
  matchedSkills: string[];
  missingSkills: string[];
  matchReasons: string[];
  culturalAlignment: number;
  recommended: boolean;
}

export interface ScoreBreakdown {
  skillsMatch: number;
  experienceMatch: number;
  locationMatch: number;
  industryMatch: number;
  culturalFit: number;
  companyReputation: number;
  salaryMatch: number;
  careerPathAlignment: number;
  indigenousEmployerBonus: number;
  recencyBonus: number;
}

export interface UserProfile {
  id: string;
  skills: string[];
  experienceYears: number;
  experienceLevel: 'entry' | 'junior' | 'mid' | 'senior' | 'lead' | 'executive';
  location: string;
  remotePreference: 'remote' | 'hybrid' | 'onsite' | 'flexible';
  salaryExpectation?: { min: number; max: number };
  industries: string[];
  preferredCompanySize?: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  isIndigenous: boolean;
  culturalPreferences?: string[];
  careerGoals?: string[];
}

export interface JobListing {
  id: string;
  title: string;
  description: string;
  requiredSkills: string[];
  preferredSkills: string[];
  experienceLevel: string;
  experienceYears: { min: number; max: number };
  location: string;
  remoteType: 'remote' | 'hybrid' | 'onsite';
  salary?: { min: number; max: number };
  industry: string;
  companyId: string;
  companyName: string;
  isIndigenousOwned: boolean;
  indigenousFriendly: boolean;
  culturalElements?: string[];
  createdAt: Date;
  companyRating?: number;
}

export interface MatchingOptions {
  limit?: number;
  offset?: number;
  minScore?: number;
  prioritizeIndigenous?: boolean;
  includeRemote?: boolean;
  excludeApplied?: boolean;
}

// Scoring weights (total = 100)
const SCORING_WEIGHTS = {
  skillsMatch: 30,
  experienceMatch: 15,
  locationMatch: 10,
  industryMatch: 10,
  culturalFit: 10,
  companyReputation: 5,
  salaryMatch: 10,
  careerPathAlignment: 5,
  indigenousEmployerBonus: 5, // Extra bonus, not part of 100
  recencyBonus: 5
};

class JobMatchingService {
  private static instance: JobMatchingService;

  private constructor() {}

  static getInstance(): JobMatchingService {
    if (!JobMatchingService.instance) {
      JobMatchingService.instance = new JobMatchingService();
    }
    return JobMatchingService.instance;
  }

  /**
   * Get matched jobs for a user
   */
  async getMatchedJobs(
    userId: string,
    options: MatchingOptions = {}
  ): Promise<JobMatchScore[]> {
    const {
      limit = 20,
      offset = 0,
      minScore = 30,
      prioritizeIndigenous = true,
      includeRemote = true,
      excludeApplied = true
    } = options;

    try {
      // Get user profile
      const userProfile = await this.getUserProfile(userId);
      if (!userProfile) {
        throw new Error('User profile not found');
      }

      // Get available jobs
      const jobs = await this.getAvailableJobs(userId, excludeApplied, includeRemote);

      // Score each job
      const scoredJobs: JobMatchScore[] = [];
      
      for (const job of jobs) {
        const score = this.calculateMatchScore(userProfile, job);
        if (score.totalScore >= minScore) {
          scoredJobs.push(score);
        }
      }

      // Sort by score (with Indigenous employer bonus if enabled)
      scoredJobs.sort((a, b) => {
        let scoreA = a.totalScore;
        let scoreB = b.totalScore;

        if (prioritizeIndigenous && userProfile.isIndigenous) {
          scoreA += a.breakdown.indigenousEmployerBonus;
          scoreB += b.breakdown.indigenousEmployerBonus;
        }

        return scoreB - scoreA;
      });

      // Apply pagination
      const paginatedJobs = scoredJobs.slice(offset, offset + limit);

      // Cache results
      await redisCache.set(
        `job_matches:${userId}`,
        paginatedJobs,
        1800 // 30 minutes
      );

      logger.info('Job matching completed', {
        userId,
        totalJobs: jobs.length,
        matchedJobs: scoredJobs.length,
        returned: paginatedJobs.length
      });

      return paginatedJobs;
    } catch (error) {
      logger.error('Job matching failed', { userId, error });
      throw error;
    }
  }

  /**
   * Get user profile for matching
   */
  private async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          skills: true,
          experience: true,
          preferences: true
        }
      });

      if (!user) return null;

      // Extract skills
      const skills = user.skills?.map(s => s.name.toLowerCase()) || [];

      // Calculate experience level
      const experienceYears = this.calculateExperienceYears(user.experience || []);
      const experienceLevel = this.mapExperienceLevel(experienceYears);

      return {
        id: userId,
        skills,
        experienceYears,
        experienceLevel,
        location: user.location || '',
        remotePreference: user.preferences?.remotePreference || 'flexible',
        salaryExpectation: user.preferences?.salaryExpectation,
        industries: user.preferences?.industries || [],
        preferredCompanySize: user.preferences?.companySize,
        isIndigenous: user.isIndigenous || false,
        culturalPreferences: user.preferences?.culturalPreferences || [],
        careerGoals: user.preferences?.careerGoals || []
      };
    } catch (error) {
      logger.error('Failed to get user profile', { userId, error });
      return null;
    }
  }

  /**
   * Get available jobs
   */
  private async getAvailableJobs(
    userId: string,
    excludeApplied: boolean,
    includeRemote: boolean
  ): Promise<JobListing[]> {
    try {
      // Get applied job IDs if needed
      let appliedJobIds: string[] = [];
      if (excludeApplied) {
        const applications = await prisma.application.findMany({
          where: { userId },
          select: { jobId: true }
        });
        appliedJobIds = applications.map(a => a.jobId);
      }

      // Query jobs
      const jobs = await prisma.job.findMany({
        where: {
          status: 'ACTIVE',
          id: excludeApplied ? { notIn: appliedJobIds } : undefined,
          // Include remote jobs if enabled
          ...(includeRemote ? {} : { remoteType: { not: 'remote' } })
        },
        include: {
          company: {
            select: {
              id: true,
              name: true,
              isIndigenousOwned: true,
              rating: true
            }
          },
          skills: true
        },
        orderBy: { createdAt: 'desc' },
        take: 500 // Limit for performance
      });

      return jobs.map(job => ({
        id: job.id,
        title: job.title,
        description: job.description || '',
        requiredSkills: job.skills?.filter(s => s.required).map(s => s.name.toLowerCase()) || [],
        preferredSkills: job.skills?.filter(s => !s.required).map(s => s.name.toLowerCase()) || [],
        experienceLevel: job.experienceLevel || 'mid',
        experienceYears: { 
          min: job.minExperience || 0, 
          max: job.maxExperience || 10 
        },
        location: job.location || '',
        remoteType: job.remoteType || 'onsite',
        salary: job.salaryMin && job.salaryMax 
          ? { min: job.salaryMin, max: job.salaryMax }
          : undefined,
        industry: job.industry || '',
        companyId: job.company.id,
        companyName: job.company.name,
        isIndigenousOwned: job.company.isIndigenousOwned || false,
        indigenousFriendly: job.indigenousFriendly || false,
        culturalElements: job.culturalElements || [],
        createdAt: job.createdAt,
        companyRating: job.company.rating || undefined
      }));
    } catch (error) {
      logger.error('Failed to get available jobs', { error });
      return [];
    }
  }

  /**
   * Calculate match score between user and job
   */
  private calculateMatchScore(user: UserProfile, job: JobListing): JobMatchScore {
    const breakdown: ScoreBreakdown = {
      skillsMatch: 0,
      experienceMatch: 0,
      locationMatch: 0,
      industryMatch: 0,
      culturalFit: 0,
      companyReputation: 0,
      salaryMatch: 0,
      careerPathAlignment: 0,
      indigenousEmployerBonus: 0,
      recencyBonus: 0
    };

    const matchedSkills: string[] = [];
    const missingSkills: string[] = [];
    const matchReasons: string[] = [];

    // 1. Skills Match (30 points)
    const { skillScore, matched, missing } = this.calculateSkillsMatch(
      user.skills,
      job.requiredSkills,
      job.preferredSkills
    );
    breakdown.skillsMatch = skillScore * SCORING_WEIGHTS.skillsMatch;
    matchedSkills.push(...matched);
    missingSkills.push(...missing);

    if (skillScore >= 0.8) {
      matchReasons.push('Strong skills match');
    }

    // 2. Experience Match (15 points)
    breakdown.experienceMatch = this.calculateExperienceMatch(
      user.experienceYears,
      job.experienceYears
    ) * SCORING_WEIGHTS.experienceMatch;

    if (breakdown.experienceMatch >= 12) {
      matchReasons.push('Experience level fits well');
    }

    // 3. Location Match (10 points)
    breakdown.locationMatch = this.calculateLocationMatch(
      user.location,
      user.remotePreference,
      job.location,
      job.remoteType
    ) * SCORING_WEIGHTS.locationMatch;

    if (job.remoteType === 'remote') {
      matchReasons.push('Remote work available');
    }

    // 4. Industry Match (10 points)
    if (user.industries.length > 0) {
      const industryMatch = user.industries.some(
        i => i.toLowerCase() === job.industry.toLowerCase()
      );
      breakdown.industryMatch = industryMatch ? SCORING_WEIGHTS.industryMatch : 0;
      
      if (industryMatch) {
        matchReasons.push(`Matches your ${job.industry} interest`);
      }
    } else {
      breakdown.industryMatch = SCORING_WEIGHTS.industryMatch * 0.5; // Neutral
    }

    // 5. Cultural Fit (10 points)
    breakdown.culturalFit = this.calculateCulturalFit(
      user.isIndigenous,
      user.culturalPreferences || [],
      job.indigenousFriendly,
      job.culturalElements || []
    ) * SCORING_WEIGHTS.culturalFit;

    if (job.indigenousFriendly && user.isIndigenous) {
      matchReasons.push('Indigenous-friendly workplace');
    }

    // 6. Company Reputation (5 points)
    if (job.companyRating) {
      breakdown.companyReputation = (job.companyRating / 5) * SCORING_WEIGHTS.companyReputation;
      if (job.companyRating >= 4) {
        matchReasons.push('Highly rated employer');
      }
    } else {
      breakdown.companyReputation = SCORING_WEIGHTS.companyReputation * 0.5;
    }

    // 7. Salary Match (10 points)
    if (user.salaryExpectation && job.salary) {
      breakdown.salaryMatch = this.calculateSalaryMatch(
        user.salaryExpectation,
        job.salary
      ) * SCORING_WEIGHTS.salaryMatch;

      if (breakdown.salaryMatch >= 8) {
        matchReasons.push('Salary matches expectations');
      }
    } else {
      breakdown.salaryMatch = SCORING_WEIGHTS.salaryMatch * 0.5;
    }

    // 8. Career Path Alignment (5 points)
    if (user.careerGoals && user.careerGoals.length > 0) {
      breakdown.careerPathAlignment = this.calculateCareerAlignment(
        user.careerGoals,
        job.title,
        job.description
      ) * SCORING_WEIGHTS.careerPathAlignment;
    } else {
      breakdown.careerPathAlignment = SCORING_WEIGHTS.careerPathAlignment * 0.5;
    }

    // 9. Indigenous Employer Bonus (extra 5 points)
    if (job.isIndigenousOwned) {
      breakdown.indigenousEmployerBonus = SCORING_WEIGHTS.indigenousEmployerBonus;
      matchReasons.push('Indigenous-owned employer');
    }

    // 10. Recency Bonus (5 points)
    const daysSincePosted = this.getDaysSince(job.createdAt);
    if (daysSincePosted <= 7) {
      breakdown.recencyBonus = SCORING_WEIGHTS.recencyBonus;
      matchReasons.push('Recently posted');
    } else if (daysSincePosted <= 14) {
      breakdown.recencyBonus = SCORING_WEIGHTS.recencyBonus * 0.7;
    } else if (daysSincePosted <= 30) {
      breakdown.recencyBonus = SCORING_WEIGHTS.recencyBonus * 0.4;
    }

    // Calculate total (max 100 + 5 bonus)
    const totalScore = Math.round(
      breakdown.skillsMatch +
      breakdown.experienceMatch +
      breakdown.locationMatch +
      breakdown.industryMatch +
      breakdown.culturalFit +
      breakdown.companyReputation +
      breakdown.salaryMatch +
      breakdown.careerPathAlignment +
      breakdown.recencyBonus
    );

    return {
      jobId: job.id,
      userId: user.id,
      totalScore,
      breakdown,
      matchedSkills,
      missingSkills,
      matchReasons,
      culturalAlignment: breakdown.culturalFit / SCORING_WEIGHTS.culturalFit * 100,
      recommended: totalScore >= 60
    };
  }

  /**
   * Calculate skills match score
   */
  private calculateSkillsMatch(
    userSkills: string[],
    requiredSkills: string[],
    preferredSkills: string[]
  ): { skillScore: number; matched: string[]; missing: string[] } {
    const matched: string[] = [];
    const missing: string[] = [];

    // Check required skills (weighted 70%)
    let requiredMatched = 0;
    for (const skill of requiredSkills) {
      if (userSkills.some(us => this.skillsMatch(us, skill))) {
        requiredMatched++;
        matched.push(skill);
      } else {
        missing.push(skill);
      }
    }

    const requiredScore = requiredSkills.length > 0
      ? requiredMatched / requiredSkills.length
      : 1;

    // Check preferred skills (weighted 30%)
    let preferredMatched = 0;
    for (const skill of preferredSkills) {
      if (userSkills.some(us => this.skillsMatch(us, skill))) {
        preferredMatched++;
        matched.push(skill);
      }
    }

    const preferredScore = preferredSkills.length > 0
      ? preferredMatched / preferredSkills.length
      : 1;

    const skillScore = (requiredScore * 0.7) + (preferredScore * 0.3);

    return { skillScore, matched, missing };
  }

  /**
   * Check if skills match (with fuzzy matching)
   */
  private skillsMatch(userSkill: string, jobSkill: string): boolean {
    // Exact match
    if (userSkill === jobSkill) return true;

    // Contains match
    if (userSkill.includes(jobSkill) || jobSkill.includes(userSkill)) return true;

    // Common variations
    const variations: Record<string, string[]> = {
      'javascript': ['js', 'ecmascript'],
      'typescript': ['ts'],
      'react': ['reactjs', 'react.js'],
      'node': ['nodejs', 'node.js'],
      'python': ['py'],
      'postgresql': ['postgres', 'psql'],
      'mongodb': ['mongo'],
      'aws': ['amazon web services'],
      'gcp': ['google cloud', 'google cloud platform'],
      'azure': ['microsoft azure']
    };

    for (const [canonical, alts] of Object.entries(variations)) {
      const allForms = [canonical, ...alts];
      if (allForms.includes(userSkill) && allForms.includes(jobSkill)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Calculate experience match score
   */
  private calculateExperienceMatch(
    userYears: number,
    jobRange: { min: number; max: number }
  ): number {
    // Perfect match if within range
    if (userYears >= jobRange.min && userYears <= jobRange.max) {
      return 1;
    }

    // Slightly over-qualified (1-3 years over max)
    if (userYears > jobRange.max && userYears <= jobRange.max + 3) {
      return 0.8;
    }

    // Significantly over-qualified
    if (userYears > jobRange.max + 3) {
      return 0.5;
    }

    // Under-qualified - calculate proximity
    if (userYears < jobRange.min) {
      const deficit = jobRange.min - userYears;
      if (deficit <= 1) return 0.7; // Close enough
      if (deficit <= 2) return 0.5;
      return 0.3;
    }

    return 0.5;
  }

  /**
   * Calculate location match score
   */
  private calculateLocationMatch(
    userLocation: string,
    userRemotePref: string,
    jobLocation: string,
    jobRemoteType: string
  ): number {
    // Remote job + user wants remote = perfect
    if (jobRemoteType === 'remote') {
      if (userRemotePref === 'remote' || userRemotePref === 'flexible') {
        return 1;
      }
      return 0.7; // Remote available even if user prefers onsite
    }

    // Hybrid job
    if (jobRemoteType === 'hybrid') {
      if (userRemotePref === 'hybrid' || userRemotePref === 'flexible') {
        // Check location proximity
        if (this.locationsMatch(userLocation, jobLocation)) {
          return 1;
        }
        return 0.5; // Might need to relocate
      }
      return 0.6;
    }

    // Onsite job
    if (jobRemoteType === 'onsite') {
      if (this.locationsMatch(userLocation, jobLocation)) {
        return 1;
      }
      if (userRemotePref === 'onsite') {
        return 0.4; // Willing to work onsite but wrong location
      }
      return 0.2; // User wants remote but job is onsite
    }

    return 0.5;
  }

  /**
   * Check if locations match
   */
  private locationsMatch(userLoc: string, jobLoc: string): boolean {
    const normalize = (s: string) => s.toLowerCase().trim();
    const u = normalize(userLoc);
    const j = normalize(jobLoc);

    // Exact match
    if (u === j) return true;

    // City/state matching
    if (u.includes(j) || j.includes(u)) return true;

    // Same state/region
    const userParts = u.split(',').map(s => s.trim());
    const jobParts = j.split(',').map(s => s.trim());
    
    return userParts.some(up => jobParts.includes(up));
  }

  /**
   * Calculate cultural fit score
   */
  private calculateCulturalFit(
    userIsIndigenous: boolean,
    userPreferences: string[],
    jobIndigenousFriendly: boolean,
    jobCulturalElements: string[]
  ): number {
    let score = 0.5; // Baseline

    // Indigenous user + Indigenous-friendly job
    if (userIsIndigenous && jobIndigenousFriendly) {
      score += 0.3;
    }

    // Cultural element matches
    if (userPreferences.length > 0 && jobCulturalElements.length > 0) {
      const matches = userPreferences.filter(p => 
        jobCulturalElements.some(c => 
          c.toLowerCase().includes(p.toLowerCase())
        )
      );
      score += (matches.length / userPreferences.length) * 0.2;
    }

    return Math.min(score, 1);
  }

  /**
   * Calculate salary match score
   */
  private calculateSalaryMatch(
    userExpectation: { min: number; max: number },
    jobSalary: { min: number; max: number }
  ): number {
    // Job max >= user min = good overlap
    if (jobSalary.max >= userExpectation.min) {
      // Perfect overlap
      if (jobSalary.min >= userExpectation.min && jobSalary.max <= userExpectation.max) {
        return 1;
      }
      // Partial overlap
      const overlapMin = Math.max(userExpectation.min, jobSalary.min);
      const overlapMax = Math.min(userExpectation.max, jobSalary.max);
      const overlapRange = overlapMax - overlapMin;
      const userRange = userExpectation.max - userExpectation.min;
      
      if (overlapRange > 0 && userRange > 0) {
        return Math.min(overlapRange / userRange, 1);
      }
    }

    // Below expectations
    const deficit = userExpectation.min - jobSalary.max;
    const percentDeficit = deficit / userExpectation.min;
    
    if (percentDeficit <= 0.1) return 0.7; // Within 10%
    if (percentDeficit <= 0.2) return 0.5; // Within 20%
    return 0.3;
  }

  /**
   * Calculate career path alignment
   */
  private calculateCareerAlignment(
    careerGoals: string[],
    jobTitle: string,
    jobDescription: string
  ): number {
    const content = `${jobTitle} ${jobDescription}`.toLowerCase();
    
    let matches = 0;
    for (const goal of careerGoals) {
      const keywords = goal.toLowerCase().split(/\s+/);
      if (keywords.some(kw => content.includes(kw))) {
        matches++;
      }
    }

    return careerGoals.length > 0 ? matches / careerGoals.length : 0.5;
  }

  /**
   * Calculate experience years from work history
   */
  private calculateExperienceYears(experiences: any[]): number {
    if (!experiences || experiences.length === 0) return 0;

    let totalMonths = 0;
    
    for (const exp of experiences) {
      const start = new Date(exp.startDate);
      const end = exp.endDate ? new Date(exp.endDate) : new Date();
      const months = (end.getFullYear() - start.getFullYear()) * 12 
        + (end.getMonth() - start.getMonth());
      totalMonths += Math.max(months, 0);
    }

    return Math.round(totalMonths / 12 * 10) / 10;
  }

  /**
   * Map years to experience level
   */
  private mapExperienceLevel(years: number): UserProfile['experienceLevel'] {
    if (years < 1) return 'entry';
    if (years < 3) return 'junior';
    if (years < 5) return 'mid';
    if (years < 8) return 'senior';
    if (years < 12) return 'lead';
    return 'executive';
  }

  /**
   * Get days since date
   */
  private getDaysSince(date: Date): number {
    return Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
  }

  /**
   * Get similar jobs to one the user viewed
   */
  async getSimilarJobs(
    jobId: string,
    limit: number = 10
  ): Promise<JobListing[]> {
    try {
      const job = await prisma.job.findUnique({
        where: { id: jobId },
        include: { skills: true, company: true }
      });

      if (!job) return [];

      const jobSkills = job.skills?.map(s => s.name.toLowerCase()) || [];

      // Find jobs with similar skills
      const similarJobs = await prisma.job.findMany({
        where: {
          id: { not: jobId },
          status: 'ACTIVE',
          OR: [
            { industry: job.industry },
            { skills: { some: { name: { in: jobSkills } } } }
          ]
        },
        include: { skills: true, company: true },
        take: limit * 2 // Get more to filter
      });

      // Score by similarity
      const scored = similarJobs.map(sj => {
        const sjSkills = sj.skills?.map(s => s.name.toLowerCase()) || [];
        const skillOverlap = jobSkills.filter(s => sjSkills.includes(s)).length;
        const industryMatch = sj.industry === job.industry ? 1 : 0;
        const score = (skillOverlap / Math.max(jobSkills.length, 1)) * 0.7 + industryMatch * 0.3;
        return { job: sj, score };
      });

      scored.sort((a, b) => b.score - a.score);

      return scored.slice(0, limit).map(s => ({
        id: s.job.id,
        title: s.job.title,
        description: s.job.description || '',
        requiredSkills: [],
        preferredSkills: [],
        experienceLevel: s.job.experienceLevel || 'mid',
        experienceYears: { min: 0, max: 10 },
        location: s.job.location || '',
        remoteType: s.job.remoteType || 'onsite',
        industry: s.job.industry || '',
        companyId: s.job.companyId,
        companyName: s.job.company?.name || '',
        isIndigenousOwned: s.job.company?.isIndigenousOwned || false,
        indigenousFriendly: s.job.indigenousFriendly || false,
        createdAt: s.job.createdAt
      }));
    } catch (error) {
      logger.error('Failed to get similar jobs', { jobId, error });
      return [];
    }
  }
}

// Export singleton
export const jobMatchingService = JobMatchingService.getInstance();

