import { create } from 'zustand';
import { adminApi } from '../services/api/admin.api';
import {
  AdminDashboardStats, PendingRecruiter, AdminJob,
  AdminUser, Report, AdminAnalytics,
  VerifyRecruiterPayload, ReviewJobPayload,
} from '../types/admin.types';

interface AdminStore {
  stats: AdminDashboardStats | null;
  pendingRecruiters: PendingRecruiter[];
  pendingJobs: AdminJob[];
  users: AdminUser[];
  reports: Report[];
  analytics: AdminAnalytics | null;
  isLoading: boolean;
  error: string | null;

  fetchDashboardStats: () => Promise<void>;
  fetchPendingRecruiters: () => Promise<void>;
  verifyRecruiter: (payload: VerifyRecruiterPayload) => Promise<{ success: boolean; error?: string }>;
  fetchPendingJobs: () => Promise<void>;
  reviewJob: (payload: ReviewJobPayload) => Promise<{ success: boolean; error?: string }>;
  fetchUsers: () => Promise<void>;
  suspendUser: (userId: string) => Promise<{ success: boolean; error?: string }>;
  fetchReports: () => Promise<void>;
  resolveReport: (reportId: string, action: 'resolve' | 'dismiss') => Promise<{ success: boolean; error?: string }>;
  fetchAnalytics: () => Promise<void>;
  reset: () => void;
}

export const useAdminStore = create<AdminStore>((set, get) => ({
  stats: null,
  pendingRecruiters: [],
  pendingJobs: [],
  users: [],
  reports: [],
  analytics: null,
  isLoading: false,
  error: null,

  reset: () => set({ stats: null, pendingRecruiters: [], pendingJobs: [], users: [], reports: [] }),

  fetchDashboardStats: async () => {
    set({ isLoading: true });
    try {
      const stats = await adminApi.fetchStats();
      set({ stats, isLoading: false });
    } catch (err: any) {
      set({ error: err?.message, isLoading: false });
    }
  },

  fetchPendingRecruiters: async () => {
    set({ isLoading: true });
    try {
      const pendingRecruiters = await adminApi.fetchPendingRecruiters();
      set({ pendingRecruiters, isLoading: false });
    } catch (err: any) {
      set({ error: err?.message, isLoading: false });
    }
  },

  verifyRecruiter: async ({ recruiterId, action, note }) => {
    try {
      await adminApi.verifyRecruiter(recruiterId, action, note);
      set((state) => ({
        pendingRecruiters: state.pendingRecruiters.filter((r) => r.id !== recruiterId),
      }));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message };
    }
  },

  fetchPendingJobs: async () => {
    set({ isLoading: true });
    try {
      const pendingJobs = await adminApi.fetchPendingJobs();
      set({ pendingJobs, isLoading: false });
    } catch (err: any) {
      set({ error: err?.message, isLoading: false });
    }
  },

  reviewJob: async ({ jobId, action, reason }) => {
    try {
      await adminApi.reviewJob(jobId, action, reason);
      set((state) => ({
        pendingJobs: state.pendingJobs.filter((j) => j.id !== jobId),
      }));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message };
    }
  },

  fetchUsers: async () => {
    set({ isLoading: true });
    try {
      const users = await adminApi.fetchUsers(0);
      set({ users, isLoading: false });
    } catch (err: any) {
      set({ error: err?.message, isLoading: false });
    }
  },

  suspendUser: async (userId) => {
    try {
      await adminApi.suspendUser(userId);
      set((state) => ({
        users: state.users.map((u) => u.id === userId ? { ...u, status: 'suspended' } : u),
      }));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message };
    }
  },

  fetchReports: async () => {
    set({ isLoading: true });
    try {
      const reports = await adminApi.fetchReports();
      set({ reports, isLoading: false });
    } catch (err: any) {
      set({ error: err?.message, isLoading: false });
    }
  },

  resolveReport: async (reportId, action) => {
    try {
      await adminApi.resolveReport(reportId, action);
      set((state) => ({
        reports: state.reports.filter((r) => r.id !== reportId),
      }));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message };
    }
  },

  fetchAnalytics: async () => {
    // Placeholder — in production this would call an edge function or RPC
    set({
      analytics: {
        growthData: [],
        topSkills: [],
        topCompanies: [],
        applicationStats: [],
      },
    });
  },
}));
