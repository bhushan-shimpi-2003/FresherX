import { create } from 'zustand';
import { recruiterApi } from '../services/api/recruiter.api';
import {
  RecruiterProfile, RecruiterCompany,
  CreateCompanyPayload, RecruiterDashboardStats, JobAnalytics,
} from '../types/recruiter.types';
import { Job, CreateJobPayload } from '../types/job.types';
import { JOB_STATUS } from '../constants/config';

interface RecruiterStore {
  profile: RecruiterProfile | null;
  company: RecruiterCompany | null;
  jobs: Job[];
  draftJobs: Job[];
  stats: RecruiterDashboardStats | null;
  analytics: JobAnalytics[];
  isLoading: boolean;
  error: string | null;

  fetchProfile: (userId: string) => Promise<void>;
  createCompany: (userId: string, payload: CreateCompanyPayload) => Promise<{ success: boolean; error?: string }>;
  fetchJobs: (recruiterId: string) => Promise<void>;
  createJob: (recruiterId: string, payload: CreateJobPayload) => Promise<{ success: boolean; id?: string; error?: string }>;
  updateJob: (jobId: string, payload: Partial<CreateJobPayload>) => Promise<{ success: boolean; error?: string }>;
  deleteJob: (jobId: string) => Promise<{ success: boolean; error?: string }>;
  fetchStats: (recruiterId: string) => Promise<void>;
  saveDraft: (recruiterId: string, payload: Partial<CreateJobPayload>) => Promise<{ success: boolean; error?: string }>;
  reset: () => void;
}

export const useRecruiterStore = create<RecruiterStore>((set, get) => ({
  profile: null,
  company: null,
  jobs: [],
  draftJobs: [],
  stats: null,
  analytics: [],
  isLoading: false,
  error: null,

  reset: () => set({ profile: null, company: null, jobs: [], stats: null }),

  fetchProfile: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const data = await recruiterApi.fetchProfile();
      set({
        profile: data as RecruiterProfile,
        company: (data as any)?.company ?? null,
        isLoading: false,
      });
    } catch (err: any) {
      set({ error: err?.message, isLoading: false });
    }
  },

  createCompany: async (userId, payload) => {
    set({ isLoading: true, error: null });
    try {
      const company = await recruiterApi.createCompany(payload);
      set({ company: company as RecruiterCompany, isLoading: false });
      return { success: true };
    } catch (err: any) {
      set({ error: err?.message, isLoading: false });
      return { success: false, error: err?.message };
    }
  },

  fetchJobs: async (recruiterId) => {
    set({ isLoading: true, error: null });
    try {
      const data = await recruiterApi.fetchJobs();
      const allJobs = (data ?? []) as Job[];
      set({
        jobs: allJobs.filter((j) => j.status !== 'draft'),
        draftJobs: allJobs.filter((j) => j.status === 'draft'),
        isLoading: false,
      });
    } catch (err: any) {
      set({ error: err?.message, isLoading: false });
    }
  },

  createJob: async (recruiterId, payload) => {
    set({ isLoading: true, error: null });
    try {
      const { profile } = get();
      const data = await recruiterApi.createJob({ ...payload, companyId: profile?.companyId, status: JOB_STATUS.PENDING } as CreateJobPayload);
      set((state) => ({ jobs: [data as Job, ...state.jobs], isLoading: false }));
      return { success: true, id: (data as Job).id };
    } catch (err: any) {
      set({ error: err?.message, isLoading: false });
      return { success: false, error: err?.message };
    }
  },

  updateJob: async (jobId, payload) => {
    set({ isLoading: true, error: null });
    try {
      const data = await recruiterApi.updateJob(jobId, payload);
      set((state) => ({
        jobs: state.jobs.map((j) => j.id === jobId ? { ...j, ...(data as Job) } : j),
        isLoading: false,
      }));
      return { success: true };
    } catch (err: any) {
      set({ error: err?.message, isLoading: false });
      return { success: false, error: err?.message };
    }
  },

  deleteJob: async (jobId) => {
    try {
      await recruiterApi.deleteJob(jobId);
      set((state) => ({ jobs: state.jobs.filter((j) => j.id !== jobId) }));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message };
    }
  },

  fetchStats: async (recruiterId) => {
    try {
      const stats = await recruiterApi.fetchStats();
      set({ stats });
    } catch {}
  },

  saveDraft: async (recruiterId, payload) => {
    try {
      const { profile } = get();
      const data = await recruiterApi.createJob({ ...payload, companyId: profile?.companyId, status: JOB_STATUS.DRAFT } as CreateJobPayload);
      set((state) => ({ draftJobs: [data as Job, ...state.draftJobs] }));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message };
    }
  },
}));
