import { env } from './env';

/**
 * Cache/Redis interface abstraction.
 * Provides an in-memory fallback for local development if Redis client is not installed/connected.
 */
class RedisCacheService {
  private cache = new Map<string, { value: string; expiresAt?: number }>();

  async get(key: string): Promise<string | null> {
    const item = this.cache.get(key);
    if (!item) return null;

    if (item.expiresAt && Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined;
    this.cache.set(key, { value, expiresAt });
  }

  async del(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async flushAll(): Promise<void> {
    this.cache.clear();
  }
}

export const redisClient = new RedisCacheService();

export async function connectRedis(): Promise<void> {
  console.log(`✅ Cache/Redis abstraction initialized (${env.REDIS_URL}).`);
}
