import api from '../axios';
import type { CreateCompanyPayload, RecruiterCompany, RecruiterDashboardStats } from '../../types/recruiter.types';
import type { CreateJobPayload } from '../../types/job.types';

export const recruiterApi = {
  fetchProfile: async () => {
    const { data } = await api.get('/recruiter/profile');
    return data;
  },

  fetchJobs: async () => {
    const { data } = await api.get('/recruiter/jobs');
    return data;
  },

  fetchStats: async (): Promise<RecruiterDashboardStats> => {
    const { data } = await api.get('/recruiter/stats');
    return data;
  },

  createJob: async (payload: CreateJobPayload) => {
    const { data } = await api.post('/recruiter/jobs', payload);
    return data;
  },

  deleteJob: async (id: string) => {
    await api.delete(`/recruiter/jobs/${id}`);
  },

  updateJob: async (id: string, payload: Partial<CreateJobPayload>) => {
    const { data } = await api.put(`/recruiter/jobs/${id}`, payload);
    return data;
  },

  createCompany: async (payload: CreateCompanyPayload) => {
    const { data } = await api.post('/recruiter/company', payload);
    return data;
  },
};
