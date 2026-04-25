import { Request, Response, NextFunction } from 'express';
import { getAuth } from '@clerk/express';
import redis from '../utils/redis';

export const rateLimiter = async (req: Request, res: Response, next: NextFunction) => {
  const auth = getAuth(req);
  const userId = auth.userId;
  
  // For guests, we expect a unique identifier in the 'x-guest-id' header
  // This should be the persistent cookie ID managed by the frontend
  const guestId = req.headers['x-guest-id'] as string;
  
  const identifier = userId || guestId;
  
  if (!identifier) {
    return res.status(401).json({ message: "Identifier missing (Login or Guest ID required)" });
  }

  const isUser = !!userId;
  const LIMIT = isUser ? 6 : 3;
  const WINDOW_SECONDS = 24 * 60 * 60; // 24 hours
  
  const key = `usage:limit:${identifier}`;
  const now = Date.now();
  const windowStart = now - (WINDOW_SECONDS * 1000);

  try {
    // We use a pipeline for performance but need to check count before adding
    const pipeline = redis.pipeline();
    pipeline.zremrangebyscore(key, 0, windowStart);
    pipeline.zcard(key);
    
    const results = await pipeline.exec();
    if (!results) throw new Error("Redis pipeline failed");

    const currentUsage = results[1][1] as number;

    if (currentUsage >= LIMIT) {
      return res.status(429).json({ 
        error: "Quota exceeded",
        message: `You have reached your limit of ${LIMIT} questions per 24 hours.`,
        limit: LIMIT,
        usage: currentUsage,
        nextReset: new Date(now + WINDOW_SECONDS * 1000).toISOString() // Approximate
      });
    }

    // Add current request
    await redis.zadd(key, now, now.toString());
    await redis.expire(key, WINDOW_SECONDS);

    next();
  } catch (error) {
    console.error("Rate limiter error:", error);
    next(); // Fail-open
  }
};
