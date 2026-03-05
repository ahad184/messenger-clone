/**
 * Conversation Controller
 * Create or get conversations; list user's conversations
 */

const Conversation = require("../models/Conversation");
const User = require("../models/User");

/**
 * @route   POST /api/conversations
 * @desc    Create or find existing conversation between two users
 * @access  Private
 */
const createOrGetConversation = async (req, res) => {
  try {
    const { recipientId } = req.body;
    const currentUserId = req.user._id;

    if (!recipientId) {
      return res.status(400).json({ message: "recipientId is required" });
    }

    if (recipientId === currentUserId.toString()) {
      return res
        .status(400)
        .json({ message: "Cannot start conversation with yourself" });
    }

    // Check recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: "Recipient not found" });
    }

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [currentUserId, recipientId] },
    })
      .populate("participants", "-password")
      .populate({
        path: "lastMessage",
        populate: { path: "sender", select: "username profilePicture" },
      });

    if (conversation) {
      return res.json({ conversation });
    }

    // Create new conversation
    conversation = await Conversation.create({
      participants: [currentUserId, recipientId],
    });

    conversation = await conversation.populate("participants", "-password");

    res.status(201).json({ conversation });
  } catch (error) {
    console.error("Create conversation error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @route   GET /api/conversations
 * @desc    Get all conversations for the logged-in user
 * @access  Private
 */
const getUserConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
    })
      .populate("participants", "-password")
      .populate({
        path: "lastMessage",
        populate: { path: "sender", select: "username profilePicture" },
      })
      .sort({ updatedAt: -1 }); // Most recent first

    res.json({ conversations });
  } catch (error) {
    console.error("Get conversations error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @route   GET /api/conversations/:id
 * @desc    Get single conversation by ID
 * @access  Private
 */
const getConversationById = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id)
      .populate("participants", "-password")
      .populate({
        path: "lastMessage",
        populate: { path: "sender", select: "username profilePicture" },
      });

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    // Ensure caller is a participant
    const isParticipant = conversation.participants.some(
      (p) => p._id.toString() === req.user._id.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json({ conversation });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createOrGetConversation,
  getUserConversations,
  getConversationById,
};
