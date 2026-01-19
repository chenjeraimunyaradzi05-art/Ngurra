#!/usr/bin/env node
/**
 * Local dry-run runner for snapshot CI tests.
 *
 * Usage:
 *   node tools/local-dryrun.js --count 3 --signed --webhook https://webhook.site/ID --platform slack [--post]
 *
 * By default this will generate a sample metadata file (using create-sample-metadata.js),
 * print the payloads that would be sent, and only POST when --post is provided.
 */

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

const argv = process.argv.slice(2);
function getArg(name) {
  const i = argv.indexOf(name);
  if (i === -1) return null;
  return argv[i + 1] || true;
}

const count = getArg('--count') || 2;
const signed = argv.includes('--signed') || argv.includes('--s3');
const webhook = getArg('--webhook') || process.env.WEBHOOK_URL || process.env.TEST_WEBHOOK || '';
const staging = argv.includes('--staging') || false;
const confirm = argv.includes('--confirm') || argv.includes('--yes') || false;
const platform = getArg('--platform') || process.env.TEST_WEBHOOK_PLATFORM || 'all';
const doPost = argv.includes('--post');

// Build args for sample metadata generator
const genArgs = ['tools/create-sample-metadata.js', '--count', String(count)];
if (signed) genArgs.push('--signed');

console.log('Running sample generator:', genArgs.join(' '));
const res = spawnSync('node', genArgs, { stdio: 'inherit' });
if (res.status !== 0) {
  console.error('Sample metadata generator failed');
  process.exit(res.status || 1);
}

const metaFile = path.join(process.cwd(), 'snapshot-merge-artifacts', 'sample-metadata.json');
if (!fs.existsSync(metaFile)) {
  console.error('No sample metadata found at', metaFile);
  process.exit(2);
}

const meta = JSON.parse(fs.readFileSync(metaFile, 'utf8'));

// create payloads similar to send-test-webhook
function buildPayloads(metadata) {
  const pr = metadata.pr_number || metadata.pr || metadata.prn || 0;
  const prDisplay = pr ? `PR #${pr}` : 'PR (unknown)';
  const slack = { type: 'slack', payload: { text: `Playwright snapshots auto-merged — ${prDisplay}`, preview: (metadata.preview_urls && metadata.preview_urls[0]) || null, thumbs: metadata.thumbnail_urls || [] } };
  const teams = { type: 'teams', payload: { title: `Playwright snapshots auto-merged — ${prDisplay}`, preview: (metadata.preview_urls && metadata.preview_urls[0]) || null, thumbs: metadata.thumbnail_urls || [] } };
  const discord = { type: 'discord', payload: { content: `<@&ROLE_ID> Playwright snapshots auto-merged — ${prDisplay}`, embed: { title: `Playwright snapshots auto-merged — ${prDisplay}`, image: (metadata.thumbnail_urls && metadata.thumbnail_urls[0]) || (metadata.preview_urls && metadata.preview_urls[0]) || null } } };
  return { slack, teams, discord };
}

const payloads = buildPayloads(meta);

console.log('\n--- Prepared payloads (no POST yet) ---\n');
console.log('Platform:', platform);
if (platform === 'all' || platform === 'slack') console.log('\n-- SLACK payload --\n', JSON.stringify(payloads.slack, null, 2));
if (platform === 'all' || platform === 'teams') console.log('\n-- TEAMS payload --\n', JSON.stringify(payloads.teams, null, 2));
if (platform === 'all' || platform === 'discord') console.log('\n-- DISCORD payload --\n', JSON.stringify(payloads.discord, null, 2));

// If staging mode and no webhook provided, try staging env var
let webhookUrl = webhook;
if (staging) {
  webhookUrl = webhookUrl || process.env.STAGING_WEBHOOK || process.env.STAGING_WEBHOOK_URL || '';
}

if (!webhookUrl) {
  console.log('\nNo webhook provided. To actually POST test payloads set --webhook <URL> or set WEBHOOK_URL env var.');
  process.exit(0);
}
// safety: if posting to staging and not explicitly confirmed, refuse
if (staging && doPost && !confirm && !(process.env.STAGING_CONFIRM && process.env.STAGING_CONFIRM === '1')) {
  console.error('\nStaging mode with --post requires explicit confirmation. Provide --confirm or set STAGING_CONFIRM=1 to proceed.');
  process.exit(2);
}

if (!doPost) {
  console.log('\nRun with --post to actually POST the payloads to the webhook (this will send HTTP requests).');
  process.exit(0);
}

(async () => {
  console.log('\nPosting prepared payloads to', webhookUrl, staging ? '(staging)' : '');
  const targets = [];
  if (platform === 'all' || platform === 'slack') targets.push(payloads.slack);
  if (platform === 'all' || platform === 'teams') targets.push(payloads.teams);
  if (platform === 'all' || platform === 'discord') targets.push(payloads.discord);

  for (const t of targets) {
    try {
      const resp = await fetch(webhookUrl, { method: 'POST', body: JSON.stringify(t), headers: { 'content-type': 'application/json' } });
      const text = await resp.text();
      console.log('POST ->', resp.status, resp.statusText);
      console.log(text);
    } catch (err) {
      console.error('POST failed:', String(err));
    }
  }
})();
