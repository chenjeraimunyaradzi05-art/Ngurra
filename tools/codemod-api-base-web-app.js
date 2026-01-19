const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const TARGET_DIR = path.join(ROOT, 'apps', 'web', 'src', 'app');

const FALLBACK_EXPR = "process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'";
const API_BASE_IMPORT = "import { API_BASE } from '@/lib/apiBase';";

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(fullPath));
    } else if (entry.isFile()) {
      if (/\.(jsx?|tsx?)$/i.test(entry.name)) files.push(fullPath);
    }
  }
  return files;
}

function hasApiBaseImport(content) {
  return /import\s*\{\s*API_BASE\s*\}\s*from\s*['\"]@\/lib\/apiBase['\"];?/.test(content);
}

function insertImport(content) {
  if (hasApiBaseImport(content)) return content;

  const lines = content.split(/\r?\n/);
  let insertAt = 0;

  // Keep 'use client' directive as first statement if present.
  if (lines.length > 0 && /^\s*['\"]use client['\"];?\s*$/.test(lines[0])) {
    insertAt = 1;
    // allow optional blank line after directive
    if (lines[1] === '') insertAt = 2;
  }

  lines.splice(insertAt, 0, API_BASE_IMPORT);
  return lines.join('\n');
}

function transform(content) {
  if (!content.includes(FALLBACK_EXPR)) return { changed: false, content };

  let next = content;

  // Remove local API_BASE constant if present, BEFORE replacing expressions.
  next = next.replace(
    /^\s*const\s+API_BASE\s*=\s*process\.env\.NEXT_PUBLIC_API_URL\s*\|\|\s*'http:\/\/localhost:3001';\s*\r?\n/m,
    ''
  );

  // Replace all remaining inline fallbacks with shared constant.
  next = next.split(FALLBACK_EXPR).join('API_BASE');

  // Insert import if needed.
  next = insertImport(next);

  return { changed: next !== content, content: next };
}

function main() {
  if (!fs.existsSync(TARGET_DIR)) {
    console.error(`Target directory not found: ${TARGET_DIR}`);
    process.exit(1);
  }

  const files = walk(TARGET_DIR);
  let changedCount = 0;

  for (const filePath of files) {
    const original = fs.readFileSync(filePath, 'utf8');
    const { changed, content } = transform(original);
    if (!changed) continue;

    fs.writeFileSync(filePath, content, 'utf8');
    changedCount += 1;
  }

  console.log(`codemod-api-base-web-app: updated ${changedCount} file(s)`);
}

main();
