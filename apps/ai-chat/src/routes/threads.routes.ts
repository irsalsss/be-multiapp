import { Router, Request, Response } from 'express';
import Thread from '../models/thread.models';
import { getIdentifier } from '../utils/clerk';
import Conversation from '../models/conversation.models';
import { Usage } from '../models/stats.models';
import redis from '../utils/redis';
import { rateLimiter } from '../middlewares/rateLimiter';

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  const { userId, guestId } = getIdentifier(req);
  const { title } = req.body;

  try {
    // CREATE A NEW THREAD
    const newThread = new Thread({
      userId,
      guestId,
      history: [
        { role: "user", parts: [{ text: title }] }, 
      ],
    });

    const savedThread = await newThread.save();

    // CHECK IF THE CONVERSATION EXISTS
    const conversation = await Conversation.find(userId ? { userId } : { guestId });

    // IF DOESN'T EXIST CREATE A NEW ONE AND ADD THE THREAD IN THE THREADS ARRAY
    if (!conversation.length) {
      const newConversation = new Conversation({
        userId,
        guestId,
        conversations: [
          {
            _id: savedThread._id,
            title,
          },
        ],
      });

      await newConversation.save();
      res.status(201).send(savedThread._id);
    } else {
      // IF EXISTS, PUSH THE THREAD TO THE EXISTING ARRAY
      await Conversation.updateOne(
        userId ? { userId } : { guestId },
        {
          $push: {
            conversations: {
              _id: savedThread._id,
              title,
            },
          },
        }
      );

      res.status(201).send(newThread._id);
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Error creating thread!");
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  const { userId, guestId } = getIdentifier(req);

  try {
    const thread = await Thread.findOne({ _id: req.params.id, ...(userId ? { userId } : { guestId }) });
    
    if (!thread) {
      return res.status(404).send({ message: "Thread not found!" });
    }
    
    const conversationDoc = await Conversation.findOne(userId ? { userId } : { guestId });
    
    const conversationItem = conversationDoc?.conversations?.find(
      (conv: any) => conv._id.toString() === req.params.id
    );

    const threadObj = thread.toObject();
    const conversationObj = conversationItem ? conversationItem.toObject() : {};
    
    // Remove unwanted fields
    delete threadObj.userId;
    delete threadObj.__v;
    delete conversationObj.userId;
    delete conversationObj.__v;

    const response = {
      ...threadObj,
      ...conversationObj,
    };

    res.status(200).send(response);
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "Error fetching thread!" });
  }
});

router.put("/:id", rateLimiter, async (req: Request, res: Response) => {
  const { userId, guestId } = getIdentifier(req);

  const { question, answer, img } = req.body;

  const newItems = [
    ...(question
      ? [{ role: "user", parts: [{ text: question }], ...(img && { img }) }]
      : []),
  ];

  if (answer) {
    newItems.push({ role: "model", parts: [{ text: answer }] });
  }

  try {
    const history = await Thread.findOne({ _id: req.params.id, ...(userId ? { userId } : { guestId }) });

    if (history?.history?.length === 1) {
      const updateFields: Record<string, any> = {};
      updateFields["conversations.$.description"] = answer;
      updateFields["conversations.$.updatedAt"] = new Date();

      await Conversation.updateOne(
        { ...(userId ? { userId } : { guestId }), "conversations._id": req.params.id },
        { $set: updateFields }
      );
    }

    const updatedThread = await Thread.findOneAndUpdate(
      { _id: req.params.id, ...(userId ? { userId } : { guestId }) },
      {
        $push: {
          history: {
            $each: newItems,
          },
        },
      },
      { new: true }
    );

    // Increment usage only on success
    const identifier = userId || guestId;
    if (identifier) {
      const today = new Date().toISOString().split('T')[0];
      const individualKey = `usage:limit:${identifier}`;
      const globalKey = `usage:global:daily:${today}`;
      const now = Date.now();

      const pipeline = redis.pipeline();
      // Individual usage (ZSET for sliding window or simple count)
      pipeline.zadd(individualKey, now, now.toString());
      pipeline.expire(individualKey, 60 * 60 * 24); 
      // Global usage (Daily string counter)
      pipeline.incr(globalKey);
      pipeline.expire(globalKey, 60 * 60 * 25);
      
      pipeline.exec().catch(err => console.error("Redis usage sync error:", err));

      // Persistent MongoDB usage
      Usage.findOneAndUpdate(
        { identifier },
        { $inc: { totalMessages: 1 }, lastActive: new Date() },
        { upsert: true }
      ).catch(err => console.error("MongoDB Usage sync error:", err));
    }

    res.status(200).send({
      ...newItems[0],
      id: updatedThread?._id,
      createdAt: updatedThread?.createdAt,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "Error adding thread!" });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  const { userId, guestId } = getIdentifier(req);

  try {
    const deletedThread = await Thread.deleteOne({ _id: req.params.id, ...(userId ? { userId } : { guestId }) });

    if (!deletedThread.deletedCount) {
      return res.status(404).send({ message: "Thread not found!" });
    }

    res.status(200).send({ message: "Thread deleted successfully!" });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "Error deleting thread!" });
  }
});

// TODO handle unit tests for the routes

export default router;

