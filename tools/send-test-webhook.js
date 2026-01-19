#!/usr/bin/env node
// Simple test harness to POST a sample notification payload (Slack/Teams/Discord style)
// Usage: WEBHOOK_URL=<url> node tools/send-test-webhook.js [platform]
// platform: slack|teams|discord|all (default: all)

const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

// CLI args parsing: allow --webhook or --url and optional platform argument
const argv = process.argv.slice(2);
let webhookUrl = '';
let platform = 'all';

let stagingMode = false;
let confirmPost = false;
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === '--webhook' || a === '--url') {
    webhookUrl = argv[i + 1] || '';
    i++;
    continue;
  }
  // allow platform as positional argument when --webhook isn't used
  if (!a.startsWith('--') && !webhookUrl) {
    // treat first positional as platform if it matches expected values
    if (['slack', 'teams', 'discord', 'all'].includes(a)) platform = a;
    continue;
  }
  if (a === '--platform') {
    platform = argv[i + 1] || platform;
    i++;
  }
  if (a === '--staging') {
    stagingMode = true;
    continue;
  }
  if (a === '--confirm' || a === '--yes' || a === '--i-know') {
    confirmPost = true;
    continue;
  }
}

// fallback to env vars if CLI didn't provide URL or platform
// staging mode picks STAGING_WEBHOOK env if not provided
if (stagingMode) {
  webhookUrl = webhookUrl || process.env.STAGING_WEBHOOK || process.env.STAGING_WEBHOOK_URL || '';
} else {
  webhookUrl = webhookUrl || process.env.WEBHOOK_URL || process.env.TEST_WEBHOOK || '';
}
platform = platform || process.env.TEST_WEBHOOK_PLATFORM || 'all';

if (!webhookUrl) {
  if (stagingMode) console.error('Missing STAGING_WEBHOOK (or --webhook) environment variable for staging mode. Aborting.');
  else console.error('Missing WEBHOOK_URL or TEST_WEBHOOK environment variable. Aborting.');
  process.exit(1);
}

const dir = path.join(process.cwd(), 'snapshot-merge-artifacts');
if (!fs.existsSync(dir)) {
  console.error('No snapshot-merge-artifacts directory found. Run the workflow or place a metadata file there first.');
  process.exit(1);
}

const files = fs.readdirSync(dir).filter(f => f.endsWith('.json')).sort();
if (files.length === 0) {
  console.error('No metadata files found in snapshot-merge-artifacts/');
  process.exit(1);
}

const metaPath = path.join(dir, files[files.length - 1]);
const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));

const metaPrNumber = meta.pr_number || meta.pr || meta.prn || meta.prNum;
const prDisplay = typeof metaPrNumber !== 'undefined' ? `#${metaPrNumber}` : '(PR unknown)';

const sample = {
  metadata: meta,
  slack: {
    text: `Playwright snapshots auto-merged — PR ${prDisplay}`,
    preview: (meta.preview_urls && meta.preview_urls[0]) || null,
    thumbs: meta.thumbnail_urls || []
  },
  teams: {
    title: `Playwright snapshots auto-merged — PR ${prDisplay}`,
    preview: (meta.preview_urls && meta.preview_urls[0]) || null,
    thumbs: meta.thumbnail_urls || []
  },
  discord: {
    content: `<@&ROLE_ID> Playwright snapshots auto-merged — PR ${prDisplay}`,
    embed: {
      title: `Playwright snapshots auto-merged — PR ${prDisplay}`,
      image: (meta.thumbnail_urls && meta.thumbnail_urls[0]) || (meta.preview_urls && meta.preview_urls[0]) || null
    }
  }
};

async function postJson(url, body) {
  try {
    const res = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
    const text = await res.text();
    console.log('POST', url, '->', res.status, res.statusText);
    console.log(text);
  } catch (err) {
    console.error('Failed to POST sample payload:', err);
  }
}

// Safety: require explicit confirmation when posting to a staging or production channel
if (stagingMode && !confirmPost && !(process.env.STAGING_CONFIRM && process.env.STAGING_CONFIRM === '1')) {
  console.error('Staging mode is enabled but no confirmation flag provided. Use --confirm or set STAGING_CONFIRM=1 to allow posting to staging channels. Aborting.');
  process.exit(2);
}

(async () => {
  console.log('Posting sample payload to', webhookUrl, 'platform=', platform, stagingMode ? '(staging)' : '');
  if (platform === 'all' || platform === 'slack') {
    await postJson(webhookUrl, { type: 'slack', payload: sample.slack });
  }
  if (platform === 'all' || platform === 'teams') {
    await postJson(webhookUrl, { type: 'teams', payload: sample.teams });
  }
  if (platform === 'all' || platform === 'discord') {
    await postJson(webhookUrl, { type: 'discord', payload: sample.discord });
  }
  console.log('Done');
})();
