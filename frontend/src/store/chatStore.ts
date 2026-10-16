import { create } from 'zustand';
import { api } from '../services/api';
import { socketService } from '../services/socket';
import { Conversation, Message } from '../types';
import { useAuthStore } from './authStore';

interface ChatState {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  messages: Message[];
  isLoadingConversations: boolean;
  isLoadingMessages: boolean;
  typingUsers: Record<string, string[]>; // conversationId -> usernames
  onlineUsers: Record<string, boolean>; // userId -> isOnline

  fetchConversations: () => Promise<void>;
  selectConversation: (conversation: Conversation) => Promise<void>;
  sendMessage: (content: string, replyToId?: string, attachments?: any[]) => void;
  createOneOnOneChat: (recipientId: string) => Promise<Conversation | null>;
  createGroupChat: (title: string, memberIds: string[]) => Promise<Conversation | null>;
  setupSocketListeners: () => void;
  setOnlineStatus: (userId: string, isOnline: boolean) => void;
  setTyping: (conversationId: string, username: string, isTyping: boolean) => void;
  appendMessage: (message: Message) => void;
  markActiveMessagesAsRead: (conversationId?: string) => void;
  closeActiveConversation: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  activeConversation: null,
  messages: [],
  isLoadingConversations: false,
  isLoadingMessages: false,
  typingUsers: {},
  onlineUsers: {},

  fetchConversations: async () => {
    set({ isLoadingConversations: true });
    try {
      const response = await api.get('/chat/conversations');
      const conversations: Conversation[] = response.data.data.conversations;
      set({ conversations, isLoadingConversations: false });

      // Initialize presence map from participant data
      const presenceMap: Record<string, boolean> = {};
      conversations.forEach((conv) => {
        conv.participants.forEach((p) => {
          presenceMap[p.id] = p.isOnline;
        });
        // Ensure user's socket is subscribed to conversation updates
        socketService.joinConversation(conv.id);
      });
      set({ onlineUsers: presenceMap });
    } catch (err) {
      set({ isLoadingConversations: false });
    }
  },

  selectConversation: async (conversation: Conversation) => {
    const prev = get().activeConversation;
    if (prev?.id === conversation.id) return;

    if (prev) {
      socketService.leaveConversation(prev.id);
    }

    set({ activeConversation: conversation, isLoadingMessages: true, messages: [] });
    socketService.joinConversation(conversation.id);

    // Fetch conversation message history
    try {
      const response = await api.get(`/chat/conversations/${conversation.id}/messages`);
      const messages: Message[] = response.data.data.messages;
      set({ messages, isLoadingMessages: false });

      // Mark messages as read
      socketService.markAsRead(conversation.id);

      // Decrement unread count locally
      set((state) => ({
        conversations: state.conversations.map((c) =>
          c.id === conversation.id ? { ...c, unreadCount: 0 } : c
        ),
      }));
    } catch (err) {
      set({ isLoadingMessages: false });
    }
  },

  closeActiveConversation: () => {
    const prev = get().activeConversation;
    if (prev) {
      socketService.leaveConversation(prev.id);
    }
    set({ activeConversation: null, messages: [] });
  },

  sendMessage: (content: string, replyToId?: string, attachments?: any[]) => {
    const active = get().activeConversation;
    if (!active || !content.trim()) return;

    socketService.sendMessage({
      conversationId: active.id,
      content,
      replyToId,
      attachments,
    });
  },

  createOneOnOneChat: async (recipientId: string) => {
    try {
      const response = await api.post('/chat/conversations', {
        isGroup: false,
        recipientId,
      });

      const conversation: Conversation = response.data.data.conversation;
      
      set((state) => {
        const exists = state.conversations.some((c) => c.id === conversation.id);
        if (exists) {
          return { activeConversation: conversation };
        }
        return {
          conversations: [conversation, ...state.conversations],
          activeConversation: conversation,
        };
      });

      socketService.joinConversation(conversation.id);
      return conversation;
    } catch (err) {
      return null;
    }
  },

