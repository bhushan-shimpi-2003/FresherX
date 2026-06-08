import api from '../axios';
import type { Notification } from '../../types/user.types';

export const notificationsApi = {
  fetchNotifications: async (userId: string): Promise<Notification[]> => {
    const { data } = await api.get('/notifications');
    return data.map((raw: any) => ({
      id: raw.id,
      userId: raw.user_id,
      title: raw.title,
      body: raw.body,
      type: raw.type,
      data: raw.data,
      read: raw.read,
      createdAt: raw.created_at,
    }));
  },

  markAsRead: async (notificationId: string) => {
    await api.patch(`/notifications/${notificationId}/read`);
  },

  markAllAsRead: async (userId: string) => {
    await api.post('/notifications/read-all');
  },
};
