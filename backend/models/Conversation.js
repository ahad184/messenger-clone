/**
 * Conversation Model
 * Represents a 1-to-1 chat session between two users
 */

const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    // Participants (exactly 2 for one-to-one chat)
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    // Last message for sidebar preview
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
    // Unread count per user: { userId: count }
    unreadCount: {
      type: Map,
      of: Number,
      default: {},
    },
  },
  { timestamps: true }
);

// Index for fast participant lookups
conversationSchema.index({ participants: 1 });

module.exports = mongoose.model("Conversation", conversationSchema);
