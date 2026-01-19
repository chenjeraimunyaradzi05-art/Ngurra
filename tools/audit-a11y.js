#!/usr/bin/env node
// A simple automated accessibility audit using Puppeteer + axe-core
// Usage:
// 1) npm i
// 2) node tools/audit-a11y.js

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const axeSource = require('axe-core').source;

(async () => {
  const root = process.cwd();
  const pages = [
    'index.html',
    'jobs.html',
    'job.html',
    'pathways.html',
    'ai-integration.html',
    'admin.html',
    'financial-literacy.html',
    'certificates.html',
    'justice.html'
  ];

  console.log('Starting accessibility audit for pages:', pages.join(', '));

  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const results = [];

  for (const p of pages) {
    const abs = path.join(root, p);
    if (!fs.existsSync(abs)) {
      console.log(`Skipping ${p} — file not found`);
      continue;
    }

    const url = 'file://' + abs;
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });

    // inject axe
    await page.evaluate(axeSource);
    const axeResults = await page.evaluate(async () => {
      return await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2aa','wcag2a'] } });
    });

    results.push({ page: p, url, violations: axeResults.violations, passes: axeResults.passes.length });

    // write each page result file
    const outFile = path.join(root, 'tools', 'a11y-report-' + p.replace(/\W+/g, '-') + '.json');
    fs.writeFileSync(outFile, JSON.stringify(axeResults, null, 2), 'utf8');
    console.log(`Saved report for ${p} -> ${path.relative(root, outFile)}`);

    await page.close();
  }

  await browser.close();

  // Summarize
  const summary = results.map(r => ({ page: r.page, violations: r.violations.length }))
  console.log('\nAudit summary:');
  console.table(summary);

  const merged = { generatedAt: new Date().toISOString(), pages: results };
  fs.writeFileSync(path.join(root, 'tools', 'a11y-summary.json'), JSON.stringify(merged, null, 2));
  console.log('Wrote tools/a11y-summary.json');

  process.exit(0);
})();
