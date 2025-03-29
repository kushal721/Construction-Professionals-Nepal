import ChatModel from "../models/ChatModel.js";

export const createChat = async (req, res) => {
  // Extract senderId and receiverId from the request body
  const { senderId, receiverId } = req.body;

  try {
    // Check if a chat already exists with the provided members
    const existingChat = await ChatModel.findOne({
      members: { $all: [senderId, receiverId] },
    });

    if (existingChat) {
      // If a chat already exists, return a response indicating it
      return res
        .status(200)
        .json({ message: "Chat already exists", chat: existingChat });
    }

    // If no chat exists, create a new one
    const newChat = new ChatModel({
      members: [senderId, receiverId],
    });

    // Save the new chat to the database
    const result = await newChat.save();

    // Return the newly created chat
    res
      .status(201)
      .json({ message: "Chat created successfully", chat: result });
  } catch (error) {
    // Handle any errors that occur during the process
    console.error("Error creating chat:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const userChats = async (req, res) => {
  try {
    const chat = await ChatModel.find({
      members: { $in: [req.params.userId] },
    });
    res.status(200).json(chat);
  } catch (error) {
    res.status(500).json(error);
  }
};

export const findChat = async (req, res) => {
  try {
    const chat = await ChatModel.findOne({
      members: { $all: [req.params.firstId, req.params.secondId] },
    });
    res.status(200).json(chat);
  } catch (error) {
    res.status(500).json({ error: error });
  }
};
