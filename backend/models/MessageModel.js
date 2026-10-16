import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    chatId: { type: String, index: true },
    senderId: { type: String },
    text: { type: String, trim: true, maxlength: 4000 },
  },
  { timestamps: true }
);

const MessageModel = mongoose.model("Message", MessageSchema);

export default MessageModel;
