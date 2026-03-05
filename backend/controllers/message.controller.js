/**
 * Message Controller
 * Send messages, retrieve messages, and mark them as seen
 */

const Message = require("../models/Message");
const Conversation = require("../models/Conversation");

/**
 * @route   POST /api/messages
 * @desc    Send a new message (text or image)
 * @access  Private
 */
const sendMessage = async (req, res) => {
  try {
    const { conversationId, text } = req.body;
    const senderId = req.user._id;

    if (!conversationId) {
      return res.status(400).json({ message: "conversationId is required" });
    }

    if (!text && !req.file) {
      return res
        .status(400)
        .json({ message: "Message must contain text or an image" });
    }

    // Verify sender is a participant
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const isParticipant = conversation.participants.some(
      (p) => p.toString() === senderId.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Build message data
    const messageData = {
      conversationId,
      sender: senderId,
      seenBy: [senderId], // Sender has seen their own message
    };

    if (req.file) {
      messageData.imageUrl = `/uploads/${req.file.filename}`;
      messageData.type = "image";
      messageData.text = text || "";
    } else {
      messageData.text = text;
      messageData.type = "text";
    }

    // Create and save message
    let message = await Message.create(messageData);
    message = await message.populate("sender", "username profilePicture");

    // Update conversation's lastMessage and updatedAt
    // Increment unread count for other participants
    const updateData = { lastMessage: message._id };
    for (const participantId of conversation.participants) {
      if (participantId.toString() !== senderId.toString()) {
        const key = `unreadCount.${participantId}`;
        updateData[key] = (conversation.unreadCount?.get(participantId.toString()) || 0) + 1;
      }
    }

    await Conversation.findByIdAndUpdate(conversationId, updateData);

    // Emit to socket - notify ALL participants via their private rooms
    if (req.io) {
      conversation.participants.forEach(participantId => {
        req.io.to(participantId.toString()).emit("new_message", message);
      });
    }

    res.status(201).json({ message });
  } catch (error) {
    console.error("Send message error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @route   GET /api/messages/:conversationId
 * @desc    Get all messages for a conversation (paginated)
 * @access  Private
 */
const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    // Verify participant
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const isParticipant = conversation.participants.some(
      (p) => p.toString() === req.user._id.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({ message: "Access denied" });
    }

    const messages = await Message.find({ conversationId })
      .populate("sender", "username profilePicture")
      .populate("seenBy", "username profilePicture")
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit);

    const total = await Message.countDocuments({ conversationId });

    res.json({ messages, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error("Get messages error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @route   PUT /api/messages/:conversationId/seen
 * @desc    Mark all messages in a conversation as seen by current user
 * @access  Private
 */
const markSeen = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    // Add userId to seenBy for all unseen messages in this conversation
    await Message.updateMany(
      { conversationId, seenBy: { $ne: userId } },
      { $addToSet: { seenBy: userId } }
    );

    // Reset unread count for this user
    await Conversation.findByIdAndUpdate(conversationId, {
      [`unreadCount.${userId}`]: 0,
    });

    // Notify all participants so their sidebars update
    if (req.io) {
      const conversation = await Conversation.findById(conversationId);
      conversation.participants.forEach(participantId => {
        req.io.to(participantId.toString()).emit("messages_seen", {
          conversationId,
          seenBy: userId,
        });
      });
    }

    res.json({ message: "Messages marked as seen" });
  } catch (error) {
    console.error("Mark seen error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { sendMessage, getMessages, markSeen };
