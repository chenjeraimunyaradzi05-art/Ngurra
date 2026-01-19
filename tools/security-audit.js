#!/usr/bin/env node
"use strict";
/**
 * Security Audit Tool
 * 
 * Automated security scanning for the codebase.
 * Run in CI or manually to detect common security issues.
 */

const fs = require('fs');
const path = require('path');

const SEVERITY = {
  CRITICAL: 'CRITICAL',
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW',
  INFO: 'INFO'
};

const findings = [];

/**
 * Security patterns to check
 * Note: Patterns are tuned to minimize false positives while catching real issues
 */
const SECURITY_PATTERNS = [
  // Hardcoded secrets - look for actual values, not just variable names
  {
    pattern: /(password|secret|api_key|apikey|auth_token|access_token|private_key)\s*[:=]\s*['"](?!process\.env|env\.|<|{|\[)[a-zA-Z0-9_\-+=\/]{16,}['"]/gi,
    message: 'Possible hardcoded secret detected',
    severity: SEVERITY.HIGH,
    exclude: ['*.md', '*.test.js', '*.spec.js', 'package*.json', 'schema.prisma']
  },
  
  // SQL injection risk - only flag raw SQL with interpolation
  {
    pattern: /(?:prisma\.\$queryRaw|prisma\.\$executeRaw|\.query\s*\()\s*`[^`]*\$\{/gi,
    message: 'Raw SQL with string interpolation - use parameterized queries',
    severity: SEVERITY.HIGH,
    fileTypes: ['.js', '.ts']
  },
  
  // eval() usage (exclude Playwright evaluate which is safe)
  {
    pattern: /(?<!page\.\$\$?|page\.)eval\s*\(/g,
    message: 'eval() usage detected - potential code injection risk',
    severity: SEVERITY.HIGH,
    fileTypes: ['.js', '.ts', '.jsx', '.tsx']
  },
  
  // Dangerous innerHTML
  {
    pattern: /dangerouslySetInnerHTML/g,
    message: 'dangerouslySetInnerHTML usage - ensure content is sanitized',
    severity: SEVERITY.MEDIUM,
    fileTypes: ['.jsx', '.tsx']
  },
  
  // Unvalidated redirects
  {
    pattern: /res\.redirect\s*\(\s*req\.(query|body|params)/g,
    message: 'Unvalidated redirect - potential open redirect vulnerability',
    severity: SEVERITY.MEDIUM,
    fileTypes: ['.js', '.ts']
  },
  
  // Disabled security
  {
    pattern: /verify\s*[:=]\s*false|rejectUnauthorized\s*[:=]\s*false/g,
    message: 'SSL/TLS verification disabled',
    severity: SEVERITY.HIGH,
    fileTypes: ['.js', '.ts']
  },
  
  // Weak crypto
  {
    pattern: /createHash\s*\(\s*['"]md5['"]/g,
    message: 'MD5 hash usage - use stronger algorithm like SHA-256',
    severity: SEVERITY.MEDIUM,
    fileTypes: ['.js', '.ts']
  },
  
  // Console.log in production code (exclude tools, tests, and lib/logger.js)
  {
    pattern: /console\.(log|debug)\s*\(/g,
    message: 'Console logging in code - consider using structured logger',
    severity: SEVERITY.INFO,
    exclude: ['*.test.js', '*.spec.js', 'tools/**', 'scripts/**', 'logger.js'],
    fileTypes: ['.js', '.ts']
  },
  
  // Exposed error details
  {
    pattern: /res\.(json|send)\s*\(\s*\{\s*error:\s*err(or)?\.stack/g,
    message: 'Stack trace exposed in error response',
    severity: SEVERITY.MEDIUM,
    fileTypes: ['.js', '.ts']
  },
  
  // CORS wildcard
  {
    pattern: /origin:\s*['"]?\*['"]?/g,
    message: 'CORS wildcard origin - restrict to specific domains',
    severity: SEVERITY.MEDIUM,
    fileTypes: ['.js', '.ts']
  }
];

/**
 * Directories to scan
 */
const SCAN_DIRS = [
  'apps/api/src',
  'apps/web/src',
  'netlify/functions',
  'tools'
];

/**
 * Files/dirs to ignore
 */
const IGNORE_PATTERNS = [
  'node_modules',
  '.git',
  'dist',
  'build',
  '.next',
  '*.min.js',
  '*.map',
  'security-audit.js' // Exclude self to avoid false positives
];

/**
 * Check if path should be ignored
 */
function shouldIgnore(filePath) {
  return IGNORE_PATTERNS.some(pattern => {
    if (pattern.includes('*')) {
      const regex = new RegExp(pattern.replace('*', '.*'));
      return regex.test(filePath);
    }
    return filePath.includes(pattern);
  });
}

/**
 * Check if file matches allowed types
 */
function matchesFileType(filePath, fileTypes) {
  if (!fileTypes) return true;
  return fileTypes.some(ext => filePath.endsWith(ext));
}

/**
 * Check if file should be excluded for a pattern
 */
function isExcluded(filePath, excludePatterns) {
  if (!excludePatterns) return false;
  
  // Normalize path separators
  const normalizedPath = filePath.replace(/\\/g, '/');
  
  return excludePatterns.some(pattern => {
    if (pattern.includes('**')) {
      // Handle glob ** pattern (matches any directory depth)
      const regex = new RegExp(pattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*'));
      return regex.test(normalizedPath);
    }
    if (pattern.includes('*')) {
      // Handle simple * wildcard
      const regex = new RegExp(pattern.replace(/\*/g, '.*'));
      return regex.test(normalizedPath);
    }
    return normalizedPath.includes(pattern);
  });
}

/**
 * Scan a file for security issues
 */
function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    for (const check of SECURITY_PATTERNS) {
      if (!matchesFileType(filePath, check.fileTypes)) continue;
      if (isExcluded(filePath, check.exclude)) continue;
      
      let match;
      while ((match = check.pattern.exec(content)) !== null) {
        // Find line number
        const beforeMatch = content.substring(0, match.index);
        const lineNumber = beforeMatch.split('\n').length;
        
        findings.push({
          file: filePath,
          line: lineNumber,
          severity: check.severity,
          message: check.message,
          snippet: lines[lineNumber - 1]?.trim().substring(0, 80)
        });
      }
      
      // Reset regex lastIndex
      check.pattern.lastIndex = 0;
    }
  } catch (err) {
    console.error(`Error scanning ${filePath}:`, err.message);
  }
}

/**
 * Recursively scan directory
 */
function scanDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    console.log(`Directory not found: ${dirPath}`);
    return;
  }
  
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    
    if (shouldIgnore(fullPath)) continue;
    
    if (entry.isDirectory()) {
      scanDirectory(fullPath);
    } else if (entry.isFile()) {
      scanFile(fullPath);
    }
  }
}

/**
 * Check for common security misconfigurations
 */
function checkConfigurations(rootDir) {
  // Check package.json for vulnerable scripts
  const pkgPath = path.join(rootDir, 'package.json');
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    
    // Check for preinstall/postinstall scripts (supply chain risk)
    if (pkg.scripts?.preinstall || pkg.scripts?.postinstall) {
      findings.push({
        file: pkgPath,
        line: 0,
        severity: SEVERITY.INFO,
        message: 'Pre/post install scripts detected - review for supply chain security',
        snippet: 'scripts.preinstall or scripts.postinstall'
      });
    }
  }
  
  // Check for .env file in repo
  const envPath = path.join(rootDir, '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    if (envContent.length > 100 && !envContent.includes('# Example')) {
      findings.push({
        file: envPath,
        line: 0,
        severity: SEVERITY.HIGH,
        message: '.env file in repository may contain secrets',
        snippet: 'Ensure .env is in .gitignore'
      });
    }
  }
}

/**
 * Generate report
 */
function generateReport() {
  const bySeverity = {};
  for (const f of findings) {
    bySeverity[f.severity] = (bySeverity[f.severity] || 0) + 1;
  }
  
  console.log('\n========================================');
  console.log('       SECURITY AUDIT REPORT');
  console.log('========================================\n');
  
  console.log('Summary:');
  console.log(`  CRITICAL: ${bySeverity[SEVERITY.CRITICAL] || 0}`);
  console.log(`  HIGH:     ${bySeverity[SEVERITY.HIGH] || 0}`);
  console.log(`  MEDIUM:   ${bySeverity[SEVERITY.MEDIUM] || 0}`);
  console.log(`  LOW:      ${bySeverity[SEVERITY.LOW] || 0}`);
  console.log(`  INFO:     ${bySeverity[SEVERITY.INFO] || 0}`);
  console.log(`  TOTAL:    ${findings.length}\n`);
  
  if (findings.length === 0) {
    console.log('✅ No security issues found!\n');
    return 0;
  }
  
  // Sort by severity
  const severityOrder = [SEVERITY.CRITICAL, SEVERITY.HIGH, SEVERITY.MEDIUM, SEVERITY.LOW, SEVERITY.INFO];
  findings.sort((a, b) => severityOrder.indexOf(a.severity) - severityOrder.indexOf(b.severity));
  
  console.log('Findings:\n');
  for (const f of findings) {
    const icon = f.severity === SEVERITY.CRITICAL ? '🔴' 
      : f.severity === SEVERITY.HIGH ? '🟠'
      : f.severity === SEVERITY.MEDIUM ? '🟡'
      : f.severity === SEVERITY.LOW ? '🔵'
      : 'ℹ️';
    
    console.log(`${icon} [${f.severity}] ${f.file}:${f.line}`);
    console.log(`   ${f.message}`);
    if (f.snippet) console.log(`   > ${f.snippet}`);
    console.log();
  }
  
  // Exit with error if critical or high findings
  if (bySeverity[SEVERITY.CRITICAL] > 0 || bySeverity[SEVERITY.HIGH] > 0) {
    console.log('❌ Security audit failed - fix CRITICAL and HIGH issues\n');
    return 1;
  }
  
  console.log('⚠️  Security audit passed with warnings\n');
  return 0;
}

/**
 * Main
 */
function main() {
  const rootDir = process.cwd();
  console.log(`\nScanning ${rootDir}...\n`);
  
  // Scan directories
  for (const dir of SCAN_DIRS) {
    const fullPath = path.join(rootDir, dir);
    console.log(`Scanning ${dir}...`);
    scanDirectory(fullPath);
  }
  
  // Check configurations
  checkConfigurations(rootDir);
  
  // Generate report
  const exitCode = generateReport();
  process.exit(exitCode);
}

main();
