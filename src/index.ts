import 'dotenv/config';
import mongoose from 'mongoose';
import express, { Request, Response } from 'express';
import cors from 'cors';
import { Error } from 'mongoose';
import threadsRoutes from './routes/threads.routes';
import conversations from './routes/conversation.routes';

const port = process.env.PORT || 4000;

const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGO || '');
    console.log("Connected to MongoDB");
  } catch (err) {
    console.log(err);
  }
};

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json());

// Routes
app.use('/api/threads', threadsRoutes);
app.use('/api/conversations', conversations);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

app.listen(port, () => {
  connect();
  console.log(`Server is running on port ${port}`);
});