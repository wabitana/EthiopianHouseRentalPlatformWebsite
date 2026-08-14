import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

// Helper for database queries with automatic retry for transient connection issues (P1001)
export async function withDbRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  let attempts = 0;
  while (attempts < maxRetries) {
    try {
      return await fn();
    } catch (error: any) {
      attempts++;
      if (error?.code === 'P1001' && attempts < maxRetries) {
        console.warn(`⚠️ Database connection warning (P1001). Retrying attempt ${attempts}/${maxRetries}...`);
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempts));
      } else {
        throw error;
      }
    }
  }
  throw new Error('Database connection failed after maximum retries');
}
