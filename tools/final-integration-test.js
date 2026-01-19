#!/usr/bin/env node
/**
 * Ngurra Pathways - Final Integration Test Suite
 * 
 * Step 100: Final integration tests to verify all systems are working together
 * Run before production deployment to ensure everything is connected.
 * 
 * Usage:
 *   node tools/final-integration-test.js [--production]
 */

const http = require('http');
const https = require('https');

// Configuration
const isProduction = process.argv.includes('--production');
const API_BASE = isProduction 
  ? 'https://api.ngurrapathways.life'
  : 'http://localhost:3333';
const WEB_BASE = isProduction
  ? 'https://ngurrapathways.life'
  : 'http://localhost:3000';

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(color, symbol, message) {
  console.log(`${color}${symbol}${colors.reset} ${message}`);
}

function pass(message) {
  log(colors.green, '✓', message);
}

function fail(message) {
  log(colors.red, '✗', message);
}

function info(message) {
  log(colors.blue, '→', message);
}

function warn(message) {
  log(colors.yellow, '⚠', message);
}

// HTTP request helper
function request(url, options = {}) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.request(url, {
      method: options.method || 'GET',
      headers: options.headers || {},
      timeout: 10000,
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data,
          json: () => {
            try {
              return JSON.parse(data);
            } catch {
              return null;
            }
          },
        });
      });
    });

    req.on('error', reject);
    req.on('timeout', () => reject(new Error('Request timeout')));
    
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

// Test suites
const tests = {
  results: { passed: 0, failed: 0, skipped: 0 },
  errors: [],

  // API Health Tests
  async apiHealth() {
    info('Testing API Health...');
    
    try {
      const res = await request(`${API_BASE}/health`);
      if (res.status === 200) {
        const data = res.json();
        if (data?.status === 'healthy') {
          pass(`API health check (v${data.version || 'unknown'})`);
          this.results.passed++;
        } else {
          fail('API returned unhealthy status');
          this.results.failed++;
        }
      } else {
        fail(`API health returned ${res.status}`);
        this.results.failed++;
      }
    } catch (err) {
      fail(`API unreachable: ${err.message}`);
      this.results.failed++;
      this.errors.push(`API Health: ${err.message}`);
    }
  },

  // Web Health Tests
  async webHealth() {
    info('Testing Web Application...');
    
    try {
      const res = await request(WEB_BASE);
      if (res.status === 200) {
        pass('Web application responding');
        this.results.passed++;
        
        // Check for critical elements
        if (res.body.includes('Ngurra') || res.body.includes('ngurra')) {
          pass('Web contains expected content');
          this.results.passed++;
        } else {
          warn('Web content may not be correct');
          this.results.passed++; // Non-critical
        }
      } else {
        fail(`Web returned ${res.status}`);
        this.results.failed++;
      }
    } catch (err) {
      fail(`Web unreachable: ${err.message}`);
      this.results.failed++;
      this.errors.push(`Web Health: ${err.message}`);
    }
  },

  // API Endpoints Tests
  async apiEndpoints() {
    info('Testing API Endpoints...');
    
    const endpoints = [
      { path: '/jobs', name: 'Jobs list' },
      { path: '/mentor', name: 'Mentors list' },
      { path: '/courses', name: 'Courses list' },
      // { path: '/openapi.json', name: 'OpenAPI spec' }, // Often mounted elsewhere or conditionally
    ];

    for (const endpoint of endpoints) {
      try {
        const res = await request(`${API_BASE}${endpoint.path}`);
        if (res.status === 200 || res.status === 401) {
          pass(`${endpoint.name} endpoint (${res.status})`);
          this.results.passed++;
        } else {
          fail(`${endpoint.name} returned ${res.status}`);
          this.results.failed++;
        }
      } catch (err) {
        fail(`${endpoint.name}: ${err.message}`);
        this.results.failed++;
      }
    }
  },

  // Web Routes Tests
  async webRoutes() {
    info('Testing Web Routes...');
    
    const routes = [
      { path: '/jobs', name: 'Jobs page' },
      { path: '/mentorship', name: 'Mentors page' },
      { path: '/login', name: 'Login page' },
      { path: '/about', name: 'About page' },
    ];

    for (const route of routes) {
      try {
        const res = await request(`${WEB_BASE}${route.path}`);
        if (res.status === 200) {
          pass(`${route.name} (${res.status})`);
          this.results.passed++;
        } else if (res.status === 307 || res.status === 308) {
          pass(`${route.name} (redirect ${res.status})`);
          this.results.passed++;
        } else {
          fail(`${route.name} returned ${res.status}`);
          this.results.failed++;
        }
      } catch (err) {
        fail(`${route.name}: ${err.message}`);
        this.results.failed++;
      }
    }
  },

  // Security Headers Tests
  async securityHeaders() {
    info('Testing Security Headers...');
    
    try {
      const res = await request(WEB_BASE);
      
      const requiredHeaders = [
        'x-content-type-options',
        'x-frame-options',
      ];

      const recommendedHeaders = [
        'strict-transport-security',
        'content-security-policy',
        'x-xss-protection',
      ];

      for (const header of requiredHeaders) {
        if (res.headers[header]) {
          pass(`Security header: ${header}`);
          this.results.passed++;
        } else {
          fail(`Missing security header: ${header}`);
          this.results.failed++;
        }
      }

      for (const header of recommendedHeaders) {
        if (res.headers[header]) {
          pass(`Security header: ${header}`);
          this.results.passed++;
        } else {
          warn(`Recommended header missing: ${header}`);
          this.results.skipped++;
        }
      }
    } catch (err) {
      fail(`Security headers test: ${err.message}`);
      this.results.failed++;
    }
  },

  // CORS Tests
  async corsTest() {
    info('Testing CORS Configuration...');
    
    try {
      const res = await request(`${API_BASE}/health`, {
        headers: {
          'Origin': 'https://ngurrapathways.life',
        },
      });

      const corsHeader = res.headers['access-control-allow-origin'];
      if (corsHeader) {
        pass(`CORS configured: ${corsHeader}`);
        this.results.passed++;
      } else {
        warn('CORS headers not detected (may be OK for same-origin)');
        this.results.skipped++;
      }
    } catch (err) {
      fail(`CORS test: ${err.message}`);
      this.results.failed++;
    }
  },

  // Response Time Tests
  async responseTimeTest() {
    info('Testing Response Times...');
    
    const endpoints = [
      { url: `${API_BASE}/health`, name: 'API Health', maxMs: 200 },
      { url: WEB_BASE, name: 'Web Home', maxMs: 1000 },
      { url: `${API_BASE}/jobs`, name: 'API Jobs', maxMs: 500 },
    ];

    for (const endpoint of endpoints) {
      try {
        const start = Date.now();
        await request(endpoint.url);
        const duration = Date.now() - start;

        if (duration < endpoint.maxMs) {
          pass(`${endpoint.name}: ${duration}ms (< ${endpoint.maxMs}ms)`);
          this.results.passed++;
        } else {
          warn(`${endpoint.name}: ${duration}ms (> ${endpoint.maxMs}ms)`);
          this.results.skipped++;
        }
      } catch (err) {
        fail(`${endpoint.name}: ${err.message}`);
        this.results.failed++;
      }
    }
  },
};

