# Phase 3: Analytics, Optimization & Engagement

With Phase 2 (Video & Billing) initialized, Phase 3 focuses on **Data Intelligence, Performance Optimization, and User Engagement loops**.

## 1. Analytics & Insights (Sprint 1)

**Goal:** Provide actionable insights to Company, Institution, and Admin users.

### Backend (TimescaleDB / Postgres Aggregations)

- [x] Implement `AnalyticsService` for aggregating stats (job views, clicks, applications).
  - `apps/api/src/services/analyticsService.ts` (813 lines, comprehensive)
- [x] Create `POST /api/events` endpoint for tracking custom user events.
  - `apps/api/src/routes/analytics.ts` (POST /analytics/events)
- [x] Add `JobPerformance` model to track daily engagement capabilities.
  - `apps/api/prisma/schema.prisma` (JobPerformance model)
  - `apps/api/src/services/jobPerformanceService.ts`
  - `apps/api/src/routes/job-performance.ts`
- [x] **Data Sovereignty:** Ensure Indigenous data metrics are isolated and reportable.
  - Cohort analytics in `/analytics/admin/cohorts` with mobNation segmentation

### Frontend (Charts & Graphs)

- [x] **Admin Dashboard:** Overview of platform health, revenue, and growth.
  - `apps/api/src/routes/analytics-dashboard.ts` (admin endpoints)
- [x] **Employer Dashboard:** "Candidate Funnel" visualization (Views -> Applied -> Recommended).
  - `apps/api/src/routes/analytics-employer.ts`
  - `apps/api/src/routes/job-performance.ts` (employer/dashboard)
- [x] **Mentor Dashboard:** Session hours, ratings trend, and impact summary.
  - `apps/api/src/routes/analytics-dashboard.ts` (mentor endpoints)

## 2. Performance & SEO Optimization (Sprint 2)

**Goal:** Achieve Core Web Vitals "Green" status and maximize search visibility for job listings.

### Performance

- [x] **Image Optimization:** Implement Cloudinary auto-format/quality with Next.js Image.
  - `apps/web/src/components/ui/OptimizedImage.tsx`
  - `apps/web/src/lib/cloudinary.ts`
  - `apps/web/.env.example` (Cloudinary env placeholders)
- [x] **Code Splitting:** Analyze bundle with `@next/bundle-analyzer` and optimize chunks.
  - `apps/web/next.config.js` (bundle analyzer enabled via ANALYZE=true)
  - `apps/web/package.json` (build:analyze script)
- [x] **Caching Strategy:** Implement Redis caching for public job listings (`/jobs`).
  - `apps/api/src/routes/jobs.ts` (cache.get/set with 5-min TTL)
  - `apps/api/src/lib/redisCache.ts` (delPattern for cache invalidation)

### SEO

- [x] **Structured Data:** Add JSON-LD for `JobPosting`, `Course`, and `Event`.
  - `apps/web/src/lib/seo.ts` (generateJobStructuredData, generateCourseStructuredData, generateEventStructuredData)
- [x] **Sitemaps:** Dynamic sitemap generation for all public listings.
  - `apps/web/next-sitemap.config.js` (static config)
  - `apps/api/src/routes/sitemap.ts` (API endpoints for dynamic data)
- [x] **OG Tags:** Dynamic OpenGraph image generation for social sharing.
  - `apps/web/src/lib/seo.ts` (generateSEOMetadata with OG tags)

## 3. Engagement Loops (Sprint 3)

**Goal:** Increase retention via gamification and community features.

### Community

- [x] **Forums:** threaded discussions with upvoting (Reddit-style).
  - `apps/api/src/routes/forums.ts` (full implementation with upvoting)
- [x] **Events System:** Calendar integration for Community/Cultural events.
  - `apps/api/src/routes/cultural-events.ts`
  - `apps/api/src/routes/calendar.ts` (Google Calendar integration)

### Gamification

- [x] **Badges System:** "Early Adopter," "Top Mentor," "Verified Mob."
  - `apps/api/src/routes/gamification.ts`
  - `apps/api/src/routes/badges.ts`
- [x] **Streaks:** Daily login/learning streaks for students.
  - `apps/api/src/routes/gamification.ts` (GET /streak, POST /streak/update)

---

## Implementation Summary

### Phase 3 Status: ✅ COMPLETE

All backend features for Phase 3 have been implemented:

- Analytics service with comprehensive metrics tracking
- Job performance tracking with daily aggregations
- Redis caching for public endpoints
- JSON-LD structured data for SEO
- Dynamic sitemap API endpoints
- Forums with upvoting
- Cultural events calendar
- Gamification with badges and streaks

**Remaining Frontend Tasks:**

- Dashboard UI components for analytics visualization
