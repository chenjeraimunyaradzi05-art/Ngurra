# Performance Optimization Guide

Guide for optimizing performance across the Ngurra Pathways platform.

## Table of Contents

- [Overview](#overview)
- [Frontend Performance](#frontend-performance)
- [Backend Performance](#backend-performance)
- [Database Optimization](#database-optimization)
- [Caching Strategies](#caching-strategies)
- [Asset Optimization](#asset-optimization)
- [Monitoring](#monitoring)
- [Testing](#testing)
- [Checklists](#checklists)

## Overview

### Performance Goals

| Metric | Target | Current |
|--------|--------|---------|
| First Contentful Paint (FCP) | < 1.5s | - |
| Largest Contentful Paint (LCP) | < 2.5s | - |
| First Input Delay (FID) | < 100ms | - |
| Cumulative Layout Shift (CLS) | < 0.1 | - |
| Time to First Byte (TTFB) | < 200ms | - |
| API Response Time (p95) | < 500ms | - |

## Frontend Performance

### Code Splitting

```typescript
// Dynamic imports for route-based splitting
const JobsPage = dynamic(() => import('@/app/jobs/page'), {
  loading: () => <Skeleton />,
});

// Component-level splitting
const HeavyChart = dynamic(() => import('@/components/AnalyticsChart'), {
  ssr: false,
  loading: () => <ChartSkeleton />,
});
```

### React Optimization

```tsx
// Use React.memo for pure components
const JobCard = React.memo(function JobCard({ job }: { job: Job }) {
  return (
    <div className="job-card">
      <h3>{job.title}</h3>
      <p>{job.company}</p>
    </div>
  );
});

// Use useMemo for expensive calculations
const filteredJobs = useMemo(() => {
  return jobs.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
}, [jobs, searchTerm]);

// Use useCallback for stable function references
const handleClick = useCallback((id: string) => {
  router.push(`/jobs/${id}`);
}, [router]);
```

### Virtual Lists

For long lists, use virtualization:

```tsx
import { FixedSizeList } from 'react-window';

function JobList({ jobs }: { jobs: Job[] }) {
  const Row = ({ index, style }) => (
    <div style={style}>
      <JobCard job={jobs[index]} />
    </div>
  );

  return (
    <FixedSizeList
      height={600}
      itemCount={jobs.length}
      itemSize={120}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  );
}
```

### Image Optimization

```tsx
import Image from 'next/image';

// Always use Next.js Image component
<Image
  src={job.company.logo}
  alt={`${job.company.name} logo`}
  width={64}
  height={64}
  loading="lazy"
  placeholder="blur"
  blurDataURL={shimmer(64, 64)}
/>

// For hero images, use priority
<Image
  src="/hero.jpg"
  alt="Hero image"
  fill
  priority
  sizes="100vw"
/>
```

### Bundle Analysis

```bash
# Analyze bundle size
pnpm --filter web analyze

# View bundle composition
npx @next/bundle-analyzer
```

### Prefetching

```tsx
// Prefetch on hover
<Link href="/jobs" prefetch={false}>
  Jobs
</Link>

// Programmatic prefetch
router.prefetch('/jobs');
```

## Backend Performance

### Request Processing

```typescript
// Use streaming for large responses
app.get('/api/export', async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Transfer-Encoding', 'chunked');
  
  const cursor = await prisma.job.findMany({
    cursor: true,
    take: 100,
  });
  
  for await (const batch of cursor) {
    res.write(JSON.stringify(batch));
  }
  
  res.end();
});

// Use compression
import compression from 'compression';
app.use(compression());
```

### Async Operations

```typescript
// Use Promise.all for independent operations
const [jobs, companies, stats] = await Promise.all([
  prisma.job.findMany({ take: 10 }),
  prisma.company.findMany({ take: 5 }),
  getStats(),
]);

// Use Promise.allSettled when failures are acceptable
const results = await Promise.allSettled([
  sendEmail(),
  sendNotification(),
  logAnalytics(),
]);
```

### Connection Pooling

```typescript
// Prisma connection pool
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  // Configure connection pool
  log: ['query', 'info', 'warn', 'error'],
});

// Redis connection pool
const redis = new Redis({
  host: process.env.REDIS_HOST,
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: true,
});
```

## Database Optimization

### Indexing

```sql
-- Essential indexes
CREATE INDEX CONCURRENTLY idx_jobs_status ON jobs(status) WHERE status = 'active';
CREATE INDEX CONCURRENTLY idx_jobs_company_id ON jobs(company_id);
CREATE INDEX CONCURRENTLY idx_applications_user_job ON applications(user_id, job_id);
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);

-- Full-text search index
CREATE INDEX CONCURRENTLY idx_jobs_search ON jobs 
USING GIN (to_tsvector('english', title || ' ' || description));

-- Composite indexes for common queries
CREATE INDEX CONCURRENTLY idx_jobs_location_type_status 
ON jobs(location_type, status, created_at DESC);
```

### Query Optimization

```typescript
// Use select to limit returned fields
const jobs = await prisma.job.findMany({
  select: {
    id: true,
    title: true,
    company: {
      select: {
        name: true,
        logo: true,
      },
    },
  },
});

// Use pagination
const jobs = await prisma.job.findMany({
  take: 20,
  skip: (page - 1) * 20,
  orderBy: { createdAt: 'desc' },
});

// Use cursor-based pagination for large datasets
const jobs = await prisma.job.findMany({
  take: 20,
  cursor: { id: lastId },
  orderBy: { id: 'asc' },
});
```

### N+1 Query Prevention

```typescript
// ❌ Bad - N+1 queries
const jobs = await prisma.job.findMany();
for (const job of jobs) {
  job.company = await prisma.company.findUnique({
    where: { id: job.companyId },
  });
}

// ✅ Good - Include relations
const jobs = await prisma.job.findMany({
  include: {
    company: {
      select: { name: true, logo: true },
    },
  },
});
```

### Query Analysis

```sql
-- Analyze query performance
EXPLAIN ANALYZE
SELECT * FROM jobs 
WHERE status = 'active' 
ORDER BY created_at DESC 
LIMIT 20;

-- Find slow queries
SELECT query, mean_time, calls
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

## Caching Strategies

### Cache Hierarchy

```
Browser Cache → CDN → Redis → Application → Database
     ↑           ↑       ↑
   Static     Dynamic   Hot Data
   Assets     Content   
```

### Redis Caching

```typescript
import { cache, cacheKeys, getCacheStats } from '@/lib/cache';

// Cache job listings
const jobs = await cache.getOrSet(
  cacheKeys.jobs('active', 1),
  async () => prisma.job.findMany({ where: { status: 'active' }, take: 20 }),
  300 // 5 minute TTL
);

// Cache user profile
const profile = await cache.getOrSet(
  cacheKeys.user(userId),
  async () => prisma.user.findUnique({ where: { id: userId } }),
  3600 // 1 hour TTL
);

// Invalidate on update
await prisma.job.update({ where: { id }, data });
await cache.delete(cacheKeys.job(id));
await cache.deletePattern(`jobs:*`);
```

### HTTP Caching

```typescript
// Set cache headers
res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=30');
res.setHeader('ETag', etag);

// Static assets (1 year)
res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');

// Private data
res.setHeader('Cache-Control', 'private, no-cache');
```

### CDN Configuration

```javascript
// next.config.js
module.exports = {
  images: {
    domains: ['cdn.ngurra-pathways.com'],
    loader: 'cloudflare',
  },
  async headers() {
    return [
      {
        source: '/api/jobs',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=60, stale-while-revalidate=30',
          },
        ],
      },
    ];
  },
};
```

## Asset Optimization

### Images

```bash
# Optimize images
pnpm run optimize-images

# Generate responsive sizes
# Images should be served at:
# - 320w, 640w, 1024w, 1280w, 1920w
```

### Fonts

```tsx
// Use next/font for optimal loading
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
});
```

### CSS

```javascript
// tailwind.config.js - Purge unused styles
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  // This ensures only used classes are included
};
```

### JavaScript

```javascript
// next.config.js
module.exports = {
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};
```

## Monitoring

### Real User Monitoring (RUM)

```typescript
// Track Web Vitals
import { getCLS, getFID, getLCP, getFCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric) {
  analytics.track('web_vital', {
    name: metric.name,
    value: metric.value,
    id: metric.id,
  });
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getLCP(sendToAnalytics);
getFCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

### APM Integration

```typescript
// Sentry performance monitoring
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  tracesSampleRate: 0.1,
  profilesSampleRate: 0.1,
});
```

### Custom Metrics

```typescript
// API response time tracking
app.use((req, res, next) => {
  const start = process.hrtime.bigint();
  
  res.on('finish', () => {
    const duration = Number(process.hrtime.bigint() - start) / 1e6;
    metrics.record('api.response_time', duration, {
      method: req.method,
      path: req.path,
      status: res.statusCode,
    });
  });
  
  next();
});
```

## Testing

### Load Testing

```bash
# Run k6 load test
k6 run apps/api/tests/load/load-test.js

# Run Artillery load test
artillery run apps/api/tests/load/artillery.yml
```

### Performance Benchmarks

```typescript
// vitest.config.ts - Enable benchmarks
export default defineConfig({
  test: {
    benchmark: {
      include: ['**/*.bench.ts'],
    },
  },
});

// Example benchmark
describe('Performance', () => {
  bench('parse 1000 jobs', () => {
    parseJobs(largeDataset);
  });
});
```

### Lighthouse CI

```yaml
# .github/workflows/lighthouse.yml
- name: Lighthouse CI
  uses: treosh/lighthouse-ci-action@v10
  with:
    urls: |
      https://staging.ngurra-pathways.com/
      https://staging.ngurra-pathways.com/jobs
    budgetPath: ./lighthouse-budget.json
```

## Checklists

### Pre-Deploy Checklist

- [ ] Bundle size < 200KB (gzipped)
- [ ] No unused dependencies
- [ ] Images optimized
- [ ] Cache headers configured
- [ ] Database indexes verified
- [ ] Load test passed
- [ ] No N+1 queries
- [ ] Error boundaries in place

### Performance Review Checklist

- [ ] Lighthouse score > 90
- [ ] FCP < 1.5s
- [ ] LCP < 2.5s
- [ ] FID < 100ms
- [ ] CLS < 0.1
- [ ] API p95 < 500ms
- [ ] Memory leaks checked
- [ ] Database query times reviewed

### Quick Wins

1. **Enable compression** - Reduces payload by 70%+
2. **Add caching headers** - Reduces repeat requests
3. **Use CDN for assets** - Reduces latency globally
4. **Optimize images** - Often largest payload
5. **Lazy load below-fold** - Faster initial paint
6. **Add database indexes** - 10-100x query speedup
7. **Use connection pooling** - Reduces connection overhead
8. **Implement pagination** - Limits data transfer
