"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisCache = void 0;
const env_1 = require("./env");
class MemoryCache {
    constructor() {
        this.cache = new Map();
    }
    async get(key) {
        const item = this.cache.get(key);
        if (!item)
            return null;
        if (Date.now() > item.expiry) {
            this.cache.delete(key);
            return null;
        }
        return item.value;
    }
    async set(key, value, ttlSeconds = 300) {
        this.cache.set(key, {
            value,
            expiry: Date.now() + ttlSeconds * 1000,
        });
    }
    async del(key) {
        this.cache.delete(key);
    }
}
exports.redisCache = new MemoryCache();
console.log(`⚡ Redis / Caching Layer Initialized (${env_1.config.redisUrl})`);
