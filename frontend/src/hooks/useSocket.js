/**
 * Socket.IO hook
 * Initializes socket connection, registers all event listeners,
 * and returns the socket instance
 */

import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import useAuthStore from "../store/useAuthStore";
import useChatStore from "../store/useChatStore";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

let socketInstance = null;

export const getSocket = () => socketInstance;

const useSocket = () => {
  const { user } = useAuthStore();
  const {
    addMessage,
    setOnlineUsers,
    setTyping,
    clearTyping,
    updateSeenStatus,
    activeConversation,
  } = useChatStore();

  const socketRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    // Create socket connection
    const socket = io(SOCKET_URL, {
      withCredentials: true,
    });

    socketRef.current = socket;
    socketInstance = socket;

    // Register as online
    socket.emit("user_online", user._id);

    // Listen for events
    socket.on("online_users", (users) => {
      setOnlineUsers(users);
    });

    socket.on("new_message", (message) => {
      addMessage(message);
    });

    socket.on("user_typing", ({ userId, username, conversationId }) => {
      setTyping(conversationId, userId, username);
    });

    socket.on("user_stop_typing", ({ userId, conversationId }) => {
      clearTyping(conversationId, userId);
    });

    socket.on("messages_seen", ({ conversationId, seenBy }) => {
      updateSeenStatus({ conversationId, seenBy });
    });

    return () => {
      socket.disconnect();
      socketInstance = null;
    };
  }, [user]);

  // Handle room joining/leaving when activeConversation changes
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !user) return;

    if (activeConversation) {
      socket.emit("join_conversation", activeConversation._id);
    }

    // Note: We don't explicitly "leave" here because Socket.IO handles room cleanup
    // when joining new rooms or disconnecting, but for Messenger style,
    // staying in rooms is fine for real-time updates.
  }, [activeConversation, user]);

  return socketRef.current;
};

export default useSocket;
