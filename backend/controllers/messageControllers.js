const asyncHandler = require("express-async-handler");
const Message = require("../models/messageModel");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");

//@description     Get all Messages
//@route           GET /api/Message/:chatId
//@access          Protected
const allMessages = asyncHandler(async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name pic email")
      .populate("chat");
    res.json(messages);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

//@description     Create New Message
//@route           POST /api/Message/
//@access          Protected
const sendMessage = asyncHandler(async (req, res) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    console.log("Invalid data passed into request");
    return res.status(400).json({ error: "Invalid data passed into request" });
  }

  const newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId,
  };

  try {
    const message = await Message.create(newMessage);

    // Populate necessary fields
    await message
      .populate("sender", "name pic")
      .populate("chat")
      .execPopulate();

    await User.populate(message, {
      path: "chat.users",
      select: "name pic email",
    });

    // Update latestMessage in Chat model
    await Chat.findByIdAndUpdate(chatId, { latestMessage: message });

    // Log the new message
    console.log("New message created:", message);

    // Respond with the created message
    res.json(message);
  } catch (error) {
    console.error("Error creating message:", error);
    res.status(400).json({ error: error.message });
    // Alternatively, you can use next(error) if you have an error handling middleware
    // next(error);
  }
});


module.exports = { allMessages, sendMessage };
