import { create } from 'zustand';
import { supabase } from '../lib/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface ChatRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  message: string | null;
  created_at: string;
}

export interface ChatThread {
  id: string;
  user1_id: string;
  user2_id: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  thread_id: string;
  sender_id: string;
  message_type: 'text' | 'job_card' | 'referral_request' | 'system';
  content: string;
  metadata: Record<string, any>;
  is_read: boolean;
  created_at: string;
}

export interface ChatParticipant {
  id: string;
  full_name: string;
  role: string;
  avatar?: string;
}

interface ChatStore {
  threads: ChatThread[];
  requests: ChatRequest[];
  messages: Record<string, ChatMessage[]>; // thread_id -> messages
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  
  // Realtime
  channel: RealtimeChannel | null;
  
  // Actions
  fetchThreads: (userId: string) => Promise<void>;
  fetchRequests: (userId: string) => Promise<void>;
  fetchMessages: (threadId: string) => Promise<void>;
  sendMessage: (threadId: string, senderId: string, content: string, type?: 'text' | 'job_card' | 'referral_request' | 'system', metadata?: any) => Promise<void>;
  sendRequest: (senderId: string, receiverId: string, message?: string) => Promise<void>;
  updateRequestStatus: (requestId: string, status: 'accepted' | 'rejected') => Promise<void>;
  markThreadAsRead: (threadId: string, userId: string) => Promise<void>;
  
  // Subscriptions
  subscribeToChatUpdates: (userId: string) => void;
  unsubscribeFromChatUpdates: () => void;
  
  reset: () => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  threads: [],
  requests: [],
  messages: {},
  unreadCount: 0,
  isLoading: false,
  error: null,
  channel: null,

  reset: () => {
    get().unsubscribeFromChatUpdates();
    set({ threads: [], requests: [], messages: {}, unreadCount: 0, error: null });
  },

  fetchThreads: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('chat_threads')
        .select('*')
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      set({ threads: data || [], isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  fetchRequests: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('chat_requests')
        .select('*')
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ requests: data || [], isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  fetchMessages: async (threadId) => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true }); // older to newer for chat UI

      if (error) throw error;
      
      set((state) => ({
        messages: {
          ...state.messages,
          [threadId]: data || [],
        }
      }));
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  sendMessage: async (threadId, senderId, content, type = 'text', metadata = {}) => {
    try {
      // Optimistic update
      const tempId = 'temp-' + Date.now();
      const newMessage: ChatMessage = {
        id: tempId,
        thread_id: threadId,
        sender_id: senderId,
        message_type: type,
        content,
        metadata,
        is_read: false,
        created_at: new Date().toISOString(),
      };

      set((state) => ({
        messages: {
          ...state.messages,
          [threadId]: [...(state.messages[threadId] || []), newMessage],
        }
      }));

      const { data, error } = await supabase
        .from('chat_messages')
        .insert([{
          thread_id: threadId,
          sender_id: senderId,
          message_type: type,
          content,
          metadata
        }])
        .select()
        .single();

      if (error) throw error;
      
      // Update thread timestamp
      await supabase
        .from('chat_threads')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', threadId);

      // Replace temp message with actual
      set((state) => ({
        messages: {
          ...state.messages,
          [threadId]: state.messages[threadId].map(m => m.id === tempId ? data : m),
        }
      }));
    } catch (err: any) {
      set({ error: err.message });
      // Re-fetch to fix optimistic state on failure
      get().fetchMessages(threadId);
    }
  },

  sendRequest: async (senderId, receiverId, message) => {
    try {
      const { error } = await supabase
        .from('chat_requests')
        .insert([{ sender_id: senderId, receiver_id: receiverId, message }]);
      if (error) throw error;
      
      get().fetchRequests(senderId);
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  updateRequestStatus: async (requestId, status) => {
    try {
      const { data: request, error: reqError } = await supabase
        .from('chat_requests')
        .update({ status })
        .eq('id', requestId)
        .select()
        .single();

      if (reqError) throw reqError;

      // If accepted, create a thread
      if (status === 'accepted' && request) {
        const { error: threadError } = await supabase
          .from('chat_threads')
          .insert([{ user1_id: request.sender_id, user2_id: request.receiver_id }]);
          
        if (threadError) {
          // If unique constraint error (thread already exists), ignore
          if (threadError.code !== '23505') throw threadError;
        }
      }

      const requests = get().requests.filter(r => r.id !== requestId);
      set({ requests });
      
      // If thread was created, refresh threads
      if (status === 'accepted') {
        get().fetchThreads(request.receiver_id);
      }
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  markThreadAsRead: async (threadId, userId) => {
    try {
      await supabase
        .from('chat_messages')
        .update({ is_read: true })
        .eq('thread_id', threadId)
        .neq('sender_id', userId)
        .eq('is_read', false);

      // Update local state
      set((state) => {
        const threadMessages = state.messages[threadId] || [];
        const updatedMessages = threadMessages.map(m => 
          m.sender_id !== userId && !m.is_read ? { ...m, is_read: true } : m
        );
        return {
          messages: {
            ...state.messages,
            [threadId]: updatedMessages
          }
        };
      });
      
      // Calculate total unread count again if needed (skipped for brevity)
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  subscribeToChatUpdates: (userId: string) => {
    const { channel: existingChannel, fetchThreads, fetchRequests, fetchMessages } = get();
    if (existingChannel) existingChannel.unsubscribe();

    const channel = supabase.channel(`chat-updates-${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'chat_messages' },
        (payload) => {
          const newMsg = payload.new as ChatMessage;
          const currentMessages = get().messages[newMsg.thread_id] || [];
          
          if (payload.eventType === 'INSERT') {
            // Check if we already have it (optimistic update)
            if (!currentMessages.find(m => m.id === newMsg.id)) {
              set((state) => ({
                messages: {
                  ...state.messages,
                  [newMsg.thread_id]: [...(state.messages[newMsg.thread_id] || []), newMsg],
                }
              }));
              
              if (newMsg.sender_id !== userId && !newMsg.is_read) {
                set((state) => ({ unreadCount: state.unreadCount + 1 }));
              }
              // Refresh threads to update latest message snippets
              fetchThreads(userId);
            }
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'chat_threads' },
        () => fetchThreads(userId)
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'chat_requests' },
        () => fetchRequests(userId)
      )
      .subscribe();

    set({ channel });
  },

  unsubscribeFromChatUpdates: () => {
    const { channel } = get();
    if (channel) {
      channel.unsubscribe();
      set({ channel: null });
    }
  }
}));
