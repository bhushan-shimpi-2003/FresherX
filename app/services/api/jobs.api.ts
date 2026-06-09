import api from '../axios';
import type { Job, JobFilters } from '../../types/job.types';

export const jobsApi = {
  fetchJobs: async (filters: JobFilters = {}, page = 0): Promise<{ jobs: Job[]; hasMore: boolean }> => {
    const { data } = await api.get('/jobs', { params: { ...filters, page } });
    return {
      jobs: data.data.map(mapJob),
      hasMore: data.hasMore,
    };
  },

  fetchById: async (id: string): Promise<Job> => {
    const { data } = await api.get(`/jobs/${id}`);
    return mapJob(data);
  },

  incrementView: async (jobId: string) => {
    await api.post(`/jobs/${jobId}/views`);
  },

  incrementApplications: async (id: string) => {
    await api.post(`/jobs/${id}/apply`);
  },
};

function mapJob(raw: any): Job {
  return {
    id: raw.id,
    title: raw.title,
    companyName: raw.company_name ?? 'Unknown Company',
    recruiterId: raw.recruiter_id ?? '',
    recruiter: raw.recruiter ? {
      id: raw.recruiter.id,
      fullName: raw.recruiter.full_name,
      posterType: raw.recruiter.poster_type,
    } : undefined,
    description: raw.description,
    requirements: raw.requirements,
    skills: raw.skills ?? [],
    jobType: raw.job_type,
    experienceLevel: raw.experience_level,
    salaryMin: raw.salary_min,
    salaryMax: raw.salary_max,
    salaryCurrency: raw.salary_currency ?? 'INR',
    location: raw.location,
    isRemote: raw.is_remote,
    applyLink: raw.apply_link,
    deadline: raw.deadline,
    status: raw.status,
    views: raw.views ?? 0,
    applications: raw.applications ?? 0,
    isSaved: false,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
    referralAvailable: raw.referral_available ?? false,
    referralSlots: raw.referral_slots ?? 0,
  };
}
