import { Router } from 'express';
import { requireAuth } from '@clerk/express';
import { hasPermission } from '../utils/clerk';
import Conversation from '../models/conversation.models';
import Chat from '../models/chat.models';

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
    res.status(500).send({ message: "Error fetching conversation!" });
  }
});

router.delete("/:id", requireAuth(), async (req, res) => {
  const userId = hasPermission(req, res);

  try {
    const deletedConversation = await Conversation.updateOne(
      { userId: userId },
      { $pull: { conversations: { _id: req.params.id } } }
    );

    if (!deletedConversation.modifiedCount) {
      return res.status(404).send({ message:"Conversation not found!"});
    }

    await Chat.deleteMany({ _id: req.params.id });

    res.status(200).send({ message: "Conversation deleted successfully!" });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "Error deleting conversation!" });
  }
});

export default router; 