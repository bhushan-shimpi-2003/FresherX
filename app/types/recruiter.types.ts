// TypeScript types for Recruiter

export type RecruiterStatus = 'pending' | 'verified' | 'rejected';
export type PosterType = 'JOB_POSTER';

export interface RecruiterCompany {
  id: string;
  name: string;
  logo: string | null;
  website: string | null;
  industry: string | null;
  size: string | null;
  location: string | null;
  description: string | null;
  linkedIn: string | null;
}

export interface CreateCompanyPayload {
  name: string;
  logo?: string;
  website?: string;
  industry?: string;
  size?: string;
  location?: string;
  description?: string;
  linkedIn?: string;
}

export interface RecruiterProfile {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  avatar: string | null;
  phone: string | null;
  designation: string | null;
  posterType: PosterType | null;
  companyId: string | null;
  company?: RecruiterCompany;

  // Verification
  status: RecruiterStatus;
  verificationNote: string | null;
  verifiedAt: string | null;

  onboardingComplete: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface JobAnalytics {
  jobId: string;
  title: string;
  views: number;
  applications: number;
  saves: number;
  conversionRate: number;
  dailyViews: { date: string; count: number }[];
}

export interface RecruiterDashboardStats {
  totalJobs: number;
  publishedJobs: number;
  pendingJobs: number;
  totalViews: number;
  totalApplications: number;
  thisWeekJobs: number;
  applicationsChart?: { date: string; label: string; value: number }[];
}
