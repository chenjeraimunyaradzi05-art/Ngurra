# DevOps & Deployment Guide

This document covers the deployment pipeline, infrastructure, and operational procedures for Ngurra Pathways.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Environments](#environments)
- [CI/CD Pipeline](#cicd-pipeline)
- [Docker Setup](#docker-setup)
- [Database Operations](#database-operations)
- [Monitoring & Logging](#monitoring--logging)
- [Troubleshooting](#troubleshooting)

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Load Balancer (nginx)                     │
└─────────────────────────┬───────────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          │               │               │
    ┌─────▼─────┐   ┌─────▼─────┐   ┌─────▼─────┐
    │  Web App  │   │    API    │   │  Worker   │
    │ (Next.js) │   │ (Express) │   │ (BullMQ)  │
    └───────────┘   └─────┬─────┘   └─────┬─────┘
                          │               │
          ┌───────────────┼───────────────┘
          │               │
    ┌─────▼─────┐   ┌─────▼─────┐
    │ PostgreSQL │   │   Redis   │
    │  (Primary) │   │  (Cache)  │
    └───────────┘   └───────────┘
```

## Environments

| Environment | Branch   | URL                              | Purpose          |
|-------------|----------|----------------------------------|------------------|
| Development | `main`   | `localhost:3000/3001`           | Local development |
| Staging     | `staging`| `staging.ngurrapathways.com.au` | Pre-production    |
| Production  | `main`   | `ngurrapathways.com.au`         | Live site         |

### Environment Variables

Required environment variables by service:

#### API Service

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | Yes | `development`, `staging`, `production` |
| `PORT` | No | Server port (default: 3001) |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `REDIS_URL` | No | Redis connection string |
| `JWT_SECRET` | Yes (prod) | JWT signing secret (min 32 chars) |
| `DEV_JWT_SECRET` | Yes (dev) | Development JWT secret |
| `ALLOWED_ORIGINS` | No | Comma-separated allowed CORS origins |
| `SENTRY_DSN` | No | Sentry error tracking DSN |

#### Web Service

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | API base URL |
| `NEXTAUTH_URL` | Yes | NextAuth base URL |
| `NEXTAUTH_SECRET` | Yes | NextAuth secret |

## CI/CD Pipeline

### GitHub Actions Workflows

#### `ci.yml` - Main CI Pipeline

Triggers on push to `main` and pull requests:

1. **Lint & Test Job**
   - Installs dependencies
   - Runs ESLint
   - Generates Prisma client
   - Runs database migrations
   - Executes API tests
   - Builds web app

2. **E2E Tests Job**
   - Sets up test database
   - Starts API and Web servers
   - Runs Playwright tests
   - Uploads test artifacts

#### `security.yml` - Security Audit

Runs on push and weekly schedule:
- Dependency vulnerability audit
- Code security scanning
- License compliance check
- Security headers validation

#### `e2e.yml` - Playwright E2E Tests

Full end-to-end testing with:
- Browser installation
- Database seeding
- Multi-browser testing
- Artifact collection

### Deployment Process

```bash
# 1. Create feature branch
git checkout -b feature/my-feature

# 2. Make changes and commit
git add .
git commit -m "feat: add new feature"

# 3. Push and create PR
git push origin feature/my-feature

# 4. CI runs automatically on PR
# - Linting
# - Type checking
# - Tests
# - Build verification

# 5. After approval and merge to main
# - Staging deployment triggered
# - Manual approval for production
```

## Docker Setup

### Local Development

```bash
# Start all services
docker-compose -f docker-compose.dev.yml up -d

# Start with development tools
docker-compose -f docker-compose.dev.yml --profile tools up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop services
docker-compose -f docker-compose.dev.yml down
```

### Services

| Service | Port | Description |
|---------|------|-------------|
| `postgres` | 5432 | PostgreSQL with pgvector |
| `redis` | 6379 | Redis cache |
| `redis-commander` | 8081 | Redis web UI (tools profile) |
| `mailhog` | 8025 | Email testing UI (tools profile) |
| `minio` | 9000/9001 | S3-compatible storage (storage profile) |

### Production Docker

```bash
# Build and deploy
docker-compose -f docker-compose.production.yml build
docker-compose -f docker-compose.production.yml up -d

# Scale workers
docker-compose -f docker-compose.production.yml up -d --scale worker=3
```

## Database Operations

### Migrations

```bash
# Create migration
pnpm --filter api db:migrate

# Apply migrations (development)
pnpm --filter api db:push

# Apply migrations (production)
pnpm --filter api db:migrate:prod

# Reset database (CAUTION: deletes all data)
pnpm --filter api db:reset
```

### Backups

```bash
# Create backup
./scripts/backup.sh

# Backup is stored in ./backups/ with timestamp
```

### Prisma Studio

```bash
# Open database GUI
pnpm --filter api db:studio
```

## Monitoring & Logging

### Sentry

Error tracking and performance monitoring:

- **DSN**: Set `SENTRY_DSN` environment variable
- **Sample Rate**: 10% in production, 100% in development
- **Profiles**: Enabled for performance profiling

### PostHog

Analytics and feature flags:

- **Key**: Set `POSTHOG_API_KEY` environment variable
- **Events**: User actions, feature usage

### Structured Logging

Logs are structured JSON in production:

```json
{
  "level": "info",
  "time": "2025-01-02T00:00:00.000Z",
  "msg": "Request completed",
  "requestId": "abc-123",
  "method": "GET",
  "path": "/api/jobs",
  "statusCode": 200,
  "duration": 45
}
```

### Health Checks

| Endpoint | Purpose |
|----------|---------|
| `/health` | Basic health check |
| `/health/live` | Kubernetes liveness probe |
| `/health/ready` | Kubernetes readiness probe |
| `/health/startup` | Detailed startup health |

## Troubleshooting

### Common Issues

#### Database Connection Failed

```bash
# Check if PostgreSQL is running
docker-compose -f docker-compose.dev.yml ps postgres

# Check connection string
echo $DATABASE_URL

# Test connection
pnpm --filter api db:studio
```

#### Redis Connection Issues

```bash
# Check Redis status
docker-compose -f docker-compose.dev.yml ps redis

# Test connection
docker-compose -f docker-compose.dev.yml exec redis redis-cli ping
```

#### Prisma Client Issues

```bash
# Regenerate client
pnpm --filter api db:generate

# Clear cache and reinstall
rm -rf node_modules/.prisma
pnpm install
```

### Logs

```bash
# API logs
docker-compose -f docker-compose.production.yml logs -f api

# Worker logs
docker-compose -f docker-compose.production.yml logs -f worker

# All logs
docker-compose -f docker-compose.production.yml logs -f
```

### Rollback

```bash
# Rollback to previous deployment
./tools/rollback.ps1

# Rollback database migration
pnpm --filter api prisma migrate resolve --rolled-back [migration-name]
```
