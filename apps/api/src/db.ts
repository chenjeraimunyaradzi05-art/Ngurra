import { PrismaClient } from '@prisma/client';
import { configureDatabaseUrl, databaseUrlSourceLabel } from './lib/databaseEnv';

/**
 * Shared Prisma client instance for the API.
 * Lazy initialization to allow proper environment loading.
 */

let _prisma: PrismaClient | null = null;

function createPrismaClient(): PrismaClient {
  const databaseEnv = configureDatabaseUrl();

  if (!databaseEnv.url) {
    console.error('❌ FATAL: no database connection URL is set!');
    console.error('   Set DATABASE_URL, or let Netlify Neon provide NETLIFY_DATABASE_URL.');
    console.error('   Example: postgresql://user:password@host:5432/database?sslmode=require');
    // In production, throw to fail fast. In dev, we might still create a client.
    if (process.env.NODE_ENV === 'production') {
      throw new Error('DATABASE_URL or NETLIFY_DATABASE_URL is required in production');
    }
  } else if (databaseEnv.source !== 'DATABASE_URL') {
    console.log(`🔌 Using ${databaseUrlSourceLabel(databaseEnv)}`);
  }
  
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn'] 
      : ['error'],
  });
}

// Lazy getter for prisma - only initializes when first accessed
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(target, prop) {
    if (!_prisma) {
      console.log('🔌 Initializing Prisma client...');
      _prisma = createPrismaClient();
    }
    return (_prisma as any)[prop];
  }
});
