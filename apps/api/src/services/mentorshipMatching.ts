// @ts-nocheck
/**
 * Mentorship Matching Service
 * 
 * Advanced mentor-mentee matching algorithm with:
 * - Skills and expertise alignment
 * - Career goals matching
 * - Cultural background compatibility
 * - Availability matching
 * - Communication style preferences
 * - Indigenous Elder mentorship prioritization
 * - Experience level appropriate matching
 */

import { prisma } from '../db';
import { logger } from '../lib/logger';
import { redisCache } from '../lib/redisCacheWrapper';

// Types
export interface MentorProfile {
  id: string;
  userId: string;
  name: string;
  avatarUrl?: string;
  expertise: string[];
  industries: string[];
  experienceYears: number;
  currentRole: string;
  company?: string;
  bio?: string;
  mentoringSince?: Date;
  totalMentees: number;
  activeMentees: number;
  maxMentees: number;
  availability: AvailabilitySlot[];
  communicationPreferences: CommunicationPreference[];
  languages: string[];
  location: string;
  timezone: string;
  isIndigenousElder: boolean;
  culturalBackground?: string;
  specializations: string[];
  rating: number;
  reviewCount: number;
  successfulMentorships: number;
}

export interface MenteeProfile {
  id: string;
  userId: string;
  name: string;
  skills: string[];
  currentRole?: string;
  experienceYears: number;
  careerGoals: string[];
  learningObjectives: string[];
  preferredIndustries: string[];
  preferredCommunication: CommunicationPreference[];
  availability: AvailabilitySlot[];
  languages: string[];
  location: string;
  timezone: string;
  isIndigenous: boolean;
  seekingElderMentor: boolean;
  culturalInterests?: string[];
  urgency: 'immediate' | 'within_month' | 'flexible';
}

export interface AvailabilitySlot {
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // HH:MM format
  endTime: string;
}

export type CommunicationPreference = 
  | 'video_call'
  | 'phone_call'
  | 'in_person'
  | 'messaging'
  | 'email';

export interface MentorMatch {
  mentorId: string;
  menteeId: string;
  totalScore: number;
  breakdown: MatchBreakdown;
  matchReasons: string[];
  compatibilityLevel: 'excellent' | 'good' | 'fair' | 'possible';
  availabilityOverlap: number; // hours per week
  sharedLanguages: string[];
  culturalAlignment: number;
  recommended: boolean;
}

export interface MatchBreakdown {
  expertiseMatch: number;
  careerGoalsMatch: number;
  industryMatch: number;
  experienceGap: number;
  availabilityMatch: number;
  communicationMatch: number;
  languageMatch: number;
  locationMatch: number;
  culturalMatch: number;
  elderBonus: number;
  mentorRating: number;
  capacityScore: number;
}

// Scoring weights
const WEIGHTS = {
  expertiseMatch: 25,
  careerGoalsMatch: 20,
  industryMatch: 10,
  experienceGap: 10,
  availabilityMatch: 10,
  communicationMatch: 5,
  languageMatch: 5,
  locationMatch: 5,
  culturalMatch: 5,
  elderBonus: 5, // Extra bonus
  mentorRating: 5
};

class MentorshipMatchingService {
  private static instance: MentorshipMatchingService;

  private constructor() {}

  static getInstance(): MentorshipMatchingService {
    if (!MentorshipMatchingService.instance) {
      MentorshipMatchingService.instance = new MentorshipMatchingService();
    }
    return MentorshipMatchingService.instance;
  }

