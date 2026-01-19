#!/usr/bin/env node
/**
 * Screen Reader Testing Suite (Step 93)
 * 
 * Automated ARIA compliance and screen reader compatibility testing
 * Uses axe-core and custom checks for comprehensive accessibility verification
 * 
 * Usage:
 *   node tools/screen-reader-test.js [--url http://localhost:3000] [--pages all|public|auth]
 */

const puppeteer = require('puppeteer');
const axeSource = require('axe-core').source;
const fs = require('fs');
const path = require('path');

// Configuration
const DEFAULT_BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// Pages to test
const PUBLIC_PAGES = [
  { path: '/', name: 'Home Page' },
  { path: '/jobs', name: 'Jobs Listing' },
  { path: '/mentorship', name: 'Mentorship' },
  { path: '/courses', name: 'Training Courses' },
  { path: '/login', name: 'Login' },
  { path: '/register', name: 'Register' },
  { path: '/about', name: 'About' },
  { path: '/contact', name: 'Contact' },
  { path: '/help', name: 'Help Center' },
  { path: '/accessibility', name: 'Accessibility Statement' },
];

const AUTH_PAGES = [
  { path: '/member/dashboard', name: 'Member Dashboard' },
  { path: '/member/profile', name: 'Member Profile' },
  { path: '/member/applications', name: 'Applications' },
  { path: '/member/messages', name: 'Messages' },
  { path: '/ai', name: 'AI Hub' },
  { path: '/ai-wellness', name: 'AI Wellness' },
  { path: '/settings', name: 'Settings' },
];

// ARIA landmarks that should exist on every page
const REQUIRED_LANDMARKS = [
  { role: 'banner', name: 'Header/Banner', selector: 'header, [role="banner"]' },
  { role: 'main', name: 'Main Content', selector: 'main, [role="main"]' },
  { role: 'navigation', name: 'Navigation', selector: 'nav, [role="navigation"]' },
];

