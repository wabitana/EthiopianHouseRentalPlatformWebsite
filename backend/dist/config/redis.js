"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisClient = void 0;
exports.connectRedis = connectRedis;
const env_1 = require("./env");
/**
 * Cache/Redis interface abstraction.
 * Provides an in-memory fallback for local development if Redis client is not installed/connected.
 */
class RedisCacheService {
    constructor() {
        this.cache = new Map();
    }
    async get(key) {
        const item = this.cache.get(key);
        if (!item)
            return null;
        if (item.expiresAt && Date.now() > item.expiresAt) {
            this.cache.delete(key);
            return null;
        }
        return item.value;
    }
    async set(key, value, ttlSeconds) {
        const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined;
        this.cache.set(key, { value, expiresAt });
    }
    async del(key) {
        this.cache.delete(key);
    }
    async flushAll() {
        this.cache.clear();
    }
}
exports.redisClient = new RedisCacheService();
async function connectRedis() {
    console.log(`✅ Cache/Redis abstraction initialized (${env_1.env.REDIS_URL}).`);
}
