#!/usr/bin/env node

/**
 * Development Setup Script
 * Automates first-time setup for new developers
 * 
 * Usage: node scripts/dev-setup.js
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const ROOT_DIR = path.join(__dirname, '..');
const API_DIR = path.join(ROOT_DIR, 'apps', 'api');
const WEB_DIR = path.join(ROOT_DIR, 'apps', 'web');

// ANSI colors
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  console.log(`\n${colors.blue}[${step}]${colors.reset} ${colors.bright}${message}${colors.reset}`);
}

function logSuccess(message) {
  console.log(`${colors.green}✓${colors.reset} ${message}`);
}

function logWarning(message) {
  console.log(`${colors.yellow}⚠${colors.reset} ${message}`);
}

function logError(message) {
  console.log(`${colors.red}✗${colors.reset} ${message}`);
}

function exec(command, options = {}) {
  try {
    execSync(command, { stdio: 'inherit', ...options });
    return true;
  } catch (err) {
    return false;
  }
}

function fileExists(filePath) {
  return fs.existsSync(filePath);
}

function copyFile(src, dest) {
  if (!fileExists(dest)) {
    fs.copyFileSync(src, dest);
    return true;
  }
  return false;
}

async function checkDocker() {
  logStep('1/7', 'Checking Docker installation...');
  
  try {
    execSync('docker --version', { stdio: 'pipe' });
    logSuccess('Docker is installed');
    
    execSync('docker compose version', { stdio: 'pipe' });
    logSuccess('Docker Compose is available');
    
    return true;
  } catch {
    logError('Docker is not installed or not running');
    log('Please install Docker Desktop from https://www.docker.com/products/docker-desktop', 'yellow');
    return false;
  }
}

async function startDocker() {
  logStep('2/7', 'Starting Docker services...');
  
  const result = exec('docker compose -f docker-compose.dev.yml up -d postgres redis', { cwd: ROOT_DIR });
  
  if (result) {
    logSuccess('PostgreSQL and Redis containers started');
    
    // Wait for PostgreSQL to be ready
    log('Waiting for PostgreSQL to be ready...', 'cyan');
    let attempts = 0;
    while (attempts < 30) {
      try {
        execSync('docker compose -f docker-compose.dev.yml exec -T postgres pg_isready -U ngurra', { 
          cwd: ROOT_DIR, 
          stdio: 'pipe' 
        });
        logSuccess('PostgreSQL is ready');
        break;
      } catch {
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    if (attempts >= 30) {
      logWarning('PostgreSQL may not be fully ready yet');
    }
    
    return true;
  } else {
    logError('Failed to start Docker services');
    return false;
  }
}

async function setupEnvFiles() {
  logStep('3/7', 'Setting up environment files...');
  
  const apiEnvExample = path.join(API_DIR, '.env.example');
  const apiEnv = path.join(API_DIR, '.env');
  
  if (copyFile(apiEnvExample, apiEnv)) {
    logSuccess('Created apps/api/.env from .env.example');
  } else {
    logWarning('apps/api/.env already exists, skipping');
  }
  
  // Check for web env
  const webEnvExample = path.join(WEB_DIR, '.env.example');
  const webEnv = path.join(WEB_DIR, '.env.local');
  
  if (fileExists(webEnvExample)) {
    if (copyFile(webEnvExample, webEnv)) {
      logSuccess('Created apps/web/.env.local from .env.example');
    } else {
      logWarning('apps/web/.env.local already exists, skipping');
    }
  }
  
  return true;
}

async function installDependencies() {
  logStep('4/7', 'Installing dependencies...');
  
  const result = exec('npm install', { cwd: ROOT_DIR });
  
  if (result) {
    logSuccess('Dependencies installed');
    return true;
  } else {
    logError('Failed to install dependencies');
    return false;
  }
}

async function generatePrismaClient() {
  logStep('5/7', 'Generating Prisma client...');
  
  const result = exec('npx prisma generate', { cwd: API_DIR });
  
  if (result) {
    logSuccess('Prisma client generated');
    return true;
  } else {
    logError('Failed to generate Prisma client');
    return false;
  }
}

async function runMigrations() {
  logStep('6/7', 'Running database migrations...');
  
  const result = exec('npx prisma migrate dev --name init', { cwd: API_DIR });
  
  if (result) {
    logSuccess('Database migrations applied');
    return true;
  } else {
    logWarning('Migrations may have failed - check output above');
    return true; // Continue anyway
  }
}

async function seedDatabase() {
  logStep('7/7', 'Seeding database...');
  
  const result = exec('node prisma/seed.js', { cwd: API_DIR });
  
  if (result) {
    logSuccess('Database seeded with sample data');
    return true;
  } else {
    logWarning('Seeding may have failed - check output above');
    return true; // Continue anyway
  }
}

function printSummary() {
  console.log('\n' + '='.repeat(60));
  log('\n🎉 Development environment setup complete!\n', 'green');
  
  console.log('To start the development servers:\n');
  log('  npm run dev:api    # Start API on http://localhost:3001', 'cyan');
  log('  npm run dev:web    # Start Web on http://localhost:3000', 'cyan');
  
  console.log('\nUseful commands:\n');
  log('  npm run db:studio  # Open Prisma Studio (DB GUI)', 'cyan');
  log('  npm run db:logs    # View Docker container logs', 'cyan');
  log('  npm run db:down    # Stop Docker containers', 'cyan');
  
  console.log('\nTest accounts (password: password123):\n');
  log('  member@example.com   - Job seeker account', 'cyan');
  log('  company@example.com  - Employer account', 'cyan');
  log('  mentor@example.com   - Mentor account', 'cyan');
  log('  admin@example.com    - Admin account', 'cyan');
  
  console.log('\nAPI Documentation: http://localhost:3001/docs');
  console.log('Health Check: http://localhost:3001/health\n');
}

async function main() {
  console.log('\n' + '='.repeat(60));
  log('🌏 Ngurra Pathways - Development Setup', 'bright');
  console.log('='.repeat(60));
  
  const dockerOk = await checkDocker();
  if (!dockerOk) {
    log('\nSetup cannot continue without Docker. Please install Docker and try again.', 'red');
    process.exit(1);
  }
  
  await startDocker();
  await setupEnvFiles();
  await installDependencies();
  await generatePrismaClient();
  await runMigrations();
  await seedDatabase();
  
  printSummary();
}

main().catch(err => {
  logError(`Setup failed: ${err.message}`);
  process.exit(1);
});
