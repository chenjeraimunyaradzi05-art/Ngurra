# Environment Setup Guide

This document provides instructions for setting up the development, staging, and production environments for Ngurra Pathways.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Local Development](#local-development)
- [Docker Development](#docker-development)
- [Staging Environment](#staging-environment)
- [Production Environment](#production-environment)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Ensure you have the following installed:

- **Node.js** 20 LTS (pinned via `.nvmrc` and `.node-version`)
- **npm** >= 10.0.0 (bundled with Node 20)
- **Docker** and **Docker Compose** (for containerized development)
- **PostgreSQL** 16+ (or use Docker — docker-compose.dev.yml includes pgvector)
- **Redis** 7+ (or use Docker)
- **Git**

### Recommended VS Code Extensions

- ESLint
- Prettier
- Tailwind CSS IntelliSense
- Prisma
- GitLens
- Docker

## Local Development

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/gimbi.git
cd gimbi
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

```bash
# API
cp apps/api/.env.example apps/api/.env

# Web
cp apps/web/.env.example apps/web/.env.local
```

Edit the `.env` files with your local configuration.

### 4. Set Up the Database

```bash
# Start PostgreSQL and Redis (via docker-compose.dev.yml)
npm run db:up

# Run migrations
npm run db:migrate

# Seed the database (optional)
npm run db:seed
```

### 5. Start Development Servers

```bash
# From root directory — start API and Web in parallel
npm run dev:api   # API on http://localhost:3333
npm run dev:web   # Web on http://localhost:3000
```

This starts:

- API server at http://localhost:3333
- Web app at http://localhost:3000

## Docker Development

For a fully containerized development environment:

### 1. Build and Start Containers

```bash
docker-compose -f docker-compose.dev.yml up --build
```

### 2. Access Services

- **Web App**: http://localhost:3000
- **API**: http://localhost:3333
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379
- **Mailhog** (email testing): http://localhost:8025 (with `--profile tools`)
- **MinIO** (S3 local): http://localhost:9001 (with `--profile storage`)

### 3. Run Commands in Containers

```bash
# Run migrations (from host)
npm run db:migrate

# Access database directly
docker-compose -f docker-compose.dev.yml exec postgres psql -U ngurra -d ngurra_dev

# View container logs
npm run db:logs
```

### 4. Stop Containers

```bash
docker-compose down

# Remove volumes (clean slate)
docker-compose down -v
```

## Staging Environment

### GitHub Actions Deployment

Staging deployment is automated via GitHub Actions:

1. Push to `develop` branch
2. Tests run automatically
3. If tests pass, deployment proceeds
4. Staging URL: https://staging.ngurra-pathways.com

### Manual Deployment

```bash
# Build for staging
NODE_ENV=staging npm run build:all

# Deploy to staging server (if script exists)
npm run deploy:staging
```

### Staging Environment Variables

Staging uses different environment variables:

- `DATABASE_URL`: Staging PostgreSQL instance
- `REDIS_URL`: Staging Redis instance
- `API_URL`: https://api.staging.ngurra-pathways.com

## Production Environment

### Deployment Process

1. Create a release branch: `release/v1.x.x`
2. Merge to `main` after testing
3. Tag the release: `git tag v1.x.x`
4. Push tags: `git push --tags`
5. GitHub Actions deploys automatically

### Production Checklist

Before deploying to production:

- [ ] All tests pass
- [ ] Security audit completed
- [ ] Database migrations tested
- [ ] Environment variables configured
- [ ] SSL certificates valid
- [ ] Monitoring configured
- [ ] Backup strategy in place
- [ ] Rollback plan documented

### Rollback Procedure

```powershell
# Using PowerShell script
.\tools\rollback.ps1 -Version "v1.2.3"
```

## Environment Variables

### Required Variables

| Variable         | Description           | Example                                |
| ---------------- | --------------------- | -------------------------------------- |
| `NODE_ENV`       | Environment name      | `development`, `staging`, `production` |
| `DATABASE_URL`   | PostgreSQL connection | `postgresql://user:pass@host:5432/db`  |
| `REDIS_URL`      | Redis connection      | `redis://localhost:6379`               |
| `JWT_SECRET`     | JWT signing key       | 64-byte random string                  |
| `ENCRYPTION_KEY` | AES encryption key    | 32-byte random string                  |

### Generating Secrets

```bash
# Generate JWT secret
openssl rand -base64 64

# Generate encryption key
openssl rand -base64 32

# Generate session secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Variable Precedence

1. Environment-specific `.env` files (`.env.local`, `.env.production`)
2. Base `.env` file
3. System environment variables
4. Default values in code

## Database Setup

### PostgreSQL Configuration

```sql
-- Create database
CREATE DATABASE gimbi_dev;

-- Create user
CREATE USER gimbi WITH PASSWORD 'your_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE gimbi_dev TO gimbi;
```

### Running Migrations

```bash
# Development
npm run db:migrate

# Production (in apps/api)
npm --prefix apps/api run db:migrate:prod
```

### Seeding Data

```bash
# Seed with test data
npm run db:seed

# Reset database (DESTRUCTIVE)
npm --prefix apps/api run db:reset
```

## Troubleshooting

### Common Issues

#### Port Already in Use

```bash
# Find process using port (Windows)
netstat -ano | findstr :3333
taskkill /PID <pid> /F

# Find process using port (Linux/macOS)
lsof -i :3333
kill -9 <pid>
```

#### Database Connection Failed

1. Check PostgreSQL is running: `docker-compose ps`
2. Verify connection string in `.env`
3. Test connection: `psql $DATABASE_URL`

#### Redis Connection Failed

1. Check Redis is running: `redis-cli ping`
2. Verify REDIS_URL in `.env`
3. Check firewall settings

#### Build Errors

```bash
# Clear cache and reinstall
npm run clean
rm -rf node_modules
npm install

# Clear Next.js cache
rm -rf apps/web/.next
```

#### Prisma Issues

```bash
# Regenerate Prisma client
npm --prefix apps/api run db:generate

# Reset database (DESTRUCTIVE)
npm --prefix apps/api run db:reset
```

### Getting Help

- Check existing issues on GitHub
- Review logs: `docker-compose logs api`
- Enable debug mode: `DEBUG=* pnpm dev`
- Contact the development team

## Additional Resources

- [API Documentation](./API_ARCHITECTURE.md)
- [Database Schema](./DATABASE_SCHEMA.md)
- [Testing Guide](./TESTING.md)
- [DevOps Guide](./DEVOPS.md)
