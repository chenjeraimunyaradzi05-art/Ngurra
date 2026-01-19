#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'SNAPSHOT_CI_VALIDATION.md');
if (!fs.existsSync(filePath)) {
  console.error('Missing SNAPSHOT_CI_VALIDATION.md');
  process.exit(2);
}

const src = fs.readFileSync(filePath, 'utf8');
const problems = [];

// detect angle-bracket placeholders like <your-id> or <your-webhook-url>
const angleMatches = src.match(/<[^>]+>/g) || [];
angleMatches.forEach(m => {
  if (/your/i.test(m) || /your-?webhook/i.test(m) || /your-id/i.test(m)) {
    problems.push({ match: m, reason: 'Angle-bracket placeholder — replace with plain text or backtick code' });
  }
});

// detect common placeholder markers that might be left raw (e.g. '<YOUR_WEBHOOK_URL>' or similar)
if (/<your[-_A-Z0-9]+>/i.test(src)) {
  problems.push({ match: '<...>', reason: 'Detected placeholder-like token (use plain text or code-style placeholder instead)' });
}

if (problems.length > 0) {
  console.error('Validation failed for SNAPSHOT_CI_VALIDATION.md — found placeholder issues:');
  problems.forEach(p => console.error(` - ${p.match} — ${p.reason}`));
  process.exit(1);
} else {
  console.log('SNAPSHOT_CI_VALIDATION.md looks clean (no angle-bracket placeholders found).');
  process.exit(0);
}
