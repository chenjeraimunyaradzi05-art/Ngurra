'use client';

/**
 * Messaging Store
 * 
 * Real-time messaging state management with WebSocket support.
 * Handles conversations, messages, presence, and typing indicators.
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import api from '@/lib/apiClient';

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  type: 'text' | 'image' | 'file' | 'system';
  metadata?: Record<string, unknown>;
  createdAt: string;
  deliveredAt?: string;
  readAt?: string;
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
}

interface Participant {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  role: 'member' | 'admin' | 'moderator';
  isOnline: boolean;
  lastSeen?: string;
  isTyping: boolean;
}

interface Conversation {
  id: string;
  type: 'direct' | 'group' | 'mentorship' | 'support';
  title?: string;
  participants: Participant[];
  lastMessage?: Message;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
}

interface MessagingState {
  conversations: Conversation[];
  activeConversationId: string | null;
  messages: Record<string, Message[]>; // conversationId -> messages
  totalUnread: number;
  isConnected: boolean;
  isConnecting: boolean;
  connectionError: string | null;
  typingUsers: Record<string, string[]>; // conversationId -> userIds
}

interface MessagingActions {
  // Connection
  connect: () => Promise<void>;
  disconnect: () => void;
  
  // Conversations
  loadConversations: () => Promise<void>;
  setActiveConversation: (id: string | null) => void;
  createConversation: (participantIds: string[], type?: string, title?: string) => Promise<string | null>;
  
  // Messages
  loadMessages: (conversationId: string, before?: string) => Promise<void>;
  sendMessage: (conversationId: string, content: string, type?: string) => Promise<boolean>;
  markAsRead: (conversationId: string) => Promise<void>;
  
  // Real-time handlers
  handleNewMessage: (message: Message) => void;
  handleMessageDelivered: (messageId: string, deliveredAt: string) => void;
  handleMessageRead: (conversationId: string, userId: string, readAt: string) => void;
  handleUserTyping: (conversationId: string, userId: string) => void;
  handleUserStoppedTyping: (conversationId: string, userId: string) => void;
  handlePresenceChange: (userId: string, isOnline: boolean) => void;
  
  // Typing
  sendTypingStart: (conversationId: string) => void;
  sendTypingStop: (conversationId: string) => void;
  
  // State
  setConnected: (connected: boolean) => void;
  setConnectionError: (error: string | null) => void;
  clearMessages: () => void;
}

type MessagingStore = MessagingState & MessagingActions;

// WebSocket instance (managed externally)
let ws: WebSocket | null = null;
let reconnectTimeout: NodeJS.Timeout | null = null;
let typingTimeouts: Record<string, NodeJS.Timeout> = {};

export const useMessagingStore = create<MessagingStore>()(
  subscribeWithSelector((set, get) => ({
    // State
    conversations: [],
    activeConversationId: null,
    messages: {},
    totalUnread: 0,
    isConnected: false,
    isConnecting: false,
    connectionError: null,
    typingUsers: {},

    // Connection
    connect: async () => {
      if (ws?.readyState === WebSocket.OPEN || get().isConnecting) {
        return;
      }

      set({ isConnecting: true, connectionError: null });

      try {
        // Get WebSocket config from server
        const { ok, data } = await api<{ websocketUrl: string }>('/live-messages/config');
        if (!ok || !data) {
          throw new Error('Failed to get WebSocket configuration');
        }

        // Get auth token for WebSocket
        const token = sessionStorage.getItem('accessToken');
        
        ws = new WebSocket(`${data.websocketUrl}?token=${token}`);

        ws.onopen = () => {
          set({ isConnected: true, isConnecting: false, connectionError: null });
          // Clear any reconnect timeout
          if (reconnectTimeout) {
            clearTimeout(reconnectTimeout);
            reconnectTimeout = null;
          }
        };

        ws.onclose = () => {
          set({ isConnected: false });
          ws = null;
          // Auto-reconnect after 3 seconds
          reconnectTimeout = setTimeout(() => {
            get().connect();
          }, 3000);
        };

        ws.onerror = () => {
          set({ connectionError: 'WebSocket connection error', isConnecting: false });
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            handleWebSocketMessage(data, get);
          } catch (err) {
            console.error('Failed to parse WebSocket message:', err);
          }
        };
      } catch (err) {
        set({ 
          isConnecting: false, 
          connectionError: err instanceof Error ? err.message : 'Connection failed' 
        });
      }
    },

    disconnect: () => {
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
        reconnectTimeout = null;
      }
      if (ws) {
        ws.close();
        ws = null;
      }
      set({ isConnected: false, isConnecting: false });
    },

    // Conversations
    loadConversations: async () => {
      try {
        const { ok, data } = await api<{ conversations: Conversation[]; totalUnread: number }>('/messages/conversations');
        if (ok && data) {
          set({ 
            conversations: data.conversations || [],
            totalUnread: data.totalUnread || 0,
          });
        }
      } catch (err) {
        console.error('Failed to load conversations:', err);
      }
    },

    setActiveConversation: (id) => {
      set({ activeConversationId: id });
      if (id) {
        get().loadMessages(id);
        get().markAsRead(id);
      }
    },

    createConversation: async (participantIds, type = 'direct', title) => {
      try {
        const { ok, data } = await api<{ conversation: Conversation }>('/messages/conversations', {
          method: 'POST',
          body: { participantIds, type, title },
        });
        if (ok && data?.conversation) {
          set((state) => ({
            conversations: [data.conversation, ...state.conversations],
          }));
          return data.conversation.id;
        }
        return null;
      } catch (err) {
        console.error('Failed to create conversation:', err);
        return null;
      }
    },

    // Messages
    loadMessages: async (conversationId, before) => {
      try {
        const url = before 
          ? `/live-messages/conversations/${conversationId}/messages?before=${before}`
          : `/live-messages/conversations/${conversationId}/messages`;
        
        const { ok, data } = await api<{ messages: Message[] }>(url);
        if (ok && data?.messages) {
          set((state) => ({
            messages: {
              ...state.messages,
              [conversationId]: before
                ? [...data.messages, ...(state.messages[conversationId] || [])]
                : data.messages,
            },
          }));
        }
      } catch (err) {
        console.error('Failed to load messages:', err);
      }
    },

    sendMessage: async (conversationId, content, type = 'text') => {
      const tempId = `temp-${Date.now()}`;
      const tempMessage: Message = {
        id: tempId,
        conversationId,
        senderId: 'self',
        senderName: 'You',
        content,
        type: type as Message['type'],
        createdAt: new Date().toISOString(),
        status: 'sending',
      };

      // Optimistic update
      set((state) => ({
        messages: {
          ...state.messages,
          [conversationId]: [...(state.messages[conversationId] || []), tempMessage],
        },
      }));

      try {
        // Send via WebSocket if connected
        if (ws?.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: 'send_message',
            conversationId,
            content,
            messageType: type,
            tempId,
          }));
          return true;
        }

        // Fallback to REST API
        const { ok, data } = await api<{ message: Message }>(`/messages/conversations/${conversationId}/messages`, {
          method: 'POST',
          body: { content, type },
        });

        if (ok && data?.message) {
          // Replace temp message with real one
          set((state) => ({
            messages: {
              ...state.messages,
              [conversationId]: state.messages[conversationId]?.map((m) =>
                m.id === tempId ? { ...data.message, status: 'sent' } : m
              ) || [],
            },
          }));
          return true;
        }
        
        // Mark as failed
        set((state) => ({
          messages: {
            ...state.messages,
            [conversationId]: state.messages[conversationId]?.map((m) =>
              m.id === tempId ? { ...m, status: 'failed' } : m
            ) || [],
          },
        }));
        return false;
      } catch (err) {
        // Mark as failed
        set((state) => ({
          messages: {
            ...state.messages,
            [conversationId]: state.messages[conversationId]?.map((m) =>
              m.id === tempId ? { ...m, status: 'failed' } : m
            ) || [],
          },
        }));
        return false;
      }
    },

    markAsRead: async (conversationId) => {
      try {
        await api(`/live-messages/conversations/${conversationId}/read`, { method: 'POST' });
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === conversationId ? { ...c, unreadCount: 0 } : c
          ),
          totalUnread: state.conversations.reduce(
            (sum, c) => sum + (c.id === conversationId ? 0 : c.unreadCount),
            0
          ),
        }));
      } catch (err) {
        console.error('Failed to mark as read:', err);
      }
    },

    // Real-time handlers
    handleNewMessage: (message) => {
      set((state) => {
        const existingMessages = state.messages[message.conversationId] || [];
        const messageExists = existingMessages.some((m) => m.id === message.id);
        
        if (messageExists) return state;

        const newMessages = [...existingMessages, message];
        const newConversations = state.conversations.map((c) => {
          if (c.id === message.conversationId) {
            return {
              ...c,
              lastMessage: message,
              unreadCount: state.activeConversationId === c.id ? 0 : c.unreadCount + 1,
              updatedAt: message.createdAt,
            };
          }
          return c;
        });

        return {
          messages: {
            ...state.messages,
            [message.conversationId]: newMessages,
          },
          conversations: newConversations.sort(
            (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          ),
          totalUnread: newConversations.reduce((sum, c) => sum + c.unreadCount, 0),
        };
      });
    },

    handleMessageDelivered: (messageId, deliveredAt) => {
      set((state) => {
        const newMessages = { ...state.messages };
        for (const convId in newMessages) {
          newMessages[convId] = newMessages[convId].map((m) =>
            m.id === messageId ? { ...m, deliveredAt, status: 'delivered' } : m
          );
        }
        return { messages: newMessages };
      });
    },

    handleMessageRead: (conversationId, userId, readAt) => {
      set((state) => ({
        messages: {
          ...state.messages,
          [conversationId]: state.messages[conversationId]?.map((m) => ({
            ...m,
            readAt: m.readAt || readAt,
            status: 'read',
          })) || [],
        },
      }));
    },

    handleUserTyping: (conversationId, userId) => {
      set((state) => ({
        typingUsers: {
          ...state.typingUsers,
          [conversationId]: [...new Set([...(state.typingUsers[conversationId] || []), userId])],
        },
      }));

      // Clear typing after 3 seconds
      const key = `${conversationId}:${userId}`;
      if (typingTimeouts[key]) {
        clearTimeout(typingTimeouts[key]);
      }
      typingTimeouts[key] = setTimeout(() => {
        get().handleUserStoppedTyping(conversationId, userId);
      }, 3000);
    },

    handleUserStoppedTyping: (conversationId, userId) => {
      const key = `${conversationId}:${userId}`;
      if (typingTimeouts[key]) {
        clearTimeout(typingTimeouts[key]);
        delete typingTimeouts[key];
      }

      set((state) => ({
        typingUsers: {
          ...state.typingUsers,
          [conversationId]: (state.typingUsers[conversationId] || []).filter((id) => id !== userId),
        },
      }));
    },

    handlePresenceChange: (userId, isOnline) => {
      set((state) => ({
        conversations: state.conversations.map((c) => ({
          ...c,
          participants: c.participants.map((p) =>
            p.userId === userId ? { ...p, isOnline, lastSeen: isOnline ? undefined : new Date().toISOString() } : p
          ),
        })),
      }));
    },

    // Typing
    sendTypingStart: (conversationId) => {
      if (ws?.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'typing_start', conversationId }));
      }
    },

    sendTypingStop: (conversationId) => {
      if (ws?.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'typing_stop', conversationId }));
      }
    },

    // State
    setConnected: (connected) => set({ isConnected: connected }),
    setConnectionError: (error) => set({ connectionError: error }),
    clearMessages: () => set({ messages: {}, conversations: [], totalUnread: 0 }),
  }))
);

// WebSocket message handler
function handleWebSocketMessage(data: any, get: () => MessagingStore) {
  const store = get();
  
  switch (data.type) {
    case 'new_message':
      store.handleNewMessage(data.message);
      break;
    case 'message_delivered':
      store.handleMessageDelivered(data.messageId, data.deliveredAt);
      break;
    case 'message_read':
      store.handleMessageRead(data.conversationId, data.userId, data.readAt);
      break;
    case 'user_typing':
      store.handleUserTyping(data.conversationId, data.userId);
      break;
    case 'user_stopped_typing':
      store.handleUserStoppedTyping(data.conversationId, data.userId);
      break;
    case 'user_online':
      store.handlePresenceChange(data.userId, true);
      break;
    case 'user_offline':
      store.handlePresenceChange(data.userId, false);
      break;
    case 'pong':
      // Heartbeat response
      break;
    default:
      console.log('Unknown WebSocket message type:', data.type);
  }
}
