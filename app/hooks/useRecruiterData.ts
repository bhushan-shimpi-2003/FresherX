import { useQuery } from '@tanstack/react-query';
import { recruiterApi } from '../services/api/recruiter.api';
import { Job } from '../types/job.types';

const mapJobs = (data: any[]) => {
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

  return { activeJobs, draftJobs, analytics };
};

export const useRecruiterProfile = (userId?: string) => {
  return useQuery({
    queryKey: ['recruiterProfile', userId],
    queryFn: () => recruiterApi.fetchProfile(),
    enabled: !!userId,
    staleTime: 1000 * 60 * 10,
  });
};

export const useRecruiterJobs = (userId?: string) => {
  return useQuery({
    queryKey: ['recruiterJobs', userId],
    queryFn: async () => {
      const data = await recruiterApi.fetchJobs();
      return mapJobs(data);
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
};

export const useRecruiterStats = (userId?: string) => {
  return useQuery({
    queryKey: ['recruiterStats', userId],
    queryFn: () => recruiterApi.fetchStats(),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
};
