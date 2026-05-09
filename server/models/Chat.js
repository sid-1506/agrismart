const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  role:    { type: String, enum: ["user", "ai"], required: true },
  content: { type: String, required: true },
}, { timestamps: { createdAt: true, updatedAt: false } });

const chatSchema = new mongoose.Schema({
  userId: {
    type:     mongoose.Schema.Types.ObjectId,
    ref:      "User",
    required: true,
    index:    true,
  },
  title:    { type: String, default: "New Chat" },
  messages: [messageSchema],
}, { timestamps: true });

module.exports = mongoose.model("Chat", chatSchema);
