import ChatModel from "../models/ChatModel.js";
import MessageModel from "../models/MessageModel.js";
import UserModel from "../models/User.js";
import { emitToUser } from "../services/realtime.js";
import { HttpError, asyncHandler, assertObjectId, requireFields } from "../utils/http.js";

const loadMyChat = async (req) => {
  assertObjectId(req.params.id, "Conversation");
  const chat = await ChatModel.findById(req.params.id);
  if (!chat || !chat.members.includes(req.user._id.toString())) {
    throw new HttpError(404, "Conversation not found");
  }
  return chat;
};

// Conversations for the signed-in user with the other participant attached.
export const listChats = asyncHandler(async (req, res) => {
  const me = req.user._id.toString();
  const chats = await ChatModel.find({ members: me }).sort({ lastMessageAt: -1, updatedAt: -1 }).lean();
  const otherIds = chats.map((c) => c.members.find((m) => m !== me)).filter(Boolean);
  const others = await UserModel.find({ _id: { $in: otherIds } }).select("username profile role").lean();
  const byId = new Map(others.map((u) => [u._id.toString(), u]));
  res.json(
    chats
      .map((c) => ({ ...c, otherUser: byId.get(c.members.find((m) => m !== me)) || null }))
      .filter((c) => c.otherUser)
  );
});

// Find or create a 1:1 conversation with another user.
export const openChat = asyncHandler(async (req, res) => {
  requireFields(req.body, ["userId"]);
  const me = req.user._id.toString();
  const other = req.body.userId;
  assertObjectId(other, "User");
  if (other === me) throw new HttpError(400, "You can't message yourself");
  const otherUser = await UserModel.findById(other).select("username profile role").lean();
  if (!otherUser) throw new HttpError(404, "User not found");

  let chat = await ChatModel.findOne({ members: { $all: [me, other], $size: 2 } }).lean();
  if (!chat) chat = (await ChatModel.create({ members: [me, other] })).toObject();
  res.json({ ...chat, otherUser });
});

export const listMessages = asyncHandler(async (req, res) => {
  const chat = await loadMyChat(req);
  const messages = await MessageModel.find({ chatId: chat._id.toString() }).sort({ createdAt: 1 }).lean();
  res.json(messages);
});

export const sendMessage = asyncHandler(async (req, res) => {
  requireFields(req.body, ["text"]);
  const chat = await loadMyChat(req);
  const message = await MessageModel.create({
    chatId: chat._id.toString(),
    senderId: req.user._id.toString(),
    text: req.body.text,
  });
  chat.lastMessage = message.text.slice(0, 140);
  chat.lastMessageAt = message.createdAt;
  await chat.save();

  chat.members.forEach((member) => emitToUser(member, "message:new", message));
  res.status(201).json(message);
});
