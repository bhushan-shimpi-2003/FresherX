// TypeScript types for Jobs

export type JobType = 'Full-time' | 'Part-time' | 'Internship' | 'Freelance' | 'Remote';
export type ExperienceLevel = 'Fresher' | '0-1 years' | '1-2 years' | '2-5 years';
export type JobStatus = 'draft' | 'pending' | 'published' | 'rejected' | 'archived';

export interface Job {
  id: string;
  title: string;
  companyId: string;
  recruiterId: string;
  company: Company;
  description: string;
  requirements: string;
  skills: string[];
  jobType: JobType;
  experienceLevel: ExperienceLevel;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string;
  location: string;
  isRemote: boolean;
  applyLink: string;
  deadline: string | null;
  status: JobStatus;
  views: number;
  applications: number;
  matchScore?: number; // 0-100, computed for student
  isSaved?: boolean;   // true if current student has saved it
  createdAt: string;
  updatedAt: string;
}

export interface Company {
  id: string;
  name: string;
  logo: string | null;
  website: string | null;
  industry: string | null;
  size: string | null;
  location: string | null;
  description: string | null;
}

export interface JobFilters {
  keyword?: string;
  jobType?: JobType[];
  experienceLevel?: ExperienceLevel[];
  location?: string;
  isRemote?: boolean;
  salaryMin?: number;
  skills?: string[];
  companyId?: string;
}

export interface SavedJob {
  jobId: string;
  createdAt: string;
  job: Partial<Job>;
}

export interface JobsPage {
  jobs: Job[];
  total: number;
  page: number;
  hasMore: boolean;
}

export interface CreateJobPayload {
  title: string;
  description: string;
  requirements: string;
  skills: string[];
  jobType: JobType;
  experienceLevel: ExperienceLevel;
  salaryMin?: number;
  salaryMax?: number;
  location: string;
  isRemote: boolean;
  applyLink: string;
  deadline?: string;
}
