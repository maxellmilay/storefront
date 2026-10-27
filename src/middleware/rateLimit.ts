import type { NextFunction, Request, Response } from 'express';
import { createWindowLimiter } from '../lib/rateLimit.js';

/** Allows `max` requests per client IP in each window of `windowMs`. */
export function rateLimit(max: number, windowMs: number) {
  const limiter = createWindowLimiter(max, windowMs);

  return (req: Request, res: Response, next: NextFunction) => {
    const retryAfter = limiter.hit(req.ip ?? 'unknown');
    if (retryAfter > 0) {
      res.setHeader('Retry-After', String(retryAfter));
      return res.status(429).json({ error: 'Too many attempts, try again later' });
    }
    next();
  };
}
