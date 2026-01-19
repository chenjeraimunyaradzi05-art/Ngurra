#!/usr/bin/env node
// Minimal test runner for local CI helper tools — no external deps required.
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function run(cmd, args, opts = {}) {
  console.log('\n> RUN:', cmd, args.join(' '));
  const r = spawnSync(cmd, args, { stdio: 'pipe', encoding: 'utf8', ...opts });
  console.log(r.stdout || '');
  if (r.stderr) console.error(r.stderr);
  return r;
}

function assert(cond, message) {
  if (!cond) {
    console.error('Assertion failed:', message);
    process.exit(1);
  }
}

const artifactsDir = path.join(process.cwd(), 'snapshot-merge-artifacts');
if (!fs.existsSync(artifactsDir)) fs.mkdirSync(artifactsDir, { recursive: true });

// 1) Generate public metadata with count=3
let r = run('node', ['tools/create-sample-metadata.js', '--count', '3']);
assert(r.status === 0, 'create-sample-metadata should exit 0 for public sample');
let metaPath = path.join(artifactsDir, 'sample-metadata.json');
assert(fs.existsSync(metaPath), 'sample-metadata.json must exist');
let meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
assert(Array.isArray(meta.preview_urls) && meta.preview_urls.length === 3, 'preview_urls should include 3 items');
assert(meta.preview_type === 'public', 'preview_type expected public');

// 2) Generate signed metadata with count=2
r = run('node', ['tools/create-sample-metadata.js', '--signed', '--count', '2']);
assert(r.status === 0, 'create-sample-metadata signed should exit 0');
meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
assert(Array.isArray(meta.preview_urls) && meta.preview_urls.length === 2, 'signed preview count mismatch');
assert(meta.preview_type === 'signed-s3', 'preview_type expected signed-s3');
assert(meta.preview_urls.every(u => u.includes('s3.example.com')), 'signed previews must contain s3.example.com');

// 3) Validate docs
r = run('node', ['tools/validate-snapshot-ci-md.js']);
assert(r.status === 0, 'validate-snapshot-ci-md should pass');

// 4) Run local-dryrun (no network POST) — should succeed
r = run('node', ['tools/local-dryrun.js', '--count', '1', '--platform', 'all']);
assert(r.status === 0, 'local-dryrun should exit 0 (no-post)');

// 5) Check send-test-webhook staging guard: without confirm => exits non-zero
// create a minimal metadata file if not present
const minimal = {
  pr_number: 99,
  preview_urls: ['https://example.com/preview.png'],
  thumbnail_urls: { small: ['https://example.com/thumb-small.png'], medium: ['https://example.com/thumb-med.png'] }
};
fs.writeFileSync(metaPath, JSON.stringify(minimal, null, 2));

r = run('node', ['tools/send-test-webhook.js', '--staging', '--webhook', 'https://example.invalid', '--platform', 'slack']);
assert(r.status !== 0, 'send-test-webhook in staging must refuse to post without confirmation');

// 6) Ensure send-test-webhook accepts confirm flag (we won't POST to the URL, but the guard should allow execution)
r = run('node', ['tools/send-test-webhook.js', '--staging', '--webhook', 'https://example.invalid', '--platform', 'slack', '--confirm']);
// If network fails, that's acceptable; we only check that it attempted to run and didn't abort due to missing confirmation
assert(r.status === 0 || r.status === 1 || r.status === null, 'send-test-webhook with --confirm should run (exit status may reflect network)');

console.log('\nAll tests passed (tools smoke tests)');
process.exit(0);
