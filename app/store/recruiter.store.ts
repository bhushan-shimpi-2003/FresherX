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
      
      const mappedProfile: RecruiterProfile = {
        id: data.id,
        userId: data.user_id,
        fullName: data.full_name,
        email: data.email,
        avatar: data.avatar,
        phone: data.phone,
        designation: data.designation,
        posterType: data.poster_type,
        companyId: data.company_id,
        company: data.company,
        status: data.status,
        verificationNote: data.verification_note,
        verifiedAt: data.verified_at,
        onboardingComplete: data.onboarding_complete,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };

      set({
        profile: mappedProfile,
        company: data.company ?? null,
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
      const allJobs = (data ?? []).map((j: any) => ({
        ...j,
        jobType: j.job_type || j.jobType,
        experienceLevel: j.experience_level || j.experienceLevel,
        salaryMin: j.salary_min !== undefined ? j.salary_min : j.salaryMin,
        salaryMax: j.salary_max !== undefined ? j.salary_max : j.salaryMax,
        isRemote: j.is_remote !== undefined ? j.is_remote : j.isRemote,
        applyLink: j.apply_link || j.applyLink,
        createdAt: j.created_at || j.createdAt,
        updatedAt: j.updated_at || j.updatedAt,
        companyName: j.company_name || j.companyName,
        referralAvailable: j.referral_available !== undefined ? j.referral_available : j.referralAvailable,
        referralSlots: j.referral_slots !== undefined ? j.referral_slots : j.referralSlots,
      })) as Job[];
      const activeJobs = allJobs.filter((j) => j.status !== 'draft');
      const draftJobs = allJobs.filter((j) => j.status === 'draft');

      const analytics = activeJobs.map((job) => ({
        jobId: job.id,
        title: job.title,
        views: job.views ?? 0,
        applications: job.applications ?? 0,
        saves: (job as any).saves ?? 0,
        conversionRate: job.views ? ((job.applications ?? 0) / job.views) * 100 : 0,
        dailyViews: []
      }));

      set({
        jobs: activeJobs,
        draftJobs: draftJobs,
        analytics,
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
      // Do not send status, let backend decide based on auto_verified
      const data = await recruiterApi.createJob({ ...payload, companyId: profile?.companyId } as CreateJobPayload);
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
      set((state) => ({
        jobs: state.jobs.filter((j) => j.id !== jobId),
        draftJobs: state.draftJobs.filter((j) => j.id !== jobId),
      }));
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
