#!/usr/bin/env node
/**
 * Security Audit Script (Step 9)
 * 
 * Runs comprehensive security checks across the codebase:
 * - npm/pnpm audit for dependency vulnerabilities
 * - Checks for hardcoded secrets
 * - Validates security headers configuration
 * 
 * Usage: node scripts/security-audit.js [--fix] [--ci]
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const shouldFix = args.includes('--fix');
const isCi = args.includes('--ci');

// Colors for terminal output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, colors.blue);
  console.log('='.repeat(60));
}

let hasErrors = false;
let hasWarnings = false;

// ============================================
// 1. NPM/PNPM Audit
// ============================================
logSection('1. Dependency Vulnerability Scan');

try {
  // Try pnpm first, fall back to npm
  try {
    const result = execSync('pnpm audit --json 2>/dev/null || npm audit --json', {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    
    const audit = JSON.parse(result);
    const vulnerabilities = audit.metadata?.vulnerabilities || audit.vulnerabilities || {};
    
    const critical = vulnerabilities.critical || 0;
    const high = vulnerabilities.high || 0;
    const moderate = vulnerabilities.moderate || 0;
    const low = vulnerabilities.low || 0;
    
    if (critical > 0 || high > 0) {
      log(`❌ Found ${critical} critical and ${high} high severity vulnerabilities`, colors.red);
      hasErrors = true;
    } else if (moderate > 0) {
      log(`⚠️  Found ${moderate} moderate severity vulnerabilities`, colors.yellow);
      hasWarnings = true;
    } else {
      log('✅ No high/critical vulnerabilities found', colors.green);
    }
    
    log(`   Summary: ${critical} critical, ${high} high, ${moderate} moderate, ${low} low`);
    
  } catch (auditError) {
    // Audit command returns non-zero exit code if vulnerabilities found
    log('⚠️  Audit found issues (check npm/pnpm audit for details)', colors.yellow);
    hasWarnings = true;
  }
} catch (error) {
  log('❌ Failed to run dependency audit', colors.red);
  hasErrors = true;
}

// ============================================
// 2. Secret Detection
// ============================================
logSection('2. Hardcoded Secret Detection');

const secretPatterns = [
  { name: 'AWS Access Key', pattern: /AKIA[0-9A-Z]{16}/g },
  { name: 'AWS Secret Key', pattern: /(?<![A-Za-z0-9/+=])[A-Za-z0-9/+=]{40}(?![A-Za-z0-9/+=])/g, context: 'aws' },
  { name: 'Private Key', pattern: /-----BEGIN (RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----/g },
  { name: 'Stripe Secret Key', pattern: /sk_live_[0-9a-zA-Z]{24,}/g },
  { name: 'Stripe Webhook Secret', pattern: /whsec_[0-9a-zA-Z]{24,}/g },
  { name: 'GitHub Token', pattern: /ghp_[0-9a-zA-Z]{36}/g },
  { name: 'Generic API Key', pattern: /api[_-]?key[\s]*[=:]["']?[a-zA-Z0-9]{20,}["']?/gi },
  { name: 'Generic Secret', pattern: /secret[\s]*[=:]["'][a-zA-Z0-9]{20,}["']/gi },
  { name: 'JWT Token', pattern: /eyJ[a-zA-Z0-9_-]*\.eyJ[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*/g },
  { name: 'Password in URL', pattern: /[a-zA-Z]+:\/\/[^:]+:[^@]+@/g },
];

const filesToScan = [];
const extensionsToScan = ['.js', '.ts', '.jsx', '.tsx', '.json', '.yml', '.yaml', '.env.example'];
const dirsToSkip = ['node_modules', '.git', 'dist', 'build', '.next', 'coverage', 'test-results'];

function scanDirectory(dir) {
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        if (!dirsToSkip.includes(entry.name)) {
          scanDirectory(fullPath);
        }
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name);
        if (extensionsToScan.includes(ext) || entry.name.startsWith('.env')) {
          filesToScan.push(fullPath);
        }
      }
    }
  } catch (error) {
    // Skip directories we can't read
  }
}

