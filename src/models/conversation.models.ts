import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    length: {
      type: Number,
      required: true,
      default: 0,
    },
    conversations: [
      new mongoose.Schema({
        _id: {
          type: String,
          required: true,
        },
        title: {
          type: String,
          required: true,
        },
        description: {
          type: String,
          required: false,
        },
        isSaved: {
          type: Boolean,
          default: false,
        },
      }, { timestamps: true }),
    ],
  },
);

export default mongoose.models.conversation ||
  mongoose.model("conversation", conversationSchema);
