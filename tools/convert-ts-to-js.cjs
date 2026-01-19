#!/usr/bin/env node
/* eslint-disable no-console */

const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');

function parseArgs(argv) {
  const args = { app: null, dryRun: false };
  for (let i = 2; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === '--app') {
      args.app = argv[i + 1];
      i += 1;
      continue;
    }
    if (token === '--dry-run') {
      args.dryRun = true;
      continue;
    }
    if (token === '--help' || token === '-h') {
      args.help = true;
      continue;
    }
    throw new Error(`Unknown arg: ${token}`);
  }
  return args;
}

function shouldIgnorePath(absPath) {
  const normalized = absPath.replace(/\\/g, '/');
  return (
    normalized.includes('/node_modules/') ||
    normalized.includes('/dist/') ||
    normalized.includes('/.next/')
  );
}

async function walkDir(rootDir, onFile) {
  const entries = await fsp.readdir(rootDir, { withFileTypes: true });
  for (const entry of entries) {
    const abs = path.join(rootDir, entry.name);
    if (shouldIgnorePath(abs)) continue;
    if (entry.isDirectory()) {
      await walkDir(abs, onFile);
      continue;
    }
    if (entry.isFile()) {
      await onFile(abs);
    }
  }
}

function loadTypeScriptFromCwd() {
  // Resolve TypeScript relative to the package we're running inside (pnpm filter exec).
  // This avoids requiring TypeScript from the repo root.
  // eslint-disable-next-line global-require
  const tsPath = require.resolve('typescript', { paths: [process.cwd()] });
  // eslint-disable-next-line global-require
  return require(tsPath);
}

function isUnder(absPath, absDir) {
  const rel = path.relative(absDir, absPath);
  return !!rel && !rel.startsWith('..') && !path.isAbsolute(rel);
}

function replaceExt(absPath, newExt) {
  return absPath.replace(/\.(ts|tsx)$/i, newExt);
}

async function ensureParentDir(filePath) {
  await fsp.mkdir(path.dirname(filePath), { recursive: true });
}

async function convertFile({ ts, absPath, compilerOptions, dryRun }) {
  const sourceText = await fsp.readFile(absPath, 'utf8');

  const isTsx = absPath.toLowerCase().endsWith('.tsx');
  const outPath = replaceExt(absPath, isTsx ? '.jsx' : '.js');

  const effectiveCompilerOptions = { ...compilerOptions };
  if (isTsx) {
    effectiveCompilerOptions.jsx = ts.JsxEmit.Preserve;
  }

  const result = ts.transpileModule(sourceText, {
    compilerOptions: {
      ...effectiveCompilerOptions,
    },
    fileName: path.basename(absPath),
    reportDiagnostics: true,
  });

  const diagnostics = result.diagnostics || [];
  const blocking = diagnostics.filter((d) => d.category === ts.DiagnosticCategory.Error);
  if (blocking.length > 0) {
    const msgs = blocking
      .slice(0, 5)
      .map((d) => ts.flattenDiagnosticMessageText(d.messageText, '\n'))
      .join('\n');
    throw new Error(`TypeScript transpile errors in ${absPath}:\n${msgs}`);
  }

  if (!dryRun) {
    await ensureParentDir(outPath);
    await fsp.writeFile(outPath, result.outputText, 'utf8');
  }

  return { outPath };
}

async function main() {
  const args = parseArgs(process.argv);

  if (args.help || !args.app) {
    console.log('Usage: node tools/convert-ts-to-js.cjs --app api|web [--dry-run]');
    process.exit(args.help ? 0 : 1);
  }

  const ts = loadTypeScriptFromCwd();

  const cwd = process.cwd();
  const app = String(args.app).toLowerCase();

  const tasks = [];

  if (app === 'api') {
    const srcDir = path.join(cwd, 'src');
    const testsDir = path.join(cwd, 'tests');
    const prismaDir = path.join(cwd, 'prisma');

    const compilerOptions = {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.CommonJS,
      moduleResolution: ts.ModuleResolutionKind.NodeJs,
      esModuleInterop: true,
      resolveJsonModule: true,
    };

    const roots = [srcDir, testsDir, prismaDir].filter((d) => fs.existsSync(d));
    for (const root of roots) {
      tasks.push(
        walkDir(root, async (absPath) => {
          if (!/\.(ts|tsx)$/i.test(absPath)) return;
          if (absPath.toLowerCase().endsWith('.d.ts')) return;
          await convertFile({ ts, absPath, compilerOptions, dryRun: args.dryRun });
        })
      );
    }
  } else if (app === 'web') {
    const srcDir = path.join(cwd, 'src');
    const testsDir = path.join(cwd, 'tests');
    const e2eDir = path.join(cwd, 'e2e');

    const compilerOptionsSrc = {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.NodeJs,
      esModuleInterop: true,
      resolveJsonModule: true,
    };

    const compilerOptionsNode = {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.CommonJS,
      moduleResolution: ts.ModuleResolutionKind.NodeJs,
      esModuleInterop: true,
      resolveJsonModule: true,
    };

    if (fs.existsSync(srcDir)) {
      tasks.push(
        walkDir(srcDir, async (absPath) => {
          if (!/\.(ts|tsx)$/i.test(absPath)) return;
          if (absPath.toLowerCase().endsWith('.d.ts')) return;
          await convertFile({ ts, absPath, compilerOptions: compilerOptionsSrc, dryRun: args.dryRun });
        })
      );
    }

    const nodeRoots = [testsDir, e2eDir].filter((d) => fs.existsSync(d));
    for (const root of nodeRoots) {
      tasks.push(
        walkDir(root, async (absPath) => {
          if (!/\.(ts|tsx)$/i.test(absPath)) return;
          if (absPath.toLowerCase().endsWith('.d.ts')) return;
          await convertFile({ ts, absPath, compilerOptions: compilerOptionsNode, dryRun: args.dryRun });
        })
      );
    }
  } else {
    throw new Error(`Unknown --app: ${args.app} (expected api or web)`);
  }

  await Promise.all(tasks);
  console.log(`Done TS→JS conversion for ${args.app}${args.dryRun ? ' (dry-run)' : ''}.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
