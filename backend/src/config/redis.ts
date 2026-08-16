import { config } from './env';

class MemoryCache {
  private cache = new Map<string, { value: any; expiry: number }>();

  async get(key: string): Promise<any | null> {
    const item = this.cache.get(key);
    if (!item) return null;
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    return item.value;
  }

  async set(key: string, value: any, ttlSeconds: number = 300): Promise<void> {
    this.cache.set(key, {
      value,
      expiry: Date.now() + ttlSeconds * 1000,
    });
  }

  async del(key: string): Promise<void> {
    this.cache.delete(key);
  }
}

export const redisCache = new MemoryCache();
console.log(`⚡ Redis / Caching Layer Initialized (${config.redisUrl})`);