  /**
   * Find matching mentors for a mentee
   */
  async findMentors(
    menteeUserId: string,
    options: {
      limit?: number;
      minScore?: number;
      prioritizeElders?: boolean;
      industryFilter?: string;
    } = {}
  ): Promise<MentorMatch[]> {
    const {
      limit = 10,
      minScore = 40,
      prioritizeElders = true,
      industryFilter
    } = options;

    try {
      // Get mentee profile
      const menteeProfile = await this.getMenteeProfile(menteeUserId);
      if (!menteeProfile) {
        throw new Error('Mentee profile not found');
      }

      // Get available mentors
      const mentors = await this.getAvailableMentors(industryFilter);

      // Score each mentor
      const matches: MentorMatch[] = [];

      for (const mentor of mentors) {
        const match = this.calculateMatch(menteeProfile, mentor);
        
        if (match.totalScore >= minScore) {
          matches.push(match);
        }
      }

      // Sort by score (with Elder bonus if applicable)
      matches.sort((a, b) => {
        let scoreA = a.totalScore;
        let scoreB = b.totalScore;

        if (prioritizeElders && menteeProfile.seekingElderMentor) {
          scoreA += a.breakdown.elderBonus;
          scoreB += b.breakdown.elderBonus;
        }

        return scoreB - scoreA;
      });

      // Apply limit
      const topMatches = matches.slice(0, limit);

      // Cache results
      await redisCache.set(
        `mentor_matches:${menteeUserId}`,
        topMatches,
        1800 // 30 minutes
      );

      logger.info('Mentor matching completed', {
        menteeId: menteeUserId,
        totalMentors: mentors.length,
        matchedMentors: matches.length,
        returned: topMatches.length
      });

      return topMatches;
    } catch (error) {
      logger.error('Mentor matching failed', { menteeUserId, error });
      throw error;
    }
  }

