import { create } from 'zustand';
import { Job, JobFilters, JobsPage } from '../types/job.types';
import { jobsApi } from '../services/api/jobs.api';
import { savedJobsApi } from '../services/api/saved.api';
import { PAGE_SIZE } from '../constants/config';

interface JobsStore {
  jobs: Job[];
  savedJobs: Job[];
  appliedJobs: Job[];
  recommendedJobs: Job[];
  selectedJob: Job | null;
  filters: JobFilters;
  page: number;
  hasMore: boolean;
  isLoading: boolean;
  isLoadingMore: boolean;
  isSavedLoading: boolean;
  isRecommendedLoading: boolean;
  error: string | null;

  // Actions
  fetchJobs: (filters?: JobFilters, reset?: boolean) => Promise<void>;
  fetchMoreJobs: () => Promise<void>;
  fetchRecommendedJobs: () => Promise<void>;
  fetchJobById: (id: string) => Promise<void>;
  fetchSavedJobs: (userId: string) => Promise<void>;
  fetchAppliedJobs: () => Promise<void>;
  saveJob: (jobId: string, userId: string) => Promise<void>;
  unsaveJob: (jobId: string, userId: string) => Promise<void>;
  applyJob: (jobId: string) => Promise<void>;
  setFilters: (filters: JobFilters) => void;
  clearFilters: () => void;
  setSelectedJob: (job: Job | null) => void;
  reset: () => void;
}

export const useJobsStore = create<JobsStore>((set, get) => ({
  jobs: [],
  savedJobs: [],
  appliedJobs: [],
  recommendedJobs: [],
  selectedJob: null,
  filters: {},
  page: 1,
  hasMore: true,
  isLoading: false,
  isLoadingMore: false,
  isSavedLoading: false,
  isRecommendedLoading: false,
  error: null,

  setFilters: (filters) => set({ filters }),
  clearFilters: () => set({ filters: {} }),
  setSelectedJob: (job) => set({ selectedJob: job }),
  reset: () => set({ jobs: [], page: 1, hasMore: true, error: null }),

  fetchJobs: async (filters, reset = true) => {
    const currentFilters = filters ? { ...get().filters, ...filters } : get().filters;
    set({ filters: currentFilters });
    set({ isLoading: true, error: null, ...(reset ? { jobs: [], page: 1 } : {}) });

    try {
      const { jobs, hasMore } = await jobsApi.fetchJobs(currentFilters, 0);

      set({
        jobs,
        page: 2,
        hasMore,
        isLoading: false,
      });
    } catch (err: any) {
      set({ error: err?.message, isLoading: false });
    }
  },

  fetchRecommendedJobs: async () => {
    set({ isRecommendedLoading: true, error: null });
    try {
      const { jobs } = await jobsApi.fetchJobs({ matchUserSkills: true }, 0);
      set({ recommendedJobs: jobs, isRecommendedLoading: false });
    } catch (err: any) {
      set({ error: err?.message, isRecommendedLoading: false });
    }
  },

  fetchMoreJobs: async () => {
    const { page, hasMore, isLoadingMore, filters, jobs } = get();
    if (!hasMore || isLoadingMore) return;

    set({ isLoadingMore: true });
    try {
      const result = await jobsApi.fetchJobs(filters, page - 1);

      set({
        jobs: [...jobs, ...result.jobs],
        page: page + 1,
        hasMore: result.hasMore,
        isLoadingMore: false,
      });
    } catch (err: any) {
      set({ error: err?.message, isLoadingMore: false });
    }
  },

  fetchJobById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const job = await jobsApi.fetchById(id);
      set({ selectedJob: job, isLoading: false });
    } catch (err: any) {
      set({ error: err?.message, isLoading: false });
    }
  },

  fetchSavedJobs: async (userId) => {
    set({ isSavedLoading: true });
    try {
      const saved = await savedJobsApi.fetchSavedJobs(userId);
      const jobs = saved.map(s => ({ ...s.job, isSaved: true })) as Job[];
      set({ savedJobs: jobs, isSavedLoading: false });
    } catch (err: any) {
      set({ isSavedLoading: false });
    }
  },

  saveJob: async (jobId, userId) => {
    try {
      await savedJobsApi.saveJob(userId, jobId);
      set((state) => ({
        jobs: state.jobs.map((j) => j.id === jobId ? { ...j, isSaved: true } : j),
        selectedJob: state.selectedJob?.id === jobId
          ? { ...state.selectedJob, isSaved: true }
          : state.selectedJob,
      }));
    } catch {}
  },

  unsaveJob: async (jobId, userId) => {
    try {
      await savedJobsApi.unsaveJob(userId, jobId);
      set((state) => ({
        jobs: state.jobs.map((j) => j.id === jobId ? { ...j, isSaved: false } : j),
        savedJobs: state.savedJobs.filter((j) => j.id !== jobId),
        selectedJob: state.selectedJob?.id === jobId
          ? { ...state.selectedJob, isSaved: false }
          : state.selectedJob,
      }));
    } catch {}
  },

  fetchAppliedJobs: async () => {
    try {
      const jobs = await jobsApi.fetchAppliedJobs();
      set({ appliedJobs: jobs });
    } catch (err) {
      console.error(err);
    }
  },

  applyJob: async (jobId) => {
    try {
      await jobsApi.incrementApplications(jobId);
      // Move from jobs to appliedJobs (optimistically)
      set((state) => {
        const appliedJob = state.jobs.find(j => j.id === jobId) || state.recommendedJobs.find(j => j.id === jobId) || state.selectedJob;
        return {
          jobs: state.jobs.filter(j => j.id !== jobId),
          recommendedJobs: state.recommendedJobs.filter(j => j.id !== jobId),
          appliedJobs: appliedJob ? [appliedJob, ...state.appliedJobs] : state.appliedJobs,
        };
      });
    } catch (err) {
      console.error(err);
      throw err;
    }
  },
}));