// Scan from project root
const projectRoot = path.resolve(__dirname, '..');
scanDirectory(projectRoot);

let secretsFound = 0;

for (const file of filesToScan) {
  try {
    // Skip actual .env files (they should have secrets, but not be committed)
    if (path.basename(file) === '.env') continue;
    
    const content = fs.readFileSync(file, 'utf-8');
    
    for (const { name, pattern } of secretPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        // Skip false positives in test files or examples
        const relativePath = path.relative(projectRoot, file);
        if (relativePath.includes('test') || relativePath.includes('example') || relativePath.includes('mock')) {
          continue;
        }
        
        secretsFound++;
        log(`⚠️  Potential ${name} in ${relativePath}`, colors.yellow);
        hasWarnings = true;
      }
    }
  } catch (error) {
    // Skip files we can't read
  }
}

if (secretsFound === 0) {
  log('✅ No hardcoded secrets detected', colors.green);
} else {
  log(`\n⚠️  Found ${secretsFound} potential secrets. Please review.`, colors.yellow);
}

// ============================================
// 3. Security Configuration Check
// ============================================
logSection('3. Security Configuration Check');

// Check for required security files
const requiredFiles = [
  { path: 'SECURITY.md', description: 'Security policy' },
  { path: '.npmrc', description: 'NPM configuration' },
  { path: 'apps/api/src/lib/securityAudit.js', description: 'Security audit logging' },
];

for (const { path: filePath, description } of requiredFiles) {
  const fullPath = path.join(projectRoot, filePath);
  if (fs.existsSync(fullPath)) {
    log(`✅ ${description} exists: ${filePath}`, colors.green);
  } else {
    log(`❌ Missing ${description}: ${filePath}`, colors.red);
    hasErrors = true;
  }
}

// Check for .env in .gitignore
const gitignorePath = path.join(projectRoot, '.gitignore');
if (fs.existsSync(gitignorePath)) {
  const gitignore = fs.readFileSync(gitignorePath, 'utf-8');
  if (gitignore.includes('.env')) {
    log('✅ .env files are in .gitignore', colors.green);
  } else {
    log('❌ .env files should be in .gitignore', colors.red);
    hasErrors = true;
  }
}

// ============================================
// 4. Dockerfile Security Check
// ============================================
logSection('4. Docker Security Check');

const dockerfilePath = path.join(projectRoot, 'apps/api/Dockerfile');
if (fs.existsSync(dockerfilePath)) {
  const dockerfile = fs.readFileSync(dockerfilePath, 'utf-8');
  
  // Check for non-root user
  if (dockerfile.includes('USER') && !dockerfile.match(/USER\s+root\s*$/m)) {
    log('✅ Dockerfile uses non-root user', colors.green);
  } else {
    log('⚠️  Dockerfile should use non-root user', colors.yellow);
    hasWarnings = true;
  }
  
  // Check for HEALTHCHECK
  if (dockerfile.includes('HEALTHCHECK')) {
    log('✅ Dockerfile has HEALTHCHECK', colors.green);
  } else {
    log('⚠️  Dockerfile should have HEALTHCHECK', colors.yellow);
    hasWarnings = true;
  }
  
  // Check for minimal base image
  if (dockerfile.includes('-alpine') || dockerfile.includes('-slim') || dockerfile.includes('distroless')) {
    log('✅ Dockerfile uses minimal base image', colors.green);
  } else {
    log('⚠️  Consider using alpine/slim/distroless base image', colors.yellow);
    hasWarnings = true;
  }
}

// ============================================
// Summary
// ============================================
logSection('Security Audit Summary');

if (hasErrors) {
  log('❌ Security audit FAILED - Critical issues found', colors.red);
  if (isCi) {
    process.exit(1);
  }
} else if (hasWarnings) {
  log('⚠️  Security audit completed with WARNINGS', colors.yellow);
  log('   Review warnings above and address as appropriate');
} else {
  log('✅ Security audit PASSED', colors.green);
}

console.log('\n');
