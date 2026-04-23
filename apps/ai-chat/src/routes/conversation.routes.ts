import { Request, Response, Router } from 'express';
import { requireAuth } from '@clerk/express';
import { hasPermission } from '../utils/clerk';
import Conversation from '../models/conversation.models';
import Thread from '../models/thread.models';

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

router.put("/:id", requireAuth(), async (req, res) => {
  const userId = hasPermission(req, res);

  const { title, description } = req.body;

  try {
    const updateFields: Record<string, any> = {};
    if (title) updateFields["conversations.$.title"] = title;
    if (description) updateFields["conversations.$.description"] = description;
    
    // Update the updatedAt timestamp
    updateFields["conversations.$.updatedAt"] = new Date();

    if (Object.keys(updateFields).length === 1) {
      return res.status(400).send({ message: "No valid fields to update!" });
    }

    const result = await Conversation.updateOne(
      { userId, "conversations._id": req.params.id },
      { $set: updateFields }
    );

    if (!result.modifiedCount) {
      return res.status(404).send({ message: "Conversation not found!" });
    }

    res.status(200).send({ message: "Conversation updated successfully!" });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "Error updating conversation!" });
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

    await Thread.deleteMany({ _id: req.params.id });

    res.status(200).send({ message: "Conversation deleted successfully!" });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "Error deleting conversation!" });
  }
});

router.put("/:id/save", requireAuth(), async (req: Request, res: Response) => {
  const userId = hasPermission(req, res);

  try {
    await Conversation.updateOne(
      { userId: userId, "conversations._id": req.params.id },
      { $set: { 
        "conversations.$.isSaved": true,
        "conversations.$.updatedAt": new Date()
      } }
    );

    res.status(200).send({ message: "Conversation saved successfully!" });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "Error saving Conversation!" });
  }
});

router.put("/:id/unsave", requireAuth(), async (req: Request, res: Response) => {
  const userId = hasPermission(req, res);

  try {
    await Conversation.updateOne(
      { userId: userId, "conversations._id": req.params.id },
      { $set: { 
        "conversations.$.isSaved": false,
        "conversations.$.updatedAt": new Date()
      } }
    );

    res.status(200).send({ message: "Conversation unsaved successfully!" });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "Error unsaving Conversation!" });
  }
});

export default router; 