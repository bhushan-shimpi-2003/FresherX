import { useEffect } from 'react';
import { useAuthStore } from '../store/auth.store';
import { useNotificationsStore } from '../store/notifications.store';

/**
 * Fetches and manages notifications for the current user.
 */
export function useNotifications() {
  const { user } = useAuthStore();
  const {
    notifications,
    isLoading,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotificationsStore();

  useEffect(() => {
    if (user) fetchNotifications(user.id);
  }, [user?.id]);

  return {
    notifications,
    isLoading,
    unreadCount,
    markAsRead,
    markAllAsRead: () => user && markAllAsRead(user.id),
    refresh: () => user && fetchNotifications(user.id),
  };
}
