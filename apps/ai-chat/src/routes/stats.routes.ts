import { Router, Request, Response } from 'express';
import redis from '../utils/redis';
import { Usage } from '../models/stats.models';

const router = Router();

/**
 * @route GET /api/stats/usage/:id
 * @desc Get usage for a specific user or guest ID
 */
router.get('/usage/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const key = `usage:limit:${id}`;

  console.log(`[Stats API] Fetching usage for ID: ${id}`);

  try {
    let currentWindowUsage = 0;
    try {
      // Try to get Redis usage, but don't fail the whole request if Redis is down
      currentWindowUsage = await redis.zcard(key);
    } catch (redisError) {
      console.error("[Stats API] Redis error:", redisError);
      // Fallback to 0 if Redis fails
    }

    let persistentUsage = null;
    try {
      persistentUsage = await Usage.findOne({ identifier: id });
    } catch (dbError) {
      console.error("[Stats API] Database error:", dbError);
      // Fallback to null if DB fails
    }

    return res.json({ 
      id, 
      current24hUsage: currentWindowUsage,
      totalAllTimeUsage: persistentUsage?.totalMessages || 0,
      lastActive: persistentUsage?.lastActive || null
    });
  } catch (error) {
    console.error("[Stats API] Unexpected error:", error);
    return res.status(500).json({ 
      error: "Failed to fetch usage stats",
      message: error instanceof Error ? error.message : "Internal server error"
    });
  }
});

export default router;
