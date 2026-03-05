/**
 * Conversation Routes
 * POST /api/conversations      - Create or get existing conversation (protected)
 * GET  /api/conversations      - Get all conversations for user (protected)
 * GET  /api/conversations/:id  - Get single conversation by ID (protected)
 */

const express = require("express");
const router = express.Router();
const {
  createOrGetConversation,
  getUserConversations,
  getConversationById,
} = require("../controllers/conversation.controller");
const { protect } = require("../middleware/auth.middleware");

router.post("/", protect, createOrGetConversation);
router.get("/", protect, getUserConversations);
router.get("/:id", protect, getConversationById);

module.exports = router;
