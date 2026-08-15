import { Request, Response, NextFunction } from 'express';
import { redisClient } from '../config/redis';
import { sendError } from '../utils/response';

export function rateLimit(options: { windowMs?: number; max?: number } = {}) {
  const windowMs = options.windowMs || 15 * 60 * 1000; // 15 mins default
  const max = options.max || 100; // 100 requests per window default
  const windowSeconds = Math.ceil(windowMs / 1000);

  return async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const key = `ratelimit:${req.baseUrl || ''}:${ip}`;

    try {
      const currentVal = await redisClient.get(key);
      const count = currentVal ? parseInt(currentVal, 10) : 0;

      if (count >= max) {
        return sendError(
          res,
          'Too many requests from this IP, please try again later.',
          429,
          'RATE_LIMIT_EXCEEDED'
        );
      }

      await redisClient.set(key, (count + 1).toString(), windowSeconds);
      next();
    } catch (err) {
      // If rate limiter fails, fail open to avoid breaking app availability
      next();
    }
  };
}
