import mongoose from "mongoose";

const threadSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    history: [
      new mongoose.Schema({
        role: {
          type: String,
          enum: ["user", "model"],
          required: true,
        },
        parts: [
          new mongoose.Schema({
            text: {
              type: String,
              required: true,
            },
            // todo handle images
            img: {
              type: String,
              required: false,
            },
          }, { timestamps: true }),
        ],
      }, { timestamps: true }),
    ],
  },
  { 
    toJSON: {
      transform: function(doc, ret) {
        delete ret.userId;
        return ret;
      }
    }
  }
);

export default mongoose.models.thread || mongoose.model("thread", threadSchema);

