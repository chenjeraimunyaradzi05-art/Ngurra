#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const outDir = path.join(process.cwd(), 'snapshot-merge-artifacts');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const now = new Date();
const argv = process.argv.slice(2);
const useSigned = argv.includes('--signed') || argv.includes('--s3');

// parse count / min / max arguments
function getArgValue(flag) {
  const idx = argv.indexOf(flag);
  if (idx === -1) return undefined;
  return argv[idx + 1];
}

const countArg = getArgValue('--count');
const minArg = getArgValue('--min');
const maxArg = getArgValue('--max');

let count = 2; // default previews
if (countArg) {
  const n = parseInt(countArg, 10);
  if (!Number.isNaN(n) && n > 0) count = n;
} else if (minArg || maxArg) {
  const min = parseInt(minArg || '1', 10) || 1;
  const max = parseInt(maxArg || String(min), 10) || min;
  if (max < min) count = min; else count = Math.floor(Math.random() * (max - min + 1)) + min;
}

function signedUrl(pathPart) {
  // Create a fake S3 signed URL for testing purposes (not a real signed URL)
  const expires = Math.floor(Date.now() / 1000) + 60 * 60 * 24; // 24h in the future
  const token = Math.random().toString(36).slice(2, 12);
  return `https://s3.example.com/${pathPart}?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=FAKE%2F${expires}%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=${new Date().toISOString()}&X-Amz-Expires=86400&X-Amz-Signature=${token}`;
}

// generate arrays of previews/thumbs by count
const previews = new Array(count).fill(0).map((_, i) => {
  const name = `preview-${i + 1}.png`;
  return useSigned ? signedUrl(`previews/${name}`) : `https://via.placeholder.com/1200x630.png?text=${encodeURIComponent('preview-' + (i + 1))}`;
});

const thumbsSmall = new Array(count).fill(0).map((_, i) => {
  const name = `preview-${i + 1}-small.png`;
  return useSigned ? signedUrl(`previews/thumbs/${name}`) : `https://via.placeholder.com/320x180.png?text=${encodeURIComponent('thumb-' + (i + 1) + '-small')}`;
});

const thumbsMedium = new Array(count).fill(0).map((_, i) => {
  const name = `preview-${i + 1}-medium.png`;
  return useSigned ? signedUrl(`previews/thumbs/${name}`) : `https://via.placeholder.com/640x360.png?text=${encodeURIComponent('thumb-' + (i + 1) + '-medium')}`;
});

const sample = {
  pr_number: 42,
  merge_sha: Math.random().toString(16).slice(2, 14),
  short_sha: Math.random().toString(16).slice(2, 8),
  run_url: 'https://github.com/your-org/your-repo/actions/runs/1234567890',
  merged_by: 'local:dry-run',
  files_changed: ['apps/web/tests/snapshots/example-1.png', 'apps/web/tests/snapshots/example-2.png'],
  timestamp: now.toISOString(),
  preview_urls: previews,
  thumbnail_urls: {
    small: thumbsSmall,
    medium: thumbsMedium
  },
  preview_type: useSigned ? 'signed-s3' : 'public'
};

const outPath = path.join(outDir, 'sample-metadata.json');
fs.writeFileSync(outPath, JSON.stringify(sample, null, 2), 'utf8');
console.log('Wrote sample metadata to', outPath);
console.log(JSON.stringify(sample, null, 2));
