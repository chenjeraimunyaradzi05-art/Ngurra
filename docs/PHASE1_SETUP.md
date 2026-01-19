# Phase 1: Foundation & Infrastructure - Setup Guide

This document outlines the Phase 1 infrastructure enhancements completed for the Ngurra Pathways platform.

## Summary of Changes

### 1. ✅ Dockerized Database (docker-compose.dev.yml)

A new Docker Compose configuration for local development with:

- **PostgreSQL 16** with pgvector extension for AI/semantic search
- **Redis 7** for caching and session management
- **Mailhog** for email testing (profile: tools)
- **MinIO** for S3-compatible local storage (profile: storage)
- **Redis Commander** for Redis debugging (profile: tools)

**Usage:**

```bash
# Start core services (PostgreSQL + Redis)
npm run db:up

# Start with development tools
docker-compose -f docker-compose.dev.yml --profile tools up -d

# View logs
npm run db:logs

# Stop services
npm run db:down
```

### 2. ✅ Prisma Migration to PostgreSQL

Updated `apps/api/prisma/schema.prisma` to use PostgreSQL as the primary database:

- Changed provider from `sqlite` to `postgresql`
- Added native PostgreSQL enums for `UserType`, `JobType`, `JobStatus`, `ApplicationStatus`
- Created `init.sql` for database extensions (uuid-ossp, pgcrypto, vector)

**Migration Steps:**

```bash
npm --prefix apps/api run db:generate   # Generate Prisma client
npm --prefix apps/api run db:migrate    # Run migrations
npm --prefix apps/api run seed          # Seed the database
```

### 3. ✅ Environment Validation (src/lib/env.js)

Created a Zod-based environment validation system that:

- Validates all environment variables on startup
- Provides clear error messages for missing/invalid config
- Fails fast in production, warns in development
- Exports a type-safe `config()` singleton

**Key Variables:**

- `DATABASE_URL` - PostgreSQL connection string (required)
- `JWT_SECRET` or `DEV_JWT_SECRET` - Authentication secret (required)
- `REDIS_URL` - Redis connection (optional but recommended)
- `STRIPE_SECRET_KEY` - Stripe payments (optional)
- `FEATURE_*` - Feature flags

### 4. ✅ Monorepo Optimization (turbo.json)

Enhanced Turborepo configuration with:

- Global dependencies on `.env` and `.env.local`
- Environment variable passthrough for builds
- New tasks: `typecheck`, `db:generate`, `db:migrate`, `db:seed`, `clean`
- Proper caching for test outputs and coverage
- Build-on-demand for E2E tests

### 5. ✅ Structured Logging

The existing logger (`src/lib/logger.js`) already implements:

- Pino-compatible interface with log levels
- JSON output in production, pretty-print in development
- Request/response logging middleware
- Audit trail for sensitive operations
- Child loggers with bindings

### 6. ✅ Enhanced Health Checks (src/routes/health.js)

Upgraded `/health` endpoint with:

- Database connectivity check with latency
- Redis connectivity check
- Memory usage monitoring
- Build version information
- Dependency status endpoint (`/health/dependencies`)

**Endpoints:**

- `GET /health` - Comprehensive health check
- `GET /health/ready` - Kubernetes readiness probe
- `GET /health/live` - Kubernetes liveness probe
- `GET /health/metrics` - Prometheus-compatible metrics
- `GET /health/dependencies` - External service status

### 7. ✅ Redis Integration

The existing `src/lib/redisCache.js` provides:

- Redis-based caching with automatic fallback to in-memory
- TTL-based expiration
- Cache invalidation patterns
- Distributed caching for multi-instance deployments

### 8. ✅ Pre-commit Hooks

Added Husky and lint-staged for code quality:

- ESLint fix on staged `.js`, `.ts`, `.jsx`, `.tsx` files
- Prettier formatting on staged files
- Conventional commit message validation

**Commit Format:**

```text
type(scope): message

Examples:
feat(auth): add two-factor authentication
fix(api): resolve rate limiting issue
docs: update README with setup instructions
```

### 9. ✅ Seed Data Enhancement

Enhanced `prisma/seed.js` with:

- Realistic Australian Indigenous context data
- Multiple mob nations and career interests
- Sample forum categories, badges, courses
- Mentorship circles and sessions
- Success stories and impact metrics

### 10. ✅ API Documentation

Existing documentation system includes:

- OpenAPI 3.0 spec at `openapi.yaml` (3000+ lines)
- Swagger UI at `/docs`
- JSON spec at `/docs/openapi.json`
- YAML spec at `/docs/openapi.yaml`

---

## Quick Start

```bash
# 1. Start Docker services
npm run db:up

# 2. Copy environment template
cp apps/api/.env.example apps/api/.env

# 3. Install dependencies
npm install

# 4. Generate Prisma client
npm --prefix apps/api run db:generate

# 5. Run migrations
npm --prefix apps/api run db:migrate

# 6. Seed the database
npm --prefix apps/api run seed

# 7. Start development servers
npm run dev:api   # API on :3333
npm run dev:web   # Web on :3000
```

## New Scripts

| Script               | Description                           |
| -------------------- | ------------------------------------- |
| `npm run db:up`      | Start PostgreSQL and Redis containers |
| `npm run db:down`    | Stop Docker containers                |
| `npm run db:logs`    | View container logs                   |
| `npm run db:migrate` | Run Prisma migrations                 |
| `npm run db:seed`    | Seed the database                     |
| `npm run db:studio`  | Open Prisma Studio                    |
| `npm run typecheck`  | Run TypeScript type checking          |
| `npm run clean`      | Clean build artifacts                 |

## Environment Variables

See `apps/api/.env.example` for the complete list of configuration options.

---

## Next Steps (Phase 2)

The next phase will focus on:

- Backend core enhancements (auth hardening, input validation)
- Rate limiting with Redis
- File upload improvements
- Standardized pagination
- Transaction management
