import { Router } from 'express';
import { requireAuth } from '@clerk/express';
import { hasPermission } from '../utils/clerk';
import Conversation from '../models/conversation.models';

const router = Router();

router.get("/", requireAuth(), async (req, res) => {
  const userId = hasPermission(req, res);

  try {
    const conversation = await Conversation.find({ userId });

    // Handle case where no conversation exists for the user
    if (!conversation.length) {
      return res.status(200).send([]);
    }

    res.status(200).send({
      conversations: conversation[0].conversations,
      length: conversation[0].conversations.length,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send("Error fetching conversation!");
  }
});

export default router; 