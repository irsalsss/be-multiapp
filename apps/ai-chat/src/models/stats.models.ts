import mongoose, { Schema, Document } from 'mongoose';

export interface IStatsUsage extends Document {
  identifier: string;
  totalMessages: number;
  lastActive: Date;
}

const UsageSchema: Schema = new Schema({
  identifier: { type: String, required: true, unique: true },
  totalMessages: { type: Number, default: 0 },
  lastActive: { type: Date, default: Date.now }
}, { timestamps: true });

export const Usage = mongoose.model<IStatsUsage>('Usage', UsageSchema);

const DailyStatsSchema: Schema = new Schema({
  date: { type: String, required: true, unique: true },
  count: { type: Number, default: 0 }
}, { timestamps: true });

