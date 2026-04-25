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

  try {
    const [currentWindowUsage, persistentUsage] = await Promise.all([
      redis.zcard(key),
      Usage.findOne({ identifier: id })
    ]);

    return res.json({ 
      id, 
      current24hUsage: currentWindowUsage,
      totalAllTimeUsage: persistentUsage?.totalMessages || 0,
      lastActive: persistentUsage?.lastActive
    });
  } catch (error) {
    console.error("Stats API error:", error);
    return res.status(500).json({ error: "Failed to fetch usage stats" });
  }
});

export default router;
