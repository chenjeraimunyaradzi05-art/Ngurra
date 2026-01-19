#!/usr/bin/env node
// Tools self-check: run non-destructive validations and smoke tests for the CI helper tooling
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function run(cmd, args, opts={}){
  console.log('\n> RUN:', cmd, args.join(' '));
  const r = spawnSync(cmd, args, { stdio: 'inherit', ...opts });
  if (r.error) {
    console.error('Error running', cmd, args.join(' '), r.error);
    process.exit(r.status || 1);
  }
  if (r.status !== 0) {
    console.error('Command failed:', cmd, args.join(' '));
    process.exit(r.status);
  }
}

console.log('Running tools self-check (safe, non-destructive)');

// ensure sample metadata exists
const outDir = path.join(process.cwd(), 'snapshot-merge-artifacts');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

run('node', ['tools/create-sample-metadata.js', '--count', '1']);

// validate docs for placeholders
run('node', ['tools/validate-snapshot-ci-md.js']);

// run local-dryrun script in no-post mode
run('node', ['tools/local-dryrun.js', '--count', '1', '--platform', 'all']);

// test fetch artifact helper in dry-run (PowerShell) — allow non-windows shells to run pwsh
const pwsh = process.platform === 'win32' ? 'pwsh' : 'pwsh';
run(pwsh, ['-File', 'tools/fetch-last-artifact.ps1', '--dry-run']);

console.log('\nTools self-check completed OK');
process.exit(0);