// Custom accessibility checks beyond axe-core
const CUSTOM_CHECKS = [
  {
    id: 'skip-link',
    name: 'Skip to main content link',
    check: async (page) => {
      const skipLink = await page.$('a[href="#main"], a[href="#main-content"], .skip-link');
      return {
        pass: !!skipLink,
        message: skipLink ? 'Skip link found' : 'Missing skip to main content link'
      };
    }
  },
  {
    id: 'heading-hierarchy',
    name: 'Heading hierarchy',
    check: async (page) => {
      const headings = await page.$$eval('h1, h2, h3, h4, h5, h6', els => 
        els.map(el => ({ level: parseInt(el.tagName[1]), text: el.textContent.trim().slice(0, 50) }))
      );
      
      if (headings.length === 0) {
        return { pass: false, message: 'No headings found' };
      }
      
      // Check for h1
      const hasH1 = headings.some(h => h.level === 1);
      if (!hasH1) {
        return { pass: false, message: 'Missing h1 heading' };
      }
      
      // Check for skipped levels
      let prevLevel = 0;
      for (const h of headings) {
        if (h.level > prevLevel + 1) {
          return { 
            pass: false, 
            message: `Heading level skipped: h${prevLevel || 'start'} to h${h.level}` 
          };
        }
        prevLevel = h.level;
      }
      
      return { pass: true, message: `${headings.length} headings with correct hierarchy` };
    }
  },
  {
    id: 'focus-visible',
    name: 'Focus indicators visible',
    check: async (page) => {
      // Tab through first 5 focusable elements and check for visible focus
      const focusableSelector = 'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])';
      const focusable = await page.$$(focusableSelector);
      
      let visibleFocusCount = 0;
      for (let i = 0; i < Math.min(5, focusable.length); i++) {
        await focusable[i].focus();
        const hasVisibleFocus = await page.evaluate(() => {
          const el = document.activeElement;
          const style = window.getComputedStyle(el);
          // Check for outline or box-shadow indicating focus
          return style.outline !== 'none' || 
                 style.boxShadow !== 'none' ||
                 el.classList.contains('focus-visible') ||
                 el.matches(':focus-visible');
        });
        if (hasVisibleFocus) visibleFocusCount++;
      }
      
      const pass = visibleFocusCount >= Math.min(3, focusable.length);
      return {
        pass,
        message: pass 
          ? `${visibleFocusCount}/${Math.min(5, focusable.length)} elements have visible focus`
          : 'Insufficient focus indicators'
      };
    }
  },
  {
    id: 'images-alt',
    name: 'Images have alt text',
    check: async (page) => {
      const images = await page.$$eval('img', imgs => 
        imgs.map(img => ({
          src: img.src.slice(-30),
          alt: img.alt,
          hasAlt: img.hasAttribute('alt'),
          isDecorative: img.alt === '' && img.getAttribute('role') === 'presentation'
        }))
      );
      
      const missingAlt = images.filter(img => !img.hasAlt);
      
      return {
        pass: missingAlt.length === 0,
        message: missingAlt.length === 0
          ? `All ${images.length} images have alt attributes`
          : `${missingAlt.length} images missing alt attribute`
      };
    }
  },
  {
    id: 'form-labels',
    name: 'Form inputs have labels',
    check: async (page) => {
      const inputs = await page.$$eval('input:not([type="hidden"]):not([type="submit"]):not([type="button"]), select, textarea', els => 
        els.map(el => {
          const id = el.id;
          const hasLabel = !!document.querySelector(`label[for="${id}"]`);
          const hasAriaLabel = !!el.getAttribute('aria-label');
          const hasAriaLabelledby = !!el.getAttribute('aria-labelledby');
          const hasPlaceholder = !!el.placeholder;
          const isLabelled = hasLabel || hasAriaLabel || hasAriaLabelledby;
          return {
            id: id || 'unnamed',
            type: el.type || el.tagName.toLowerCase(),
            isLabelled
          };
        })
      );
      
      const unlabelled = inputs.filter(i => !i.isLabelled);
      
      return {
        pass: unlabelled.length === 0,
        message: unlabelled.length === 0
          ? `All ${inputs.length} form inputs are labelled`
          : `${unlabelled.length} inputs missing labels: ${unlabelled.map(i => i.id).join(', ')}`
      };
    }
  },
  {
    id: 'aria-landmarks',
    name: 'ARIA landmarks present',
    check: async (page) => {
      const missing = [];
      
      for (const landmark of REQUIRED_LANDMARKS) {
        const exists = await page.$(landmark.selector);
        if (!exists) {
          missing.push(landmark.name);
        }
      }
      
      return {
        pass: missing.length === 0,
        message: missing.length === 0
          ? 'All required ARIA landmarks present'
          : `Missing landmarks: ${missing.join(', ')}`
      };
    }
  },
  {
    id: 'color-contrast',
    name: 'Color contrast (axe-core)',
    check: async (page) => {
      // Run just the color-contrast rule
      const results = await page.evaluate(async () => {
        return await axe.run(document, { runOnly: ['color-contrast'] });
      });
      
      const violations = results.violations;
      
      return {
        pass: violations.length === 0,
        message: violations.length === 0
          ? 'Color contrast passes WCAG AA'
          : `${violations[0]?.nodes?.length || 0} color contrast issues`
      };
    }
  },
  {
    id: 'interactive-roles',
    name: 'Interactive elements have roles',
    check: async (page) => {
      const issues = await page.$$eval('[onclick], [onkeydown]', els =>
        els.filter(el => {
          const tag = el.tagName.toLowerCase();
          const role = el.getAttribute('role');
          const isNativeInteractive = ['button', 'a', 'input', 'select', 'textarea'].includes(tag);
          return !isNativeInteractive && !role;
        }).map(el => el.className.slice(0, 30))
      );
      
      return {
        pass: issues.length === 0,
        message: issues.length === 0
          ? 'All interactive elements have proper roles'
          : `${issues.length} clickable elements missing role attribute`
      };
    }
  }
];

/**
 * Run screen reader compatibility tests
 */
