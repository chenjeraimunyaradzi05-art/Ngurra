# Deployment Guide

Complete deployment documentation for Ngurra Pathways platform across all environments.

## Table of Contents

- [Overview](#overview)
- [Environments](#environments)
- [Prerequisites](#prerequisites)
- [Local Development](#local-development)
- [Staging Deployment](#staging-deployment)
- [Production Deployment](#production-deployment)
- [Database Migrations](#database-migrations)
- [Environment Variables](#environment-variables)
- [Docker Deployment](#docker-deployment)
- [Cloud Deployment](#cloud-deployment)
- [Monitoring](#monitoring)
- [Rollback Procedures](#rollback-procedures)
- [Troubleshooting](#troubleshooting)

## Overview

### Deployment Architecture

```
                    ┌─────────────────┐
                    │   CloudFlare    │
                    │   CDN / WAF     │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
        ┌─────▼─────┐  ┌─────▼─────┐  ┌─────▼─────┐
        │   Web     │  │    API    │  │  Mobile   │
        │  (Vercel) │  │ (Railway) │  │  (Expo)   │
        └─────┬─────┘  └─────┬─────┘  └───────────┘
              │              │
              │        ┌─────▼─────┐
              │        │ PostgreSQL│
              │        │  (Neon)   │
              │        └─────┬─────┘
              │              │
              │        ┌─────▼─────┐
              └───────►│   Redis   │
                       │ (Upstash) │
                       └───────────┘
```

### Deployment Flow

```
Feature Branch → PR → Review → Staging → Production
```

## Environments

| Environment | Purpose | URL |
|-------------|---------|-----|
| Local | Development | `localhost:3000` |
| Staging | Testing/QA | `staging.ngurra-pathways.com` |
| Production | Live users | `ngurra-pathways.com` |

## Prerequisites

### Required Tools

```bash
# Node.js 20+
node --version  # v20.x

# pnpm 8+
pnpm --version  # 8.x

# Docker (optional for local)
docker --version

# Cloud CLIs
vercel --version
railway --version
```

### Required Accounts

- **GitHub** - Source control
- **Vercel** - Web hosting
- **Railway** - API hosting
- **Neon** - PostgreSQL database
- **Upstash** - Redis cache
- **CloudFlare** - CDN/WAF
- **Sentry** - Error monitoring

## Local Development

### Quick Start

```bash
# Clone repository
git clone https://github.com/ngurra-pathways/platform.git
cd platform

# Install dependencies
pnpm install

# Set up environment
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local

# Start database
docker-compose up -d db redis

# Run migrations
pnpm --filter api db:migrate

# Seed development data
pnpm --filter api db:seed

# Start development servers
pnpm dev
```

### Development URLs

- **Web**: http://localhost:3000
- **API**: http://localhost:3001
- **API Docs**: http://localhost:3001/docs
- **Storybook**: http://localhost:6006

## Staging Deployment

### Automatic Deployment

Staging is automatically deployed when changes are pushed to the `develop` branch.

```yaml
# .github/workflows/staging.yml
on:
  push:
    branches: [develop]
```

### Manual Deployment

```bash
# Deploy to staging
pnpm deploy:staging

# Or using CLI directly
vercel --env staging
railway up -e staging
```

### Staging Environment Setup

```bash
# Set staging environment variables
vercel env add NEXT_PUBLIC_API_URL staging
railway variables set DATABASE_URL="..." -e staging
```

## Production Deployment

### Deployment Checklist

Before deploying to production:

- [ ] All tests passing
- [ ] Code review approved
- [ ] Staging tested and verified
- [ ] Database migrations tested
- [ ] Rollback plan prepared
- [ ] Monitoring alerts configured
- [ ] Team notified

### Deployment Process

1. **Create Release**
   ```bash
   git checkout main
   git pull origin main
   git merge develop
   git tag -a v1.2.3 -m "Release v1.2.3"
   git push origin main --tags
   ```

2. **Deploy Web App**
   ```bash
   vercel --prod
   ```

3. **Deploy API**
   ```bash
   railway up -e production
   ```

4. **Run Migrations**
   ```bash
   pnpm --filter api db:migrate:deploy
   ```

5. **Verify Deployment**
   ```bash
   # Check health endpoints
   curl https://api.ngurra-pathways.com/health
   curl https://ngurra-pathways.com/api/health
   ```

### Release Workflow

```yaml
# .github/workflows/release.yml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to Production
        run: |
          vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
          railway up --service api -e production
          
      - name: Create GitHub Release
        uses: softprops/action-gh-release@v1
        with:
          generate_release_notes: true
```

## Database Migrations

### Development

```bash
# Create new migration
pnpm --filter api db:migrate:dev --name add_user_preferences

# Apply migrations
pnpm --filter api db:migrate:dev

# Reset database (DANGER: deletes all data)
pnpm --filter api db:reset
```

### Production

```bash
# Deploy migrations (no prompts, safe for CI)
pnpm --filter api db:migrate:deploy

# Check migration status
pnpm --filter api db:migrate:status
```

### Migration Best Practices

1. **Always test locally first**
2. **Create backups before production migrations**
3. **Use transactions for data migrations**
4. **Keep migrations small and reversible**
5. **Never modify existing migrations**

### Backup Before Migration

```bash
# Backup production database
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d-%H%M%S).sql

# Restore if needed
psql $DATABASE_URL < backup-20240315-103045.sql
```

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection | `postgresql://...` |
| `REDIS_URL` | Redis connection | `redis://...` |
| `JWT_SECRET` | JWT signing key | `super-secret-key` |
| `SESSION_SECRET` | Session encryption | `session-secret` |
| `ENCRYPTION_KEY` | Data encryption (32 bytes) | `...` |

### API Environment

```env
# apps/api/.env.production
NODE_ENV=production
PORT=3001

# Database
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require

# Redis
REDIS_URL=rediss://user:pass@host:6379

# Security
JWT_SECRET=your-production-jwt-secret
SESSION_SECRET=your-production-session-secret
ENCRYPTION_KEY=your-32-byte-encryption-key
ALLOWED_ORIGINS=https://ngurra-pathways.com

# AWS S3
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_BUCKET_NAME=ngurra-uploads
AWS_REGION=ap-southeast-2

# Email
SMTP_HOST=smtp.sendgrid.net
SMTP_USER=apikey
SMTP_PASS=...
EMAIL_FROM=noreply@ngurra-pathways.com

# Monitoring
SENTRY_DSN=https://...@sentry.io/...
```

### Web Environment

```env
# apps/web/.env.production
NEXT_PUBLIC_API_URL=https://api.ngurra-pathways.com
NEXT_PUBLIC_WS_URL=wss://api.ngurra-pathways.com
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
NEXT_PUBLIC_ANALYTICS_ID=G-XXXXXXXX
```

### Secrets Management

```bash
# Vercel
vercel secrets add jwt-secret "your-secret-value"
vercel env add JWT_SECRET production

# Railway
railway variables set JWT_SECRET="your-secret-value" -e production

# GitHub Actions (for CI)
# Settings → Secrets → Actions → New repository secret
```

## Docker Deployment

### Build Images

```bash
# Build all images
docker-compose build

# Build specific service
docker-compose build api

# Build for production
docker build -t ngurra-api:latest -f apps/api/Dockerfile .
```

### docker-compose.production.yml

```yaml
version: '3.8'

services:
  api:
    image: ngurra-api:latest
    restart: always
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
    env_file:
      - .env.production
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  web:
    image: ngurra-web:latest
    restart: always
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    depends_on:
      - api

  nginx:
    image: nginx:alpine
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - /etc/letsencrypt:/etc/letsencrypt
    depends_on:
      - api
      - web
```

### Running Production Docker

```bash
# Start services
docker-compose -f docker-compose.production.yml up -d

# View logs
docker-compose -f docker-compose.production.yml logs -f

# Scale API
docker-compose -f docker-compose.production.yml up -d --scale api=3
```

## Cloud Deployment

### Vercel (Web)

```bash
# Link project
vercel link

# Deploy preview
vercel

# Deploy production
vercel --prod

# Environment variables
vercel env add NEXT_PUBLIC_API_URL production
```

### Railway (API)

```bash
# Link project
railway link

# Deploy
railway up

# Set environment
railway variables set NODE_ENV=production

# View logs
railway logs
```

### AWS Deployment

```bash
# ECR - Push Docker image
aws ecr get-login-password | docker login --username AWS --password-stdin $ECR_URI
docker push $ECR_URI/ngurra-api:latest

# ECS - Update service
aws ecs update-service --cluster ngurra --service api --force-new-deployment

# CloudFormation
aws cloudformation deploy \
  --template-file infrastructure/cloudformation.yml \
  --stack-name ngurra-production
```

## Monitoring

### Health Checks

```bash
# API health
curl https://api.ngurra-pathways.com/health

# Expected response
{
  "status": "healthy",
  "timestamp": "2024-03-15T10:30:45.123Z",
  "uptime": 86400,
  "database": "connected",
  "redis": "connected"
}
```

### Sentry Integration

```javascript
// Error monitoring is automatically configured
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});
```

### Logging

```bash
# View Railway logs
railway logs --tail 100

# View Vercel logs
vercel logs production

# Search logs
railway logs | grep "ERROR"
```

### Alerts

Configure alerts for:

- Error rate > 1%
- Response time p95 > 1s
- CPU usage > 80%
- Memory usage > 80%
- Failed health checks

## Rollback Procedures

### Quick Rollback

```bash
# Vercel - Instant rollback to previous deployment
vercel rollback

# Railway - Rollback to previous deployment
railway rollback

# Docker - Use previous image
docker-compose pull
docker-compose up -d
```

### Database Rollback

```bash
# Restore from backup
pg_restore -d $DATABASE_URL backup.dump

# Or use point-in-time recovery (if available)
# Neon/Supabase have branch restore features
```

### Emergency Procedures

1. **Identify the issue**
   ```bash
   # Check error logs
   railway logs | grep ERROR
   ```

2. **Rollback if needed**
   ```bash
   vercel rollback
   railway rollback
   ```

3. **Notify team**
   - Post in #incidents channel
   - Page on-call if critical

4. **Post-mortem**
   - Document what happened
   - Identify root cause
   - Implement preventive measures

## Troubleshooting

### Common Issues

**Build failures:**
```bash
# Clear build cache
pnpm clean
rm -rf node_modules .next
pnpm install
```

**Database connection issues:**
```bash
# Test connection
psql $DATABASE_URL -c "SELECT 1"

# Check connection limits
SELECT count(*) FROM pg_stat_activity;
```

**Memory issues:**
```bash
# Increase Node memory
NODE_OPTIONS="--max-old-space-size=4096" pnpm build
```

**SSL/TLS issues:**
```bash
# Verify certificates
openssl s_client -connect api.ngurra-pathways.com:443
```

### Debug Checklist

1. Check application logs
2. Verify environment variables
3. Test database connectivity
4. Check external service status
5. Review recent deployments
6. Verify DNS and SSL

### Getting Help

- **Documentation**: Check `/docs` folder
- **Slack**: #engineering-help channel
- **On-call**: Check PagerDuty schedule
- **Escalation**: Contact @platform-leads
