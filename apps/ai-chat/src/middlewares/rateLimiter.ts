import { Request, Response, NextFunction } from 'express';
import { getAuth } from '@clerk/express';
import redis from '../utils/redis';
import { Usage } from '../models/stats.models';

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
  const INDIVIDUAL_LIMIT = isUser ? 6 : 3;
  const GLOBAL_LIMIT = 30;

  const today = new Date().toISOString().split('T')[0];
  const individualKey = `usage:limit:${identifier}`;
  const globalKey = `usage:global:daily:${today}`;

  try {
    // Fetch counts from Redis
    const [individualUsage, globalUsage] = await Promise.all([
      redis.zcard(individualKey),
      redis.get(globalKey)
    ]);

    const individualCount = individualUsage;
    const globalCount = parseInt(globalUsage || '0', 10);

    // 1. Check Global Limit (Total 30)
    if (globalCount >= GLOBAL_LIMIT) {
      return res.status(429).json({
        error: "Global quota exceeded",
        message: "The server has reached its total daily limit. Please try again tomorrow.",
        limit: GLOBAL_LIMIT,
        usage: globalCount
      });
    }

    // 2. Check Individual Limit (Guest 3, User 6)
    if (individualCount >= INDIVIDUAL_LIMIT) {
      return res.status(429).json({ 
        error: "Individual quota exceeded",
        message: `You have reached your limit of ${INDIVIDUAL_LIMIT} questions per day.`,
        limit: INDIVIDUAL_LIMIT,
        usage: individualCount
      });
    }

    next();
  } catch (error) {
    console.error("Rate limiter error:", error);
    next(); // Fail-open
  }
};
