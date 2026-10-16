import mongoose from "mongoose";

const ChatSchema = new mongoose.Schema(
  {
    members: { type: [String] },
    lastMessage: { type: String },
    lastMessageAt: { type: Date },
  },
  { timestamps: true }
);

ChatSchema.index({ members: 1 });

const ChatModel = mongoose.model("Chat", ChatSchema);

export default ChatModel;
