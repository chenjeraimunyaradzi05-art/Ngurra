# API Architecture Documentation

## Overview

This document describes the architecture of the Ngurra Pathways API, built with Express.js, Prisma ORM, and TypeScript.

## Directory Structure

```
apps/api/
├── src/
│   ├── config/          # Configuration files
│   ├── lib/             # Utility libraries
│   ├── middleware/      # Express middleware
│   ├── routes/          # API route handlers
│   ├── services/        # Business logic services
│   ├── types/           # TypeScript type definitions
│   └── index.ts         # Application entry point
├── tests/
│   ├── unit/            # Unit tests
│   ├── integration/     # Integration tests
│   └── fixtures/        # Test fixtures
├── prisma/
│   └── schema.prisma    # Database schema
└── package.json
```

## Core Components

### 1. Services Layer

Services contain the core business logic, separated from HTTP concerns.

```typescript
// Example: AuthService
import { AuthService } from './services/AuthService';

const authService = new AuthService(prisma);
const tokens = await authService.login(email, password);
```

**Available Services:**
- `AuthService` - Authentication and authorization
- `JobService` - Job listing management
- `emailService` - Email sending
- `queueService` - Background job processing

### 2. Middleware

Middleware functions handle cross-cutting concerns.

```typescript
import { authenticate, authorize } from './middleware';

// Protected route
router.get('/profile', authenticate(), getProfile);

// Role-based access
router.delete('/users/:id', authenticate(), authorize('admin'), deleteUser);
```

**Available Middleware:**
- `authenticate()` - JWT verification
- `authorize(...roles)` - Role-based access control
- `optionalAuth()` - Optional authentication
- `selfOrAdmin(param)` - Self or admin access
- `requestLogger()` - Request logging

### 3. Utilities (lib/)

Reusable utility functions and helpers.

**Security:**
- `encryption` - AES-256-GCM encryption
- `apiKey` - API key management
- `csrf` - CSRF protection
- `sanitize` - Input sanitization

**Error Handling:**
- `errors` - Structured error classes
- `validation` - Zod validation schemas

**Infrastructure:**
- `rateLimit` - Rate limiting with Redis
- `session` - Session management
- `audit` - Audit logging
- `retry` - Retry with backoff

### 4. Routes

Route handlers define API endpoints.

```typescript
// routes/jobs.ts
import { Router } from 'express';
import { authenticate } from '../middleware';
import { createJobSchema } from '../lib/validation';

const router = Router();

router.get('/', listJobs);
router.post('/', authenticate(), authorize('employer'), validateBody(createJobSchema), createJob);
router.get('/:id', getJob);

export default router;
```

## Request Flow

```
Request
  │
  ▼
┌─────────────┐
│   Helmet    │  Security headers
└──────┬──────┘
       │
       ▼
┌─────────────┐
│    CORS     │  Cross-origin control
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Rate Limit │  Request throttling
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Logger    │  Request logging
└──────┬──────┘
       │
       ▼
┌─────────────┐
│    Auth     │  JWT verification
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Validate   │  Input validation
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Route     │  Business logic
└──────┬──────┘
       │
       ▼
Response
```

## Database Access

### Prisma Client

```typescript
import { prisma } from './lib/database';

// Find user
const user = await prisma.user.findUnique({
  where: { id: userId },
  include: { profile: true },
});

// Create job
const job = await prisma.job.create({
  data: {
    title: 'Software Engineer',
    company: { connect: { id: companyId } },
  },
});
```

### Transactions

```typescript
import { prisma } from './lib/database';

await prisma.$transaction(async (tx) => {
  const user = await tx.user.create({ data: userData });
  await tx.profile.create({
    data: { userId: user.id, ...profileData },
  });
});
```

## Error Handling

### Error Classes

```typescript
import { 
  BadRequestError, 
  NotFoundError, 
  UnauthorizedError 
} from './lib/errors';

// Throw structured errors
throw new NotFoundError('Job not found');
throw new BadRequestError('Invalid email format');
throw new UnauthorizedError('Invalid credentials');
```

### Error Handler Middleware

```typescript
import { errorHandler } from './lib/errors';

// Add at the end of middleware chain
app.use(errorHandler);
```

## Authentication

### JWT Flow

```
Client                    API
  │                        │
  │  POST /auth/login     │
  │  {email, password}    │
  ├───────────────────────►│
  │                        │  Verify credentials
  │  {accessToken,        │
  │   refreshToken}       │
  │◄───────────────────────┤
  │                        │
  │  GET /protected       │
  │  Authorization: Bearer│
  ├───────────────────────►│
  │                        │  Verify JWT
  │  {data}               │
  │◄───────────────────────┤
```

### Token Structure

```json
{
  "userId": "clx123...",
  "email": "user@example.com",
  "role": "candidate",
  "iat": 1234567890,
  "exp": 1234571490
}
```

## Background Jobs

### Queue System

```typescript
import { queueEmail, queueNotification } from './services/queue';

// Queue email
await queueEmail({
  to: 'user@example.com',
  subject: 'Welcome',
  template: 'welcome',
  data: { name: 'John' },
});

// Queue notification
await queueNotification({
  userId: 'user123',
  type: 'push',
  title: 'New message',
  body: 'You have a new message',
});
```

### Available Queues

| Queue | Purpose |
|-------|---------|
| `email-queue` | Email sending |
| `notification-queue` | Push/SMS notifications |
| `resume-parsing-queue` | Resume PDF parsing |
| `file-processing-queue` | File operations |
| `webhook-queue` | Webhook delivery |
| `scheduled-queue` | Scheduled tasks |

## Testing

### Unit Tests

```bash
npm run test:unit
```

```typescript
// tests/unit/authService.test.ts
import { describe, it, expect } from 'vitest';
import { AuthService } from '../../src/services/AuthService';

describe('AuthService', () => {
  it('should hash passwords correctly', async () => {
    const hashed = await AuthService.hashPassword('password');
    expect(hashed).not.toBe('password');
  });
});
```

### Integration Tests

```bash
npm run test:integration
```

```typescript
// tests/integration/auth.test.ts
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app';

describe('POST /api/auth/login', () => {
  it('should return tokens for valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
  });
});
```

## Performance Considerations

### Database Indexes

See [prisma/indexes.sql](../prisma/indexes.sql) for recommended indexes.

### Caching

```typescript
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

// Cache pattern
async function getCachedUser(id: string) {
  const cached = await redis.get(`user:${id}`);
  if (cached) return JSON.parse(cached);

  const user = await prisma.user.findUnique({ where: { id } });
  await redis.setex(`user:${id}`, 3600, JSON.stringify(user));
  return user;
}
```

### Rate Limiting

```typescript
import { rateLimitTiers } from './lib/rateLimit';

// Apply different limits
router.post('/login', rateLimitTiers.auth, login);
router.get('/jobs', rateLimitTiers.standard, listJobs);
```

## Security

See [SECURITY.md](../../SECURITY.md) for security practices.

### Key Measures

1. **Input Validation** - Zod schemas for all input
2. **SQL Injection** - Prisma parameterized queries
3. **XSS Prevention** - Output encoding, CSP headers
4. **Authentication** - JWT with secure secrets
5. **Rate Limiting** - Redis-backed sliding window
6. **Audit Logging** - All security events logged

## Deployment

### Environment Variables

See [.env.example](../.env.example) for required variables.

### Docker

```bash
docker build -t ngurra-api .
docker run -p 3000:3000 ngurra-api
```

### Health Checks

```bash
# Liveness
curl http://localhost:3000/health/live

# Readiness
curl http://localhost:3000/health/ready
```
