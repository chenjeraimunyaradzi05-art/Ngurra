/**
 * @ngurra/types
 * 
 * Shared TypeScript types for Ngurra Pathways Platform.
 * This package ensures type consistency across API, Web, and Mobile apps.
 */

// ==========================================
// Enums (must match Prisma schema)
// ==========================================

export enum UserType {
  MEMBER = 'MEMBER',
  COMPANY = 'COMPANY',
  GOVERNMENT = 'GOVERNMENT',
  INSTITUTION = 'INSTITUTION',
  FIFO = 'FIFO',
  MENTOR = 'MENTOR',
  TAFE = 'TAFE',
  ADMIN = 'ADMIN',
}

export enum JobType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  CONTRACT = 'CONTRACT',
  CASUAL = 'CASUAL',
  APPRENTICESHIP = 'APPRENTICESHIP',
  TRAINEESHIP = 'TRAINEESHIP',
}

export enum JobStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  CLOSED = 'CLOSED',
  FILLED = 'FILLED',
}

export enum ApplicationStatus {
  SUBMITTED = 'SUBMITTED',
  VIEWED = 'VIEWED',
  SHORTLISTED = 'SHORTLISTED',
  INTERVIEW = 'INTERVIEW',
  OFFERED = 'OFFERED',
  HIRED = 'HIRED',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN',
}

export enum MentorSessionStatus {
  SCHEDULED = 'SCHEDULED',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

// ==========================================
// Base Entities
// ==========================================

export interface User {
  id: string;
  email: string;
  userType: UserType;
  createdAt: string;
  updatedAt: string;
  twoFactorEnabled?: boolean;
  lastLoginAt?: string;
  // Profile data varies by userType
  memberProfile?: MemberProfile;
  companyProfile?: CompanyProfile;
  mentorProfile?: MentorProfile;
}

export interface MemberProfile {
  id: string;
  userId: string;
  phone?: string;
  mobNation?: string;
  skillLevel?: string;
  careerInterest?: string;
  bio?: string;
  profileCompletionPercent: number;
  profileViews: number;
  applicationCount: number;
}

export interface CompanyProfile {
  id: string;
  userId: string;
  companyName: string;
  abn?: string;
  industry: string;
  description?: string;
  website?: string;
  logo?: string;
  address?: string;
  city?: string;
  state?: string;
  postcode?: string;
  phone?: string;
  hrEmail?: string;
  isVerified: boolean;
  rapCertificationLevel?: string;
  rapPoints: number;
}

export interface MentorProfile {
  id: string;
  userId: string;
  name?: string;
  title?: string;
  phone?: string;
  expertise?: string;
  skills?: string;
  industry?: string;
  location?: string;
  avatar?: string;
  bio?: string;
  availability?: string;
  active: boolean;
  maxCapacity: number;
}

export interface Job {
  id: string;
  userId: string;
  title: string;
  slug?: string;
  description: string;
  location?: string;
  employment?: JobType | string;
  salaryLow?: number;
  salaryHigh?: number;
  isActive: boolean;
  isFeatured: boolean;
  viewCount: number;
  postedAt: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
  // Relations
  user?: User;
  applications?: Application[];
}

export interface Application {
  id: string;
  jobId: string;
  userId: string;
  resumeId?: string;
  coverLetter?: string;
  status: ApplicationStatus | string;
  scheduledAt?: string;
  createdAt: string;
  updatedAt: string;
  // Relations
  job?: Job;
  user?: User;
}

export interface MentorSession {
  id: string;
  mentorId: string;
  menteeId: string;
  scheduledAt: string;
  duration: number;
  status: MentorSessionStatus | string;
  topic?: string;
  location?: string;
  notes?: string;
  feedback?: string;
  rating?: number;
  videoUrl?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Course {
  id: string;
  title: string;
  description?: string;
  category?: string;
  duration?: string;
  qualification?: string;
  industry?: string;
  providerId?: string;
  providerName?: string;
  priceInCents?: number;
  location?: string;
  isOnline: boolean;
  isActive: boolean;
  skills?: string;
  url?: string;
  externalUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CourseEnrolment {
  id: string;
  userId: string;
  courseId: string;
  status: string;
  progress: number;
  enrolledAt: string;
  completedAt?: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  data?: string;
  read: boolean;
  createdAt: string;
}

// ==========================================
// API Response Types
// ==========================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface DashboardMetrics {
  totalJobs: number;
  activeApplications: number;
  profileViews: number;
  savedJobs: number;
  upcomingSessions: number;
  completedCourses: number;
}

// ==========================================
// Auth Types
// ==========================================

export interface LoginRequest {
  email: string;
  password: string;
  twoFactorToken?: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken?: string;
  requires2FA?: boolean;
  tempToken?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  userType: UserType;
  name?: string;
}

export interface RegisterResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// ==========================================
// Filter/Search Types
// ==========================================

export interface JobFilters {
  search?: string;
  location?: string;
  jobType?: JobType | string;
  industry?: string;
  salaryMin?: number;
  salaryMax?: number;
  remote?: boolean;
  featured?: boolean;
  page?: number;
  limit?: number;
}

export interface CourseFilters {
  search?: string;
  category?: string;
  industry?: string;
  isOnline?: boolean;
  priceMin?: number;
  priceMax?: number;
  page?: number;
  limit?: number;
}

export interface MentorFilters {
  search?: string;
  industry?: string;
  skills?: string;
  location?: string;
  available?: boolean;
  page?: number;
  limit?: number;
}