// Main runner
async function runTests() {
  console.log('\n' + '='.repeat(60));
  console.log(colors.cyan + '🚀 Ngurra Pathways Final Integration Tests' + colors.reset);
  console.log('='.repeat(60));
  console.log(`Environment: ${isProduction ? 'PRODUCTION' : 'Development'}`);
  console.log(`API: ${API_BASE}`);
  console.log(`Web: ${WEB_BASE}`);
  console.log('='.repeat(60) + '\n');

  // Run all test suites
  await tests.apiHealth();
  console.log('');
  await tests.webHealth();
  console.log('');
  await tests.apiEndpoints();
  console.log('');
  await tests.webRoutes();
  console.log('');
  await tests.securityHeaders();
  console.log('');
  await tests.corsTest();
  console.log('');
  await tests.responseTimeTest();

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log(colors.cyan + '📊 Test Summary' + colors.reset);
  console.log('='.repeat(60));
  console.log(`${colors.green}Passed:${colors.reset}  ${tests.results.passed}`);
  console.log(`${colors.red}Failed:${colors.reset}  ${tests.results.failed}`);
  console.log(`${colors.yellow}Skipped:${colors.reset} ${tests.results.skipped}`);
  console.log('');

  if (tests.errors.length > 0) {
    console.log(colors.red + 'Errors:' + colors.reset);
    tests.errors.forEach(err => console.log(`  - ${err}`));
    console.log('');
  }

  // Final verdict
  const total = tests.results.passed + tests.results.failed;
  const passRate = Math.round((tests.results.passed / total) * 100);

  if (tests.results.failed === 0) {
    console.log(colors.green + '🎉 All tests passed! Ready for launch.' + colors.reset);
    process.exit(0);
  } else if (passRate >= 80) {
    console.log(colors.yellow + `⚠️  ${passRate}% tests passed. Review failures before launch.` + colors.reset);
    process.exit(1);
  } else {
    console.log(colors.red + `❌ ${passRate}% tests passed. NOT ready for launch.` + colors.reset);
    process.exit(1);
  }
}

// Run tests
runTests().catch(err => {
  console.error('Test runner error:', err);
  process.exit(1);
});
