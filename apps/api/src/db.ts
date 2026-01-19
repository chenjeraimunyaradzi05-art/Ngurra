import { PrismaClient } from '@prisma/client';

/**
 * Shared Prisma client instance for the API.
 */
export const prisma = new PrismaClient();
