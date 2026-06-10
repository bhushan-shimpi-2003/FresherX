import { create } from 'zustand';
import { supabase } from '../lib/supabase/client';
import { notificationsApi } from '../services/api/notifications.api';

export type NotificationType = 'new_job' | 'deadline' | 'saved_job' | 'application' | 'system';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data: Record<string, any> | null;
  isRead: boolean;
  createdAt: string;
}

interface NotificationsStore {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  pushToken: string | null;

  fetchNotifications: (userId: string) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: (userId: string) => Promise<void>;
  setPushToken: (token: string) => void;
  addNotification: (notification: Notification) => void;
  subscribeToNotifications: (userId: string) => void;
  unsubscribeFromNotifications: () => void;
  reset: () => void;
}

export const useNotificationsStore = create<NotificationsStore>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  pushToken: null,

  setPushToken: (token) => set({ pushToken: token }),
  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    })),
  reset: () => set({ notifications: [], unreadCount: 0 }),

  fetchNotifications: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const notifications = await notificationsApi.fetchNotifications(userId);
      const unreadCount = notifications.filter((n) => !n.isRead).length;
      set({ notifications, unreadCount, isLoading: false });
    } catch (err: any) {
      set({ error: err?.message, isLoading: false });
    }
  },

  markAsRead: async (notificationId) => {
    try {
      await notificationsApi.markAsRead(notificationId);
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === notificationId ? { ...n, isRead: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch {}
  },

  markAllAsRead: async (userId) => {
    try {
      await notificationsApi.markAllAsRead(userId);
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0,
      }));
    } catch {}
  },

  subscribeToNotifications: (userId) => {
    const channel = supabase.channel(`notifications-${userId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
        (payload) => {
          const newNotif = payload.new as any;
          // Transform from snake_case to camelCase
          const notification: Notification = {
            id: newNotif.id,
            userId: newNotif.user_id,
            type: newNotif.type,
            title: newNotif.title,
            body: newNotif.body,
            data: newNotif.data,
            isRead: newNotif.is_read,
            createdAt: newNotif.created_at,
          };
          
          set((state) => ({
            notifications: [notification, ...state.notifications],
            unreadCount: state.unreadCount + 1,
          }));
        }
      )
      .subscribe();

    // Store channel on state (need to add it to interface)
    set({ channel } as any);
  },

  unsubscribeFromNotifications: () => {
    const { channel } = get() as any;
    if (channel) {
      channel.unsubscribe();
    }
  },
}));
