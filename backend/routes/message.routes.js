/**
 * Message Routes
 * POST /api/messages                       - Send message (text or image) (protected)
 * GET  /api/messages/:conversationId       - Get messages for a conversation (protected)
 * PUT  /api/messages/:conversationId/seen  - Mark messages as seen (protected)
 */

const express = require("express");
const router = express.Router();
const {
  sendMessage,
  getMessages,
  markSeen,
} = require("../controllers/message.controller");
const { protect } = require("../middleware/auth.middleware");
const upload = require("../middleware/upload.middleware");

router.post("/", protect, upload.single("image"), sendMessage);
router.get("/:conversationId", protect, getMessages);
router.put("/:conversationId/seen", protect, markSeen);

module.exports = router;
