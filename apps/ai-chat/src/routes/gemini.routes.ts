import mongoose from 'mongoose';
import { Router, Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import Thread from '../models/gemini.models';

const router = Router();

const googleAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

router.post('/ask-gemini', async (req: Request, res: Response) => {
  const { message, threadId, userId } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const startTime = Date.now();
  let fullResponse = '';

  try {
    const response = await googleAI.models.generateContentStream({
      model: 'gemini-3.1-flash-lite-preview',
      contents: message,
      config: {
        maxOutputTokens: 1000,
      }
    });

    for await (const chunk of response) {
      const chunkText = chunk.text;
      fullResponse += chunkText;
      
      res.write(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
    }

    const responseTimeMs = Date.now() - startTime;

    await Thread.findOneAndUpdate(
      { _id: threadId || new mongoose.Types.ObjectId() },
      {
        $push: {
          messages: [
            { role: 'user', content: message, createdAt: new Date() },
            { 
              role: 'model', 
              content: fullResponse, 
              metadata: { model: 'gemini-3.1-flash-lite-preview', responseTimeMs },
              createdAt: new Date()
            }
          ]
        },
        $setOnInsert: { userId }
      },
      { upsert: true, new: true }
    );

    // Signal end of stream
    res.write('data: [DONE]\n\n');
    res.end();

  } catch (error: any) {
    console.error('Gemini API Error:', error);
    const errorMessage = typeof error.message === 'string' ? error.message : 'Internal Server Error';
    res.write(`data: ${JSON.stringify({ error: errorMessage })}\n\n`);
    res.end();
  }
});


export default router;