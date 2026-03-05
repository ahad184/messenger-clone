/**
 * Message Model
 * Stores individual messages within a conversation
 */

const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Text content (optional if sending an image)
    text: {
      type: String,
      default: "",
    },
    // Image URL (optional)
    imageUrl: {
      type: String,
      default: "",
    },
    // Message type: 'text' | 'image'
    type: {
      type: String,
      enum: ["text", "image"],
      default: "text",
    },
    // IDs of users who have seen this message
    seenBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

// Index for fast conversation message retrieval
messageSchema.index({ conversationId: 1, createdAt: 1 });

module.exports = mongoose.model("Message", messageSchema);