  createGroupChat: async (title: string, memberIds: string[]) => {
    try {
      const response = await api.post('/chat/conversations', {
        isGroup: true,
        title,
        memberIds,
      });

      const group: Conversation = response.data.data.conversation;
      set((state) => ({
        conversations: [group, ...state.conversations],
        activeConversation: group,
      }));

      socketService.joinConversation(group.id);
      return group;
    } catch (err) {
      return null;
    }
  },

  appendMessage: (message: Message) => {
    const { activeConversation, messages, conversations } = get();
    const currentUserId = useAuthStore.getState().user?.id;

    // If message belongs to active chat, append it
    if (activeConversation && activeConversation.id === message.conversationId) {
      set({ messages: [...messages, message] });

      // If we are actively viewing this chat and received someone else's message, mark it read on server
      if (message.senderId !== currentUserId) {
        socketService.markAsRead(message.conversationId);
      }
    }

    // Update conversation in sidebar with latest message
    set({
      conversations: conversations.map((conv) => {
        if (conv.id === message.conversationId) {
          const isCurrentChat = activeConversation?.id === conv.id;
          return {
            ...conv,
            lastMessage: message,
            unreadCount: isCurrentChat ? 0 : (conv.unreadCount || 0) + 1,
            updatedAt: message.createdAt,
          };
        }
        return conv;
      }),
    });
  },

  setOnlineStatus: (userId: string, isOnline: boolean) => {
    set((state) => ({
      onlineUsers: { ...state.onlineUsers, [userId]: isOnline },
    }));
  },

  setTyping: (conversationId: string, username: string, isTyping: boolean) => {
    set((state) => {
      const current = state.typingUsers[conversationId] || [];
      const updated = isTyping
        ? Array.from(new Set([...current, username]))
        : current.filter((u) => u !== username);

      return {
        typingUsers: { ...state.typingUsers, [conversationId]: updated },
      };
    });
  },

  markActiveMessagesAsRead: (conversationId?: string) => {
    const active = get().activeConversation;
    const targetConvId = conversationId || active?.id;
    if (!targetConvId) return;
    const currentUserId = useAuthStore.getState().user?.id;

    set((state) => ({
      // Only mark messages sent by current user as read when the recipient has viewed them
      messages: state.activeConversation?.id === targetConvId
        ? state.messages.map((m) =>
            m.senderId === currentUserId ? { ...m, status: 'read' as const } : m
          )
        : state.messages,
      conversations: state.conversations.map((c) => {
        if (c.id === targetConvId) {
          const updatedLast = c.lastMessage && c.lastMessage.senderId === currentUserId
            ? { ...c.lastMessage, status: 'read' as const }
            : c.lastMessage;
          return {
            ...c,
            lastMessage: updatedLast,
          };
        }
        return c;
      }),
    }));
  },

  setupSocketListeners: () => {
    const socket = socketService.getSocket();
    if (!socket) return;

    // Avoid duplicate listeners
    socket.off('new_message');
    socket.off('user_typing');
    socket.off('user_presence');
    socket.off('messages_read');
    socket.off('conversation_updated');

    socket.on('new_message', (message: Message) => {
      get().appendMessage(message);
    });

    socket.on('user_typing', (data: { conversationId: string; username: string; isTyping: boolean }) => {
      get().setTyping(data.conversationId, data.username, data.isTyping);
    });

    socket.on('user_presence', (data: { userId: string; isOnline: boolean }) => {
      get().setOnlineStatus(data.userId, data.isOnline);
    });

    socket.on('messages_read', (data: { conversationId: string; readByUserId?: string }) => {
      const currentUserId = useAuthStore.getState().user?.id;
      // Only update when read by the other participant!
      if (!data.readByUserId || data.readByUserId !== currentUserId) {
        get().markActiveMessagesAsRead(data.conversationId);
      }
    });

    socket.on('conversation_updated', () => {
      get().fetchConversations();
    });
  },
}));
