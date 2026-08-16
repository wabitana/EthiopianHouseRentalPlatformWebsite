import { prisma as prismaClient } from './config/database';

export const prisma = prismaClient;

export async function withDbRetry<T>(fn: () => Promise<T>, retries = 3, delayMs = 1000): Promise<T> {
  let attempt = 0;
  while (attempt < retries) {
    try {
      return await fn();
    } catch (err: any) {
      attempt++;
      if (attempt >= retries) throw err;
      console.warn(`[Prisma Retry] Database query failed (attempt ${attempt}/${retries}). Retrying in ${delayMs}ms... Error: ${err?.message || err}`);
      await new Promise((res) => setTimeout(res, delayMs));
    }
  }
  throw new Error('Database operation failed after max retries');
}

export default prisma;
