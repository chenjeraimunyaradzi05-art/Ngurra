import * as esbuild from 'esbuild';
import { glob } from 'glob';
import path from 'path';
import fs from 'fs';

// Find all TypeScript files in src directory
const entryPoints = await glob('src/**/*.ts', {
  ignore: ['**/*.test.ts', '**/*.spec.ts', '**/tests/**']
});

console.log(`Building ${entryPoints.length} files...`);

try {
  await esbuild.build({
    entryPoints,
    bundle: false,
    outdir: 'dist',
    platform: 'node',
    target: 'node20',
    format: 'cjs',
    sourcemap: true,
    logLevel: 'info',
  });
  
  // Copy prisma schema if exists
  const prismaSchemaPath = 'prisma/schema.prisma';
  if (fs.existsSync(prismaSchemaPath)) {
    const distPrismaDir = 'dist/prisma';
    if (!fs.existsSync(distPrismaDir)) {
      fs.mkdirSync(distPrismaDir, { recursive: true });
    }
    fs.copyFileSync(prismaSchemaPath, path.join(distPrismaDir, 'schema.prisma'));
  }
  
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}
