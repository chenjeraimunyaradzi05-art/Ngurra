# Database Schema Documentation

## Overview

Ngurra Pathways uses PostgreSQL with Prisma ORM. The database is designed to support an Indigenous employment, education, and mentorship platform.

## Entity Relationship Diagram

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│    User      │────<│  Application │>────│     Job      │
│              │     │              │     │              │
└──────┬───────┘     └──────────────┘     └──────┬───────┘
       │                                         │
       │                                         │
       ▼                                         ▼
┌──────────────┐                         ┌──────────────┐
│   Profile    │                         │   Company    │
│              │                         │              │
└──────────────┘                         └──────────────┘
       │
       │
       ▼
┌──────────────┐     ┌──────────────┐
│   Resume     │     │MentorSession │
│              │     │              │
└──────────────┘     └──────────────┘
```

## Core Models

### User

Primary authentication and identity model.

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  passwordHash  String
  role          Role      @default(CANDIDATE)
  emailVerified Boolean   @default(false)
  isActive      Boolean   @default(true)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  profile       Profile?
  applications  Application[]
  savedJobs     SavedJob[]
  mentorSessions MentorSession[]
  notifications Notification[]
}

enum Role {
  CANDIDATE
  EMPLOYER
  MENTOR
  ADMIN
}
```

**Key Fields:**
- `email` - Unique, used for authentication
- `passwordHash` - Bcrypt hashed password
- `role` - User type for authorization
- `emailVerified` - Email confirmation status

### Profile

Extended user information.

```prisma
model Profile {
  id          String   @id @default(cuid())
  userId      String   @unique
  firstName   String
  lastName    String
  phone       String?
  location    String?
  bio         String?
  avatarUrl   String?
  linkedinUrl String?
  website     String?
  skills      String[] @default([])
  
  // Indigenous-specific fields
  indigenousIdentity    Boolean  @default(false)
  indigenousCommunity   String?
  culturalBackground    String?
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user        User     @relation(fields: [userId], references: [id])
  resume      Resume?
  education   Education[]
  experience  Experience[]
}
```

### Job

Job listings posted by employers.

```prisma
model Job {
  id              String    @id @default(cuid())
  title           String
  description     String    @db.Text
  requirements    String    @db.Text
  responsibilities String   @db.Text
  location        String
  locationType    LocationType @default(ONSITE)
  salary          Decimal?  @db.Decimal(10, 2)
  salaryType      SalaryType?
  employmentType  EmploymentType
  
  // Indigenous considerations
  indigenousPreferred  Boolean @default(false)
  culturalSafetyInfo   String?
  
  companyId       String
  postedById      String
  status          JobStatus @default(DRAFT)
  publishedAt     DateTime?
  expiresAt       DateTime?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  company         Company   @relation(fields: [companyId], references: [id])
  postedBy        User      @relation(fields: [postedById], references: [id])
  applications    Application[]
  savedBy         SavedJob[]
}

enum LocationType {
  ONSITE
  REMOTE
  HYBRID
}

enum EmploymentType {
  FULL_TIME
  PART_TIME
  CONTRACT
  CASUAL
  INTERNSHIP
}

enum JobStatus {
  DRAFT
  PUBLISHED
  CLOSED
  EXPIRED
}
```

### Application

Job applications submitted by candidates.

```prisma
model Application {
  id          String    @id @default(cuid())
  userId      String
  jobId       String
  coverLetter String?   @db.Text
  resumeUrl   String?
  status      ApplicationStatus @default(SUBMITTED)
  notes       String?   @db.Text
  appliedAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  user        User      @relation(fields: [userId], references: [id])
  job         Job       @relation(fields: [jobId], references: [id])
  timeline    ApplicationTimeline[]
}

enum ApplicationStatus {
  SUBMITTED
  REVIEWING
  SHORTLISTED
  INTERVIEW
  OFFERED
  ACCEPTED
  REJECTED
  WITHDRAWN
}
```

### Company

Employer organizations.

