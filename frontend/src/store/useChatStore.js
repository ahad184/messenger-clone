/**
 * Chat Store (Zustand)
 * Manages: conversations list, active conversation, messages, typing status
 */

import { create } from "zustand";
import API from "../api/axiosInstance";
import toast from "react-hot-toast";
import useAuthStore from "./useAuthStore";

const useChatStore = create((set, get) => ({
  conversations: [],
  activeConversation: null,
  messages: [],
  onlineUsers: [],
  typingUsers: {}, // { conversationId: [{ userId, username }] }
  loading: false,
  messagesLoading: false,

  // ── Fetch all conversations ──
  fetchConversations: async () => {
    set({ loading: true });
    try {
      const { data } = await API.get("/conversations");
      set({ conversations: data.conversations, loading: false });
    } catch (err) {
      toast.error("Failed to load conversations");
      set({ loading: false });
    }
  },

  // ── Create or get conversation ──
  createOrGetConversation: async (recipientId) => {
    try {
      const { data } = await API.post("/conversations", { recipientId });
      const exists = get().conversations.find(
        (c) => c._id === data.conversation._id
      );
      if (!exists) {
        set((state) => ({
          conversations: [data.conversation, ...state.conversations],
        }));
      }
      set({ activeConversation: data.conversation });
      return data.conversation;
    } catch (err) {
      toast.error("Could not open conversation");
      return null;
    }
  },

  // ── Set active conversation ──
  setActiveConversation: (conversation) => {
    if (get().activeConversation?._id === conversation?._id) return;
    set({ activeConversation: conversation, messages: [] });
  },

  // ── Fetch messages for a conversation ──
  fetchMessages: async (conversationId) => {
    // Prevent redundant fetches if already loading or if messages for this ID are already present
    // and no new socket messages have arrived (simple heuristic)
    if (get().messagesLoading) return;

    set({ messagesLoading: true });
    try {
      const { data } = await API.get(`/messages/${conversationId}`);
      set({ messages: data.messages, messagesLoading: false });
    } catch (err) {
      toast.error("Failed to load messages");
      set({ messagesLoading: false });
    }
  },

  // ── Send a message ──
  sendMessage: async (conversationId, text, imageFile) => {
    const currentUser = useAuthStore.getState().user;
    const tempId = `temp-${Date.now()}`;

    // Create optimistic message
    const optimisticMessage = {
      _id: tempId,
      conversationId,
      sender: {
        _id: currentUser._id,
        username: currentUser.username,
        profilePicture: currentUser.profilePicture
      },
      text: text || "",
      imageUrl: imageFile ? URL.createObjectURL(imageFile) : null,
      type: imageFile ? "image" : "text",
      createdAt: new Date().toISOString(),
      isOptimistic: true
    };

    // Immediately add to UI
    set((state) => ({
      messages: [...state.messages, optimisticMessage]
    }));
    get().updateConversationLastMessage(conversationId, optimisticMessage);

    try {
      let response;
      if (imageFile) {
        const formData = new FormData();
        formData.append("conversationId", conversationId);
        if (text) formData.append("text", text);
        formData.append("image", imageFile);
        response = await API.post("/messages", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        response = await API.post("/messages", { conversationId, text });
      }

      // The socket message will normally arrive and replace this,
      // but let's update the conversation to point to the real message ID immediately
      get().updateConversationLastMessage(conversationId, response.data.message);

      return response.data.message;
    } catch (err) {
      // Rollback optimistic message on error
      set((state) => ({
        messages: state.messages.filter(m => m._id !== tempId)
      }));
      toast.error("Failed to send message");
      return null;
    }
  },

  // ── Append incoming socket message ──
  addMessage: (message) => {
    const { activeConversation, conversations } = get();
    const currentUser = useAuthStore.getState().user;

    // Only add to message list if it belongs to the active conversation
    if (activeConversation?._id === message.conversationId) {
      set((state) => {
        // Check if we have an optimistic version of this message
        // (Same sender, same text, sent within last 10 seconds)
        const optimisticIndex = state.messages.findIndex(m =>
          m.isOptimistic &&
          m.sender._id === message.sender._id &&
          m.text === message.text &&
          (new Date(message.createdAt) - new Date(m.createdAt)) < 10000
        );

        if (optimisticIndex !== -1) {
          // Replace optimistic message with the real one from server
          const nextMessages = [...state.messages];
          nextMessages[optimisticIndex] = message;
          return { messages: nextMessages };
        }

        // Standard deduplication by ID
        const alreadyExists = state.messages.some((m) => m._id === message._id);
        if (alreadyExists) return state;

        return { messages: [...state.messages, message] };
      });
    }

    // Update conversation preview and unread count in the sidebar
    set((state) => ({
      conversations: state.conversations.map((c) => {
        if (c._id === message.conversationId) {
          const isNotFromMe = message.sender._id !== currentUser?._id && message.sender !== currentUser?._id;
          const isNotActive = activeConversation?._id !== message.conversationId;

          let newUnreadCount = c.unreadCount || {};
          if (isNotFromMe && isNotActive) {
            const currentUserId = currentUser?._id;
            newUnreadCount = {
              ...newUnreadCount,
              [currentUserId]: (newUnreadCount[currentUserId] || 0) + 1
            };
          }

          return {
            ...c,
            lastMessage: message,
            unreadCount: newUnreadCount
          };
        }
        return c;
      }),
    }));
  },

  // ── Update last message in conversation list ──
  updateConversationLastMessage: (conversationId, message) => {
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c._id === conversationId ? { ...c, lastMessage: message } : c
      ),
    }));
  },

  // ── Mark messages as seen ──
  markSeen: async (conversationId) => {
    try {
      await API.put(`/messages/${conversationId}/seen`);
      // Update local state immediately
      const currentUserId = useAuthStore.getState().user?._id;
      set((state) => ({
        conversations: state.conversations.map((c) =>
          c._id === conversationId ? {
            ...c,
            unreadCount: { ...c.unreadCount, [currentUserId]: 0 }
          } : c
        ),
      }));
    } catch {}
  },

  // ── Update seen status from socket ──
  updateSeenStatus: ({ conversationId, seenBy }) => {
    set((state) => ({
      messages: state.messages.map((m) => {
        if (
          m.conversationId === conversationId &&
          !m.seenBy?.some((s) => s._id === seenBy || s === seenBy)
        ) {
          return { ...m, seenBy: [...(m.seenBy || []), seenBy] };
        }
        return m;
      }),
    }));
  },

  // ── Online users list from socket ──
  setOnlineUsers: (users) => set({ onlineUsers: users }),

  // ── Typing events ──
  setTyping: (conversationId, userId, username) => {
    set((state) => {
      const current = state.typingUsers[conversationId] || [];
      const exists = current.some((u) => u.userId === userId);
      if (exists) return state;
      return {
        typingUsers: {
          ...state.typingUsers,
          [conversationId]: [...current, { userId, username }],
        },
      };
    });
  },

  clearTyping: (conversationId, userId) => {
    set((state) => ({
      typingUsers: {
        ...state.typingUsers,
        [conversationId]: (state.typingUsers[conversationId] || []).filter(
          (u) => u.userId !== userId
        ),
      },
    }));
  },
}));

export default useChatStore;