  /**
   * Get mentee profile
   */
  private async getMenteeProfile(userId: string): Promise<MenteeProfile | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          skills: true,
          menteeProfile: true,
          experience: true
        }
      });

      if (!user) return null;

      const menteeData = user.menteeProfile;

      return {
        id: menteeData?.id || userId,
        userId,
        name: `${user.firstName} ${user.lastName}`,
        skills: user.skills?.map(s => s.name.toLowerCase()) || [],
        currentRole: user.currentRole,
        experienceYears: this.calculateExperienceYears(user.experience || []),
        careerGoals: menteeData?.careerGoals || [],
        learningObjectives: menteeData?.learningObjectives || [],
        preferredIndustries: menteeData?.preferredIndustries || [],
        preferredCommunication: menteeData?.communicationPreferences || ['video_call'],
        availability: menteeData?.availability || [],
        languages: user.languages || ['english'],
        location: user.location || '',
        timezone: user.timezone || 'UTC',
        isIndigenous: user.isIndigenous || false,
        seekingElderMentor: menteeData?.seekingElderMentor || false,
        culturalInterests: menteeData?.culturalInterests || [],
        urgency: menteeData?.urgency || 'flexible'
      };
    } catch (error) {
      logger.error('Failed to get mentee profile', { userId, error });
      return null;
    }
  }

  /**
   * Get available mentors
   */
  private async getAvailableMentors(industryFilter?: string): Promise<MentorProfile[]> {
    try {
      const mentors = await prisma.mentor.findMany({
        where: {
          isActive: true,
          // Has capacity for new mentees
          activeMentees: { lt: prisma.mentor.fields.maxMentees },
          ...(industryFilter && {
            industries: { has: industryFilter }
          })
        },
        include: {
          user: {
            include: {
              skills: true
            }
          },
          reviews: {
            select: { rating: true }
          }
        }
      });

      return mentors.map(mentor => {
        const avgRating = mentor.reviews.length > 0
          ? mentor.reviews.reduce((sum, r) => sum + r.rating, 0) / mentor.reviews.length
          : 4.0;

        return {
          id: mentor.id,
          userId: mentor.userId,
          name: `${mentor.user.firstName} ${mentor.user.lastName}`,
          avatarUrl: mentor.user.avatarUrl,
          expertise: mentor.expertise || [],
          industries: mentor.industries || [],
          experienceYears: mentor.experienceYears || 0,
          currentRole: mentor.user.currentRole || '',
          company: mentor.user.company,
          bio: mentor.bio,
          mentoringSince: mentor.createdAt,
          totalMentees: mentor.totalMentees || 0,
          activeMentees: mentor.activeMentees || 0,
          maxMentees: mentor.maxMentees || 3,
          availability: mentor.availability || [],
          communicationPreferences: mentor.communicationPreferences || ['video_call'],
          languages: mentor.user.languages || ['english'],
          location: mentor.user.location || '',
          timezone: mentor.user.timezone || 'UTC',
          isIndigenousElder: mentor.isIndigenousElder || false,
          culturalBackground: mentor.culturalBackground,
          specializations: mentor.specializations || [],
          rating: avgRating,
          reviewCount: mentor.reviews.length,
          successfulMentorships: mentor.successfulMentorships || 0
        };
      });
    } catch (error) {
      logger.error('Failed to get available mentors', { error });
      return [];
    }
  }

  /**
   * Calculate match score
   */
  private calculateMatch(
    mentee: MenteeProfile,
    mentor: MentorProfile
  ): MentorMatch {
    const breakdown: MatchBreakdown = {
      expertiseMatch: 0,
      careerGoalsMatch: 0,
      industryMatch: 0,
      experienceGap: 0,
      availabilityMatch: 0,
      communicationMatch: 0,
      languageMatch: 0,
      locationMatch: 0,
      culturalMatch: 0,
      elderBonus: 0,
      mentorRating: 0,
      capacityScore: 0
    };

    const matchReasons: string[] = [];

    // 1. Expertise Match (25 points)
    const expertiseScore = this.calculateExpertiseMatch(
      mentee.skills,
      mentee.learningObjectives,
      mentor.expertise,
      mentor.specializations
    );
    breakdown.expertiseMatch = expertiseScore * WEIGHTS.expertiseMatch;

    if (expertiseScore >= 0.7) {
      matchReasons.push('Strong expertise alignment');
    }

    // 2. Career Goals Match (20 points)
    const goalsScore = this.calculateGoalsMatch(
      mentee.careerGoals,
      mentor.expertise,
      mentor.currentRole,
      mentor.industries
    );
    breakdown.careerGoalsMatch = goalsScore * WEIGHTS.careerGoalsMatch;

    if (goalsScore >= 0.6) {
      matchReasons.push('Career goals alignment');
    }

    // 3. Industry Match (10 points)
    const industryScore = this.calculateIndustryMatch(
      mentee.preferredIndustries,
      mentor.industries
    );
    breakdown.industryMatch = industryScore * WEIGHTS.industryMatch;

    if (industryScore >= 0.8) {
      matchReasons.push(`Experience in ${mentor.industries[0] || 'your industry'}`);
    }

    // 4. Experience Gap (10 points)
    const expGapScore = this.calculateExperienceGapScore(
      mentee.experienceYears,
      mentor.experienceYears
    );
    breakdown.experienceGap = expGapScore * WEIGHTS.experienceGap;

    if (expGapScore >= 0.8) {
      matchReasons.push(`${mentor.experienceYears}+ years experience`);
    }

    // 5. Availability Match (10 points)
    const { score: availScore, overlap } = this.calculateAvailabilityMatch(
      mentee.availability,
      mentor.availability,
      mentee.timezone,
      mentor.timezone
    );
    breakdown.availabilityMatch = availScore * WEIGHTS.availabilityMatch;

    if (overlap >= 3) {
      matchReasons.push('Good schedule overlap');
    }

    // 6. Communication Match (5 points)
    const commScore = this.calculateCommunicationMatch(
      mentee.preferredCommunication,
      mentor.communicationPreferences
    );
    breakdown.communicationMatch = commScore * WEIGHTS.communicationMatch;

    // 7. Language Match (5 points)
    const langScore = this.calculateLanguageMatch(
      mentee.languages,
      mentor.languages
    );
    breakdown.languageMatch = langScore * WEIGHTS.languageMatch;
    
    const sharedLanguages = mentee.languages.filter(l => 
      mentor.languages.includes(l)
    );

    // 8. Location Match (5 points)
    const locScore = this.calculateLocationMatch(
      mentee.location,
      mentor.location
    );
    breakdown.locationMatch = locScore * WEIGHTS.locationMatch;

    if (locScore >= 0.8) {
      matchReasons.push('Same location/region');
    }

    // 9. Cultural Match (5 points)
    const culturalScore = this.calculateCulturalMatch(
      mentee.isIndigenous,
      mentee.seekingElderMentor,
      mentee.culturalInterests || [],
      mentor.isIndigenousElder,
      mentor.culturalBackground
    );
    breakdown.culturalMatch = culturalScore * WEIGHTS.culturalMatch;

    // 10. Elder Bonus (extra 5 points)
    if (mentee.seekingElderMentor && mentor.isIndigenousElder) {
      breakdown.elderBonus = WEIGHTS.elderBonus;
      matchReasons.push('Indigenous Elder mentor');
    }

    // 11. Mentor Rating (5 points)
    breakdown.mentorRating = (mentor.rating / 5) * WEIGHTS.mentorRating;

    if (mentor.rating >= 4.5) {
      matchReasons.push(`Highly rated (${mentor.rating.toFixed(1)}★)`);
    }

    // Calculate capacity score (affects final ranking)
    const capacityRatio = mentor.activeMentees / mentor.maxMentees;
    breakdown.capacityScore = 1 - capacityRatio; // More capacity = better

    // Calculate total score
    const totalScore = Math.round(
      breakdown.expertiseMatch +
      breakdown.careerGoalsMatch +
      breakdown.industryMatch +
      breakdown.experienceGap +
      breakdown.availabilityMatch +
      breakdown.communicationMatch +
      breakdown.languageMatch +
      breakdown.locationMatch +
      breakdown.culturalMatch +
      breakdown.mentorRating
    );

    // Determine compatibility level
    let compatibilityLevel: MentorMatch['compatibilityLevel'];
    if (totalScore >= 80) compatibilityLevel = 'excellent';
    else if (totalScore >= 60) compatibilityLevel = 'good';
    else if (totalScore >= 45) compatibilityLevel = 'fair';
    else compatibilityLevel = 'possible';

    return {
      mentorId: mentor.id,
      menteeId: mentee.id,
      totalScore,
      breakdown,
      matchReasons,
      compatibilityLevel,
      availabilityOverlap: overlap,
      sharedLanguages,
      culturalAlignment: culturalScore * 100,
      recommended: totalScore >= 60
    };
  }

  /**
   * Calculate expertise match
   */
  private calculateExpertiseMatch(
    menteeSkills: string[],
    learningObjectives: string[],
    mentorExpertise: string[],
    specializations: string[]
  ): number {
    const allMentorSkills = [...mentorExpertise, ...specializations]
      .map(s => s.toLowerCase());

    // Match learning objectives to mentor expertise
    let objectiveMatches = 0;
    for (const objective of learningObjectives) {
      const keywords = objective.toLowerCase().split(/\s+/);
      if (keywords.some(kw => allMentorSkills.some(ms => ms.includes(kw)))) {
        objectiveMatches++;
      }
    }

    const objectiveScore = learningObjectives.length > 0
      ? objectiveMatches / learningObjectives.length
      : 0.5;

    // Match mentee skills to mentor expertise (mentor should know what mentee is learning)
    let skillMatches = 0;
    for (const skill of menteeSkills) {
      if (allMentorSkills.some(ms => 
        ms.includes(skill) || skill.includes(ms)
      )) {
        skillMatches++;
      }
    }

    const skillScore = menteeSkills.length > 0
      ? skillMatches / menteeSkills.length
      : 0.5;

    return objectiveScore * 0.6 + skillScore * 0.4;
  }

  /**
   * Calculate goals match
   */
  private calculateGoalsMatch(
    careerGoals: string[],
    mentorExpertise: string[],
    mentorRole: string,
    mentorIndustries: string[]
  ): number {
    if (careerGoals.length === 0) return 0.5;

    let matches = 0;
    const mentorContext = [
      ...mentorExpertise,
      mentorRole,
      ...mentorIndustries
    ].join(' ').toLowerCase();

    for (const goal of careerGoals) {
      const goalWords = goal.toLowerCase().split(/\s+/);
      if (goalWords.some(word => mentorContext.includes(word))) {
        matches++;
      }
    }

    return matches / careerGoals.length;
  }

  /**
   * Calculate industry match
   */
  private calculateIndustryMatch(
    preferredIndustries: string[],
    mentorIndustries: string[]
  ): number {
    if (preferredIndustries.length === 0) return 0.7; // Neutral

    const matches = preferredIndustries.filter(pi =>
      mentorIndustries.some(mi => 
        mi.toLowerCase() === pi.toLowerCase()
      )
    );

    return matches.length / preferredIndustries.length;
  }

  /**
   * Calculate experience gap score
   * Ideal: Mentor has 5-15 years more experience than mentee
   */
  private calculateExperienceGapScore(
    menteeYears: number,
    mentorYears: number
  ): number {
    const gap = mentorYears - menteeYears;

    // Ideal gap is 5-15 years
    if (gap >= 5 && gap <= 15) return 1;
    if (gap >= 3 && gap < 5) return 0.8;
    if (gap >= 15 && gap <= 20) return 0.8;
    if (gap >= 1 && gap < 3) return 0.5;
    if (gap > 20) return 0.6; // Very experienced, still valuable
    if (gap < 1) return 0.2; // Not enough experience gap
    
    return 0.5;
  }

  /**
   * Calculate availability match
   */
  private calculateAvailabilityMatch(
    menteeAvail: AvailabilitySlot[],
    mentorAvail: AvailabilitySlot[],
    menteeTimezone: string,
    mentorTimezone: string
  ): { score: number; overlap: number } {
    if (menteeAvail.length === 0 || mentorAvail.length === 0) {
      return { score: 0.5, overlap: 0 };
    }

    // Calculate timezone offset (simplified)
    const tzOffset = this.getTimezoneOffset(menteeTimezone, mentorTimezone);

    let overlapHours = 0;

    for (const menteeSlot of menteeAvail) {
      for (const mentorSlot of mentorAvail) {
        // Same day check
        if (menteeSlot.dayOfWeek === mentorSlot.dayOfWeek) {
          const overlap = this.calculateTimeOverlap(
            menteeSlot,
            mentorSlot,
            tzOffset
          );
          overlapHours += overlap;
        }
      }
    }

    // Ideal is 3+ hours of overlap per week
    const score = Math.min(overlapHours / 3, 1);

    return { score, overlap: overlapHours };
  }

  /**
   * Calculate time overlap between slots
   */
  private calculateTimeOverlap(
    slot1: AvailabilitySlot,
    slot2: AvailabilitySlot,
    tzOffset: number
  ): number {
    const parseTime = (t: string) => {
      const [h, m] = t.split(':').map(Number);
      return h + m / 60;
    };

    const start1 = parseTime(slot1.startTime);
    const end1 = parseTime(slot1.endTime);
    const start2 = parseTime(slot2.startTime) + tzOffset;
    const end2 = parseTime(slot2.endTime) + tzOffset;

    const overlapStart = Math.max(start1, start2);
    const overlapEnd = Math.min(end1, end2);

    return Math.max(0, overlapEnd - overlapStart);
  }

  /**
   * Get timezone offset in hours (simplified)
   */
  private getTimezoneOffset(tz1: string, tz2: string): number {
    // In production, use a proper timezone library
    const offsets: Record<string, number> = {
      'UTC': 0,
      'EST': -5,
      'PST': -8,
      'GMT': 0,
      'AEST': 10,
      'AEDT': 11
    };

    const offset1 = offsets[tz1] || 0;
    const offset2 = offsets[tz2] || 0;

    return offset2 - offset1;
  }

  /**
   * Calculate communication preference match
   */
  private calculateCommunicationMatch(
    menteePrefs: CommunicationPreference[],
    mentorPrefs: CommunicationPreference[]
  ): number {
    const matches = menteePrefs.filter(mp => mentorPrefs.includes(mp));
    return menteePrefs.length > 0 ? matches.length / menteePrefs.length : 0.5;
  }

  /**
   * Calculate language match
   */
  private calculateLanguageMatch(
    menteeLanguages: string[],
    mentorLanguages: string[]
  ): number {
    const matches = menteeLanguages.filter(l => 
      mentorLanguages.map(ml => ml.toLowerCase()).includes(l.toLowerCase())
    );

    // At least one common language required
    if (matches.length === 0) return 0;
    
    return Math.min(matches.length / menteeLanguages.length, 1);
  }

  /**
   * Calculate location match
   */
  private calculateLocationMatch(
    menteeLocation: string,
    mentorLocation: string
  ): number {
    if (!menteeLocation || !mentorLocation) return 0.5;

    const normalize = (s: string) => s.toLowerCase().trim();
    const m1 = normalize(menteeLocation);
    const m2 = normalize(mentorLocation);

    // Same location
    if (m1 === m2) return 1;

    // Same city/region
    if (m1.includes(m2) || m2.includes(m1)) return 0.8;

    // Different locations but could meet virtually
    return 0.5;
  }

  /**
   * Calculate cultural match
   */
  private calculateCulturalMatch(
    menteeIsIndigenous: boolean,
    seekingElderMentor: boolean,
    culturalInterests: string[],
    mentorIsElder: boolean,
    mentorCulturalBackground?: string
  ): number {
    let score = 0.5; // Baseline

    // Indigenous mentee seeking Elder mentor
    if (menteeIsIndigenous && seekingElderMentor && mentorIsElder) {
      score = 1;
    } else if (menteeIsIndigenous && mentorIsElder) {
      score = 0.9;
    }

    // Cultural background alignment
    if (mentorCulturalBackground && culturalInterests.length > 0) {
      const bgWords = mentorCulturalBackground.toLowerCase().split(/\s+/);
      const matches = culturalInterests.filter(ci =>
        bgWords.some(w => ci.toLowerCase().includes(w))
      );
      if (matches.length > 0) {
        score = Math.max(score, 0.7 + (matches.length / culturalInterests.length) * 0.3);
      }
    }

    return score;
  }

  /**
   * Calculate experience years
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
   * Request mentorship
   */
  async requestMentorship(
    menteeUserId: string,
    mentorId: string,
    message: string
  ): Promise<{ requestId: string }> {
    try {
      const request = await prisma.mentorshipRequest.create({
        data: {
          menteeId: menteeUserId,
          mentorId,
          message,
          status: 'PENDING'
        }
      });

      logger.info('Mentorship request created', {
        requestId: request.id,
        menteeId: menteeUserId,
        mentorId
      });

      return { requestId: request.id };
    } catch (error) {
      logger.error('Failed to create mentorship request', {
        menteeUserId,
        mentorId,
        error
      });
      throw error;
    }
  }

  /**
   * Get recommended mentors (quick recommendations)
   */
  async getRecommendedMentors(
    menteeUserId: string,
    limit: number = 5
  ): Promise<MentorProfile[]> {
    // Try cache first
    const cached = await redisCache.get<MentorMatch[]>(`mentor_matches:${menteeUserId}`);
    
    if (cached && cached.length > 0) {
      const mentorIds = cached.slice(0, limit).map(m => m.mentorId);
      const mentors = await this.getAvailableMentors();
      return mentors.filter(m => mentorIds.includes(m.id));
    }

    // Calculate fresh matches
    const matches = await this.findMentors(menteeUserId, { limit });
    const mentorIds = matches.map(m => m.mentorId);
    const mentors = await this.getAvailableMentors();
    
    return mentors.filter(m => mentorIds.includes(m.id));
  }
}

// Export singleton
export const mentorshipMatchingService = MentorshipMatchingService.getInstance();

