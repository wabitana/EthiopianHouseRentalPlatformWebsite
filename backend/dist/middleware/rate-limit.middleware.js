"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimit = rateLimit;
const redis_1 = require("../config/redis");
const response_1 = require("../utils/response");
function rateLimit(options = {}) {
    const windowMs = options.windowMs || 15 * 60 * 1000; // 15 mins default
    const max = options.max || 100; // 100 requests per window default
    const windowSeconds = Math.ceil(windowMs / 1000);
    return async (req, res, next) => {
        const ip = req.ip || req.socket.remoteAddress || 'unknown';
        const key = `ratelimit:${req.baseUrl || ''}:${ip}`;
        try {
            const currentVal = await redis_1.redisClient.get(key);
            const count = currentVal ? parseInt(currentVal, 10) : 0;
            if (count >= max) {
                return (0, response_1.sendError)(res, 'Too many requests from this IP, please try again later.', 429, 'RATE_LIMIT_EXCEEDED');
            }
            await redis_1.redisClient.set(key, (count + 1).toString(), windowSeconds);
            next();
        }
        catch (err) {
            // If rate limiter fails, fail open to avoid breaking app availability
            next();
        }
    };
}
