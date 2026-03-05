/**
 * Socket.IO Event Handler
 *
 * Events:
 *  - join_conversation: user joins a conversation room
 *  - leave_conversation: user leaves a conversation room
 *  - typing: user is typing in a conversation
 *  - stop_typing: user stopped typing
 *  - user_online: broadcast user online status
 *  - disconnect: mark user offline
 */

const User = require("../models/User");

// Maps userId -> socketId for tracking online users
const onlineUsers = new Map();

const initSocket = (io) => {
  io.on("connection", (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    /**
     * User comes online - register their userId <-> socketId
     */
    socket.on("user_online", async (userId) => {
      if (!userId) return;

      // Join a private room for this user to receive personal notifications
      socket.join(userId); console.log(`Socket joined user room: ${userId}`);
      onlineUsers.set(userId, socket.id);

      console.log(`👤 User ${userId} is online and joined private room.`);

      // Broadcast updated online user list to all clients
      io.emit("online_users", Array.from(onlineUsers.keys()));

      // Update DB status
      try {
        await User.findByIdAndUpdate(userId, {
          isOnline: true,
          lastSeen: new Date(),
        });
      } catch (err) {
        console.error("Error updating online status:", err.message);
      }
    });

    /**
     * User joins a specific conversation room to receive messages
     */
    socket.on("join_conversation", (conversationId) => {
      socket.join(conversationId);
      console.log(`📥 Socket ${socket.id} joined room: ${conversationId}`);
    });

    /**
     * User leaves a conversation room
     */
    socket.on("leave_conversation", (conversationId) => {
      socket.leave(conversationId);
      console.log(`📤 Socket ${socket.id} left room: ${conversationId}`);
    });

    /**
     * Typing indicator - notify other participant
     */
    socket.on("typing", ({ conversationId, userId, username }) => {
      socket.to(conversationId).emit("user_typing", { userId, username, conversationId });
    });

    /**
     * Stop typing indicator
     */
    socket.on("stop_typing", ({ conversationId, userId }) => {
      socket.to(conversationId).emit("user_stop_typing", { userId, conversationId });
    });

    /**
     * Handle disconnect - mark user offline
     */
    socket.on("disconnect", async () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);

      // Find which user this socket belonged to
      let disconnectedUserId = null;
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          disconnectedUserId = userId;
          break;
        }
      }

      if (disconnectedUserId) {
        onlineUsers.delete(disconnectedUserId);
        io.emit("online_users", Array.from(onlineUsers.keys()));

        // Update DB status
        try {
          await User.findByIdAndUpdate(disconnectedUserId, {
            isOnline: false,
            lastSeen: new Date(),
          });
        } catch (err) {
          console.error("Error updating offline status:", err.message);
        }
      }
    });
  });
};

module.exports = { initSocket, onlineUsers };
