import api from '../axios';
import type { AdminDashboardStats, PendingRecruiter, AdminJob, AdminUser, Report, AdminAnalytics } from '../../types/admin.types';

export const adminApi = {
  fetchStats: async (): Promise<AdminDashboardStats> => {
    const { data } = await api.get('/admin/stats');
    return data;
  },

  fetchPendingRecruiters: async (): Promise<PendingRecruiter[]> => {
    const { data } = await api.get('/admin/recruiters/pending');
    return data;
  },

  verifyRecruiter: async (recruiterId: string, action: 'approve' | 'reject', note?: string) => {
    await api.post(`/admin/recruiters/${recruiterId}/verify`, { action, note });
  },

  fetchPendingJobs: async (): Promise<AdminJob[]> => {
    const { data } = await api.get('/admin/jobs/pending');
    return data;
  },

  reviewJob: async (jobId: string, action: 'approve' | 'reject' | 'spam', reason?: string) => {
    await api.post(`/admin/jobs/${jobId}/review`, { action, reason });
  },

  fetchUsers: async (page = 0): Promise<AdminUser[]> => {
    const { data } = await api.get('/admin/users', { params: { page } });
    return data;
  },

  suspendUser: async (userId: string) => {
    await api.post(`/admin/users/${userId}/suspend`);
  },

  fetchReports: async (): Promise<Report[]> => {
    const { data } = await api.get('/admin/reports');
    return data;
  },

  resolveReport: async (reportId: string, action: 'resolve' | 'dismiss') => {
    await api.post(`/admin/reports/${reportId}/resolve`, { action });
  },
};
