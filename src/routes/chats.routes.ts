import { Router, Request, Response } from 'express';
import { requireAuth } from '@clerk/express';
import Chat from '../models/chat.models';
import { hasPermission } from '../utils/clerk';
import Conversation from '../models/conversation.models';

const router = Router();

router.post("/", requireAuth(), async (req: Request, res: Response) => {
  const userId = hasPermission(req, res);
  const { title, description } = req.body;

  try {
    // CREATE A NEW CHAT
    const newChat = new Chat({
      userId: userId,
      history: [
        { role: "user", parts: [{ text: title }] }, 
        { role: "model", parts: [{ text: description }] }
      ],
    });

    const savedChat = await newChat.save();

    // CHECK IF THE CONVERSATION EXISTS
    const conversation = await Conversation.find({ userId: userId });

    // IF DOESN'T EXIST CREATE A NEW ONE AND ADD THE CHAT IN THE CHATS ARRAY
    if (!conversation.length) {
      const newConversation = new Conversation({
        userId: userId,
        conversations: [
          {
            _id: savedChat._id,
            title,
            description,
          },
        ],
      });

      await newConversation.save();
    } else {
      // IF EXISTS, PUSH THE CHAT TO THE EXISTING ARRAY
      await Conversation.updateOne(
        { userId: userId },
        {
          $push: {
            conversations: {
              _id: savedChat._id,
              title,
              description,
            },
          },
        }
      );

      res.status(201).send(newChat._id);
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Error creating chat!");
  }
});

router.get("/:id", requireAuth(), async (req: Request, res: Response) => {
  const userId = hasPermission(req, res);

  try {
    const chat = await Chat.findOne({ _id: req.params.id, userId });

    res.status(200).send(chat);
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "Error fetching chat!" });
  }
});

router.put("/:id", requireAuth(), async (req: Request, res: Response) => {
  const userId = hasPermission(req, res);

  const { question, answer, img } = req.body;

  const newItems = [
    ...(question
      ? [{ role: "user", parts: [{ text: question }], ...(img && { img }) }]
      : []),
    { role: "model", parts: [{ text: answer }] },
  ];

  try {
    const updatedChat = await Chat.updateOne(
      { _id: req.params.id, userId },
      {
        $push: {
          history: {
            $each: newItems,
          },
        },
      }
    );
    res.status(200).send(updatedChat);
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "Error adding conversation!" });
  }
});

router.delete("/:id", requireAuth(), async (req: Request, res: Response) => {
  const userId = hasPermission(req, res);

  try {
    const deletedChat = await Chat.deleteOne({ _id: req.params.id, userId });

    if (!deletedChat.deletedCount) {
      return res.status(404).send({ message: "Chat not found!" });
    }

    res.status(200).send({ message: "Chat deleted successfully!" });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "Error deleting chat!" });
  }
});

export default router; 