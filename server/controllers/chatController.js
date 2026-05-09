const Chat = require("../models/Chat");
const { generateChatReply, generateFarmingPlan } = require("../services/aiService");

// ─────────────────────────────────────────
//  POST /api/chat  — send message + get AI reply, persisted to MongoDB
// ─────────────────────────────────────────
exports.chat = async (req, res) => {
  try {
    const { message, chatId, userContext = {} } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({ success: false, message: "Message is required" });
    }

    const lang     = userContext.language || req.user?.language || "English";
    const location = req.user?.location || userContext.location || "India";

    // Load or create the Chat document
    let chatDoc;
    if (chatId) {
      chatDoc = await Chat.findOne({ _id: chatId, userId: req.user._id });
      if (!chatDoc) {
        return res.status(404).json({ success: false, message: "Chat not found" });
      }
    } else {
      chatDoc = new Chat({ userId: req.user._id, messages: [] });
    }

    // Build history from persisted messages
    const history = chatDoc.messages.map(m => ({ role: m.role, content: m.content }));

    // Generate reply
    const reply = await generateChatReply({ message, history, lang, location });

    // Persist both turns
    chatDoc.messages.push({ role: "user", content: message });
    chatDoc.messages.push({ role: "ai",   content: reply });

    // Auto-title from first user message (truncated)
    if (chatDoc.messages.length === 2) {
      chatDoc.title = message.slice(0, 60) + (message.length > 60 ? "…" : "");
    }

    await chatDoc.save();

    return res.status(200).json({
      success: true,
      reply,
      chatId: chatDoc._id,
    });

  } catch (err) {
    console.error("[chatController] chat error:", err.message);
    return handleAIError(err, res);
  }
};

// ─────────────────────────────────────────
//  GET /api/chat  — get all chats for current user
// ─────────────────────────────────────────
exports.getChats = async (req, res) => {
  try {
    const chats = await Chat
      .find({ userId: req.user._id })
      .select("title createdAt updatedAt messages")
      .sort({ updatedAt: -1 })
      .lean();

    // Return summary (no full message bodies for list view)
    const summary = chats.map(c => ({
      _id:          c._id,
      title:        c.title,
      messageCount: c.messages.length,
      lastMessage:  c.messages[c.messages.length - 1]?.content?.slice(0, 80) || "",
      updatedAt:    c.updatedAt,
      createdAt:    c.createdAt,
    }));

    return res.status(200).json({ success: true, chats: summary });

  } catch (err) {
    console.error("[chatController] getChats error:", err.message);
    return res.status(500).json({ success: false, message: "Could not fetch chats" });
  }
};

// ─────────────────────────────────────────
//  GET /api/chat/:id  — get one chat with full messages
// ─────────────────────────────────────────
exports.getChatById = async (req, res) => {
  try {
    const chat = await Chat.findOne({ _id: req.params.id, userId: req.user._id }).lean();
    if (!chat) {
      return res.status(404).json({ success: false, message: "Chat not found" });
    }
    return res.status(200).json({ success: true, chat });

  } catch (err) {
    console.error("[chatController] getChatById error:", err.message);
    return res.status(500).json({ success: false, message: "Could not fetch chat" });
  }
};

// ─────────────────────────────────────────
//  DELETE /api/chat/:id
// ─────────────────────────────────────────
exports.deleteChat = async (req, res) => {
  try {
    const chat = await Chat.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!chat) {
      return res.status(404).json({ success: false, message: "Chat not found" });
    }
    return res.status(200).json({ success: true, message: "Chat deleted" });

  } catch (err) {
    console.error("[chatController] deleteChat error:", err.message);
    return res.status(500).json({ success: false, message: "Could not delete chat" });
  }
};

// ─────────────────────────────────────────
//  POST /api/chat/generate-plan
// ─────────────────────────────────────────
exports.generatePlan = async (req, res) => {
  try {
    const { cropName, location, season } = req.body;

    if (!cropName?.trim()) {
      return res.status(400).json({ success: false, message: "cropName is required" });
    }

    const plan = await generateFarmingPlan({
      cropName,
      location: location || req.user?.location || "India",
      season,
    });

    return res.status(200).json({ success: true, plan });

  } catch (err) {
    console.error("[chatController] generatePlan error:", err.message);
    return handleAIError(err, res);
  }
};

// ─────────────────────────────────────────
//  Shared error handler
// ─────────────────────────────────────────
function handleAIError(err, res) {
  const status = err?.response?.status;

  if (status === 429) {
    return res.status(429).json({ success: false, message: "AI rate limit reached — please wait a moment." });
  }
  if (status === 401 || status === 403) {
    return res.status(500).json({ success: false, message: "AI API key invalid or expired." });
  }
  if (err.code === "ECONNABORTED" || err.message?.includes("timeout")) {
    return res.status(504).json({ success: false, message: "AI request timed out — please try again." });
  }

  return res.status(500).json({ success: false, message: err.message || "AI service error" });
}
