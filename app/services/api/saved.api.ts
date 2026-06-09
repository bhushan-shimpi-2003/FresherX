import api from '../axios';
import type { SavedJob } from '../../types/job.types';

export const savedJobsApi = {
  fetchSavedJobs: async (userId: string): Promise<SavedJob[]> => {
    const { data } = await api.get('/saved');
    return data.map((raw: any) => ({
      jobId: raw.job_id,
      createdAt: raw.created_at,
      job: {
        id: raw.jobs?.id,
        title: raw.jobs?.title,
        location: raw.jobs?.location,
        salaryMin: raw.jobs?.salary_min,
        salaryMax: raw.jobs?.salary_max,
        salaryCurrency: raw.jobs?.salary_currency ?? 'INR',
        jobType: raw.jobs?.job_type,
        isRemote: raw.jobs?.is_remote,
        createdAt: raw.jobs?.created_at,
      },
    }));
  },

  saveJob: async (userId: string, jobId: string) => {
    await api.post(`/saved/${jobId}`);
  },

  unsaveJob: async (userId: string, jobId: string) => {
    await api.delete(`/saved/${jobId}`);
  },
};