async function runTests(options = {}) {
  const baseUrl = options.url || DEFAULT_BASE_URL;
  const pageSet = options.pages || 'public';
  
  console.log('🔍 Screen Reader Testing Suite');
  console.log('━'.repeat(50));
  console.log(`Base URL: ${baseUrl}`);
  console.log(`Testing: ${pageSet} pages`);
  console.log('');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const pages = pageSet === 'all' 
    ? [...PUBLIC_PAGES, ...AUTH_PAGES]
    : pageSet === 'auth' 
      ? AUTH_PAGES 
      : PUBLIC_PAGES;
  
  const results = {
    timestamp: new Date().toISOString(),
    baseUrl,
    summary: { total: 0, passed: 0, failed: 0 },
    pages: []
  };
  
  for (const pageInfo of pages) {
    console.log(`\n📄 Testing: ${pageInfo.name} (${pageInfo.path})`);
    console.log('─'.repeat(40));
    
    const page = await browser.newPage();
    const pageResult = {
      name: pageInfo.name,
      path: pageInfo.path,
      checks: [],
      axeViolations: [],
      passed: true
    };
    
    try {
      await page.goto(`${baseUrl}${pageInfo.path}`, {
        waitUntil: 'domcontentloaded',
        timeout: 30000
      });
      
      // Wait for content to load
      await page.waitForSelector('main, [role="main"], .container, #__next', { timeout: 5000 })
        .catch(() => {});
      
      // Inject axe-core
      await page.evaluate(axeSource);
      
      // Run custom checks
      for (const check of CUSTOM_CHECKS) {
        try {
          const result = await check.check(page);
          pageResult.checks.push({
            id: check.id,
            name: check.name,
            ...result
          });
          
          const icon = result.pass ? '✅' : '❌';
          console.log(`  ${icon} ${check.name}: ${result.message}`);
          
          if (!result.pass) {
            pageResult.passed = false;
            results.summary.failed++;
          } else {
            results.summary.passed++;
          }
          results.summary.total++;
        } catch (err) {
          console.log(`  ⚠️ ${check.name}: Error - ${err.message}`);
          pageResult.checks.push({
            id: check.id,
            name: check.name,
            pass: false,
            message: `Error: ${err.message}`
          });
        }
      }
      
      // Run full axe-core scan for additional violations
      const axeResults = await page.evaluate(async () => {
        return await axe.run(document, {
          runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] }
        });
      });
      
      const criticalViolations = axeResults.violations.filter(v => 
        v.impact === 'critical' || v.impact === 'serious'
      );
      
      if (criticalViolations.length > 0) {
        console.log(`\n  ⚠️ Axe-core found ${criticalViolations.length} critical/serious issues:`);
        criticalViolations.forEach(v => {
          console.log(`     - ${v.id}: ${v.help} (${v.nodes.length} instances)`);
        });
        pageResult.axeViolations = criticalViolations;
        pageResult.passed = false;
      }
      
    } catch (err) {
      console.log(`  ❌ Page error: ${err.message}`);
      pageResult.error = err.message;
      pageResult.passed = false;
    }
    
    results.pages.push(pageResult);
    await page.close();
  }
  
  await browser.close();
  
  // Summary
  console.log('\n');
  console.log('━'.repeat(50));
  console.log('📊 Summary');
  console.log('━'.repeat(50));
  console.log(`Total Checks: ${results.summary.total}`);
  console.log(`Passed: ${results.summary.passed} ✅`);
  console.log(`Failed: ${results.summary.failed} ❌`);
  console.log(`Pass Rate: ${((results.summary.passed / results.summary.total) * 100).toFixed(1)}%`);
  
  const failedPages = results.pages.filter(p => !p.passed);
  if (failedPages.length > 0) {
    console.log(`\n❌ Pages with issues (${failedPages.length}):`);
    failedPages.forEach(p => {
      const failedChecks = p.checks.filter(c => !c.pass);
      console.log(`   - ${p.name}: ${failedChecks.length} failed checks`);
    });
  }
  
  // Save report
  const reportPath = path.join(__dirname, 'screen-reader-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`\n📁 Full report saved to: ${reportPath}`);
  
  // Exit with error if failures
  process.exit(results.summary.failed > 0 ? 1 : 0);
}

// Parse CLI args
const args = process.argv.slice(2);
const options = {};

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--url' && args[i + 1]) {
    options.url = args[++i];
  } else if (args[i] === '--pages' && args[i + 1]) {
    options.pages = args[++i];
  }
}

// Run
runTests(options);