```prisma
model Company {
  id          String    @id @default(cuid())
  name        String
  description String?   @db.Text
  website     String?
  logoUrl     String?
  industry    String?
  size        CompanySize?
  location    String?
  
  // Indigenous engagement
  rapStatus   RAPStatus?
  supplyNation Boolean  @default(false)
  
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  jobs        Job[]
  members     CompanyMember[]
}

enum CompanySize {
  SMALL     // 1-49
  MEDIUM    // 50-249
  LARGE     // 250-999
  ENTERPRISE // 1000+
}

enum RAPStatus {
  NONE
  REFLECT
  INNOVATE
  STRETCH
  ELEVATE
}
```

### MentorSession

Mentoring session bookings.

```prisma
model MentorSession {
  id          String    @id @default(cuid())
  mentorId    String
  menteeId    String
  scheduledAt DateTime
  duration    Int       // minutes
  topic       String?
  notes       String?   @db.Text
  status      SessionStatus @default(SCHEDULED)
  meetingUrl  String?
  
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  mentor      User      @relation("MentorSessions", fields: [mentorId], references: [id])
  mentee      User      @relation("MenteeSessions", fields: [menteeId], references: [id])
}

enum SessionStatus {
  SCHEDULED
  COMPLETED
  CANCELLED
  NO_SHOW
}
```

### Course

Educational courses and training.

```prisma
model Course {
  id          String    @id @default(cuid())
  title       String
  description String    @db.Text
  provider    String
  category    String
  duration    String?
  format      CourseFormat
  url         String?
  imageUrl    String?
  isFree      Boolean   @default(false)
  price       Decimal?  @db.Decimal(10, 2)
  
  // Cultural relevance
  culturallyRelevant Boolean @default(false)
  
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  enrollments CourseEnrollment[]
}

enum CourseFormat {
  ONLINE
  IN_PERSON
  HYBRID
  SELF_PACED
}
```

## Indexes

For optimal query performance, the following indexes should be created:

```sql
-- User lookups
CREATE INDEX idx_user_email ON "User"(email);
CREATE INDEX idx_user_role ON "User"(role);

-- Job searches
CREATE INDEX idx_job_status ON "Job"(status);
CREATE INDEX idx_job_company ON "Job"("companyId");
CREATE INDEX idx_job_location ON "Job"(location);
CREATE INDEX idx_job_published ON "Job"("publishedAt" DESC);

-- Full-text search
CREATE INDEX idx_job_search ON "Job" USING gin(
  to_tsvector('english', title || ' ' || description)
);

-- Applications
CREATE INDEX idx_application_user ON "Application"("userId");
CREATE INDEX idx_application_job ON "Application"("jobId");
CREATE INDEX idx_application_status ON "Application"(status);

-- Sessions
CREATE INDEX idx_session_mentor ON "MentorSession"("mentorId");
CREATE INDEX idx_session_mentee ON "MentorSession"("menteeId");
CREATE INDEX idx_session_date ON "MentorSession"("scheduledAt");
```

## Migrations

### Running Migrations

```bash
# Generate migration
npx prisma migrate dev --name add_feature

# Apply migrations
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset
```

### Migration Best Practices

1. **Never modify existing migrations** - Create new migrations instead
2. **Test migrations** on a copy of production data
3. **Use transactions** for data migrations
4. **Backup database** before applying migrations in production

## Seeding

```bash
npx prisma db seed
```

Seed script location: `prisma/seed.ts`

## Data Sovereignty

See [data/sovereignty-store.json](../data/sovereignty-store.json) for Indigenous data sovereignty configuration.

### Principles

1. **Ownership** - Data belongs to the individual/community
2. **Control** - Users control how their data is used
3. **Access** - Right to access all personal data
4. **Possession** - Data stored in Australian jurisdiction

### Implementation

```typescript
// Encrypt sensitive fields
profile.culturalBackground = encrypt(culturalBackground);

// Audit data access
await audit.log('data.accessed', {
  userId: accessedBy,
  resourceType: 'profile',
  resourceId: profileId,
  fields: ['culturalBackground'],
});
```

## Backup Strategy

### Automated Backups

```bash
# Daily backup script
./scripts/backup.sh
```

### Backup Retention

| Type | Frequency | Retention |
|------|-----------|-----------|
| Full | Daily | 30 days |
| Incremental | Hourly | 7 days |
| Point-in-time | Continuous | 24 hours |

### Restore Process

```bash
# Restore from backup
pg_restore -d ngurra_pathways backup_20240101.dump
```
