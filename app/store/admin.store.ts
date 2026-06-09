import { create } from 'zustand';
import { adminApi } from '../services/api/admin.api';
import {
  AdminDashboardStats, PendingRecruiter, AdminJob,
  AdminUser, Report, AdminAnalytics,
  VerifyRecruiterPayload, ReviewJobPayload,
  AdminActivity,
} from '../types/admin.types';

interface AdminStore {
  stats: AdminDashboardStats | null;
  pendingRecruiters: PendingRecruiter[];
  pendingJobs: AdminJob[];
  users: AdminUser[];
  activities: AdminActivity[];
  analytics: AdminAnalytics | null;
  isLoading: boolean;
  error: string | null;

  fetchDashboardStats: () => Promise<void>;
  fetchActivities: () => Promise<void>;
  fetchPendingRecruiters: () => Promise<void>;
  verifyRecruiter: (payload: VerifyRecruiterPayload) => Promise<{ success: boolean; error?: string }>;
  fetchPendingJobs: () => Promise<void>;
  reviewJob: (payload: ReviewJobPayload) => Promise<{ success: boolean; error?: string }>;
  updateJob: (jobId: string, payload: any) => Promise<{ success: boolean; error?: string }>;
  deleteJob: (jobId: string) => Promise<{ success: boolean; error?: string }>;
  fetchUsers: () => Promise<void>;
  updateUserStatus: (userId: string, action: 'suspend' | 'activate') => Promise<{ success: boolean; error?: string }>;
  toggleAutoVerify: (userId: string, autoVerified: boolean) => Promise<{ success: boolean; error?: string }>;
  fetchAnalytics: () => Promise<void>;
  reset: () => void;
}

export const useAdminStore = create<AdminStore>((set, get) => ({
  stats: null,
  pendingRecruiters: [],
  pendingJobs: [],
  users: [],
  activities: [],
  analytics: null,
  isLoading: false,
  error: null,

  reset: () => set({ stats: null, pendingRecruiters: [], pendingJobs: [], users: [], activities: [] }),

  fetchDashboardStats: async () => {
    set({ isLoading: true });
    try {
      const stats = await adminApi.fetchStats();
      set({ stats, isLoading: false });
    } catch (err: any) {
      set({ error: err?.message, isLoading: false });
    }
  },

  fetchActivities: async () => {
    set({ isLoading: true });
    try {
      const activities = await adminApi.fetchActivities();
      set({ activities, isLoading: false });
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
        pendingRecruiters: state.pendingRecruiters.map((r) => 
          r.id === recruiterId ? { ...r, status: action === 'approve' ? 'verified' : 'rejected' } : r
        ),
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
        pendingJobs: state.pendingJobs.map((j) =>
          j.id === jobId ? { ...j, status: action === 'approve' ? 'published' : action === 'reject' ? 'rejected' : 'archived' } : j
        ),
      }));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message };
    }
  },

  updateJob: async (jobId: string, payload: any) => {
    try {
      await adminApi.updateJob(jobId, payload);
      set((state) => ({
        pendingJobs: state.pendingJobs.map((j) =>
          j.id === jobId ? { ...j, ...payload } : j
        ),
      }));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message };
    }
  },

  deleteJob: async (jobId: string) => {
    try {
      await adminApi.deleteJob(jobId);
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

  updateUserStatus: async (userId, action) => {
    try {
      await adminApi.updateUserStatus(userId, action);
      set((state) => ({
        users: state.users.map((u) => u.id === userId ? { ...u, status: action === 'suspend' ? 'suspended' : 'active' } : u),
      }));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message };
    }
  },

  toggleAutoVerify: async (userId, autoVerified) => {
    try {
      await adminApi.toggleAutoVerify(userId, autoVerified);
      set((state) => ({
        users: state.users.map((u) => u.id === userId ? { ...u, auto_verified: autoVerified } : u),
      }));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message };
    }
  },

  fetchAnalytics: async () => {
    set({ isLoading: true });
    try {
      const analytics = await adminApi.fetchAnalytics();
      set({ analytics, isLoading: false });
    } catch (err: any) {
      set({ error: err?.message, isLoading: false });
    }
  },
}));
