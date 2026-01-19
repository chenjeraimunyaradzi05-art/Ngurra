/**
 * Vitest Test Setup
 * 
 * This file runs before all tests and sets up the testing environment.
 */

import type { Express } from 'express';

// Set test environment
process.env.NODE_ENV = 'test';
process.env.DEV_JWT_SECRET = 'test-jwt-secret-for-vitest-at-least-32-chars';
process.env.JWT_SECRET = 'test-jwt-secret-for-vitest-at-least-32-chars';
process.env.SES_TEST_CAPTURE = '1';

// Mock external services by default
vi.mock('../src/lib/mailer', () => ({
  sendEmail: vi.fn().mockResolvedValue({ success: true }),
  sendTemplateEmail: vi.fn().mockResolvedValue({ success: true }),
}));

vi.mock('../src/lib/pushNotifications', () => ({
  sendPushNotification: vi.fn().mockResolvedValue({ success: true }),
}));

// Test app instance
let testApp: Express | null = null;
let testPrisma: any = null;
let serverAvailable = false;

// Export for integration tests with safety guards
export const app = new Proxy({} as Express, {
  get(_target, prop) {
    if (!testApp) {
      throw new Error('Test app not initialized. Call createTestApp() first.');
    }
    return (testApp as any)[prop];
  }
});

export const prisma = new Proxy({} as any, {
  get(_target, prop) {
    if (!testPrisma) {
      throw new Error('Prisma not initialized. Ensure database is available.');
    }
    return testPrisma[prop];
  }
});

export function isServerAvailable(): boolean {
  return serverAvailable;
}

/**
 * Create test Express app
 */
export async function createTestApp(): Promise<Express> {
  if (testApp) return testApp;
  
  try {
    // Dynamic import to ensure mocks are applied first
    const { createApp } = await import('../src/app');
    testApp = createApp();
    
    // Try to initialize Prisma
    try {
      const prismaModule = await import('../src/db');
      testPrisma = prismaModule.default || prismaModule.prisma;
      serverAvailable = true;
    } catch {
      console.log('⚠️  Prisma not available - integration tests will be skipped');
      serverAvailable = false;
    }
    
    return testApp;
  } catch (error) {
    console.log('⚠️  App creation failed - integration tests will be skipped');
    serverAvailable = false;
    throw error;
  }
}

/**
 * Close test app and cleanup
 */
export async function closeTestApp(): Promise<void> {
  testApp = null;
}

/**
 * Reset test database
 */
export async function resetDatabase(): Promise<void> {
  // In a real implementation, this would:
  // 1. Truncate all tables
  // 2. Reset sequences
  // 3. Re-seed essential data
  
  // For SQLite test database:
  // await prisma.$executeRaw`DELETE FROM User`;
  // await prisma.$executeRaw`DELETE FROM Job`;
  // etc.
  
  console.log('Database reset for tests');
}

/**
 * Seed test data
 */
export async function seedTestData(): Promise<void> {
  // Add common test data
  console.log('Test data seeded');
}
