import { create } from "zustand";
import axios from "axios";

const API = import.meta.env.VITE_API_URL ?? "";

const useChatStore = create((set, get) => ({
  chats:          [],    // chat list (summaries)
  activeChatId:   null,
  activeMessages: [],    // full messages of active chat
  isLoading:      false,
  isSending:      false,

  // Load all chat summaries
  fetchChats: async () => {
    set({ isLoading: true });
    try {
      const { data } = await axios.get(`${API}/api/chat`);
      set({ chats: data.chats || [] });
    } catch (err) {
      console.error("[useChatStore] fetchChats:", err.message);
    } finally {
      set({ isLoading: false });
    }
  },

  // Load full messages for a chat
  loadChat: async (chatId) => {
    set({ isLoading: true, activeChatId: chatId });
    try {
      const { data } = await axios.get(`${API}/api/chat/${chatId}`);
      set({ activeMessages: data.chat?.messages || [] });
    } catch (err) {
      console.error("[useChatStore] loadChat:", err.message);
    } finally {
      set({ isLoading: false });
    }
  },

  // Start a new blank chat
  newChat: () => {
    set({ activeChatId: null, activeMessages: [] });
  },

  // Send message — optimistic UI then update with server response
  sendMessage: async (message, userContext = {}) => {
    const { activeChatId, activeMessages } = get();

    // Optimistic: show user message immediately
    const optimisticMessages = [
      ...activeMessages,
      { role: "user", content: message, _id: `tmp-${Date.now()}` },
    ];
    set({ activeMessages: optimisticMessages, isSending: true });

    try {
      const { data } = await axios.post(`${API}/api/chat`, {
        message,
        chatId: activeChatId || undefined,
        userContext,
      });

      // Append AI reply
      const updatedMessages = [
        ...optimisticMessages,
        { role: "ai", content: data.reply, _id: `ai-${Date.now()}` },
      ];
      set({
        activeMessages: updatedMessages,
        activeChatId:   data.chatId,
      });

      // Refresh sidebar list (update title/lastMessage)
      get().fetchChats();

      return data.reply;
    } catch (err) {
      // Remove optimistic message on failure
      set({ activeMessages });
      throw err;
    } finally {
      set({ isSending: false });
    }
  },

  // Delete a chat
  deleteChat: async (chatId) => {
    try {
      await axios.delete(`${API}/api/chat/${chatId}`);
      const { activeChatId } = get();
      if (activeChatId === chatId) {
        set({ activeChatId: null, activeMessages: [] });
      }
      set(state => ({ chats: state.chats.filter(c => c._id !== chatId) }));
    } catch (err) {
      console.error("[useChatStore] deleteChat:", err.message);
      throw err;
    }
  },
}));

export default useChatStore;
