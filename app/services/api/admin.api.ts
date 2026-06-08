import api from '../axios';
import type { AdminDashboardStats, PendingRecruiter, AdminJob, AdminUser, Report, AdminAnalytics } from '../../types/admin.types';

export const adminApi = {
  fetchStats: async (): Promise<AdminDashboardStats> => {
    const { data } = await api.get('/admin/stats');
    return data;
  },

  fetchPendingRecruiters: async (): Promise<PendingRecruiter[]> => {
    const { data } = await api.get('/admin/recruiters');
    return data.map((rec: any) => ({
      ...rec,
      fullName: rec.full_name,
      createdAt: rec.created_at,
    }));
  },

  verifyRecruiter: async (recruiterId: string, action: 'approve' | 'reject', note?: string) => {
    await api.post(`/admin/recruiters/${recruiterId}/verify`, { action, note });
  },

  fetchPendingJobs: async (): Promise<AdminJob[]> => {
    const { data } = await api.get('/admin/jobs');
    return data.map((job: any) => ({
      ...job,
      company: job.company || { name: 'Unknown Company', logo: null },
      createdAt: job.created_at,
      reportCount: job.report_count || 0,
      type: job.job_type,
      salary: job.salary_min ? { min: job.salary_min, max: job.salary_max, currency: job.salary_currency } : null,
      recruiter: job.recruiter ? { fullName: job.recruiter.full_name, email: job.recruiter.email } : { fullName: 'Unknown', email: '' },
    }));
  },

  reviewJob: async (jobId: string, action: 'approve' | 'reject' | 'spam', reason?: string) => {
    await api.post(`/admin/jobs/${jobId}/review`, { action, reason });
  },

  fetchUsers: async (page = 0): Promise<AdminUser[]> => {
    const { data } = await api.get('/admin/users', { params: { page } });
    return data;
  },

  updateUserStatus: async (userId: string, action: 'suspend' | 'activate') => {
    await api.post(`/admin/users/${userId}/status`, { action });
  },

  fetchReports: async (): Promise<Report[]> => {
    const { data } = await api.get('/admin/reports');
    return data;
  },

  resolveReport: async (reportId: string, action: 'resolve' | 'dismiss' | 'open') => {
    await api.post(`/admin/reports/${reportId}/resolve`, { action });
  },
};
