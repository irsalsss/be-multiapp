import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage {
  role: 'user' | 'model';
  content: string;
  metadata?: {
    model: string;
    responseTimeMs?: number;
  };
  createdAt: Date;
}

export interface IThread extends Document {
  userId: string; // Or however you identify users
  messages: IMessage[];
}

const ThreadSchema: Schema = new Schema({
  userId: { type: String, required: true },
  messages: [{
    role: { type: String, enum: ['user', 'model'], required: true },
    content: { type: String, required: true },
    metadata: {
      model: String,
      responseTimeMs: Number,
    },
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

export default mongoose.model<IThread>('Thread', ThreadSchema);