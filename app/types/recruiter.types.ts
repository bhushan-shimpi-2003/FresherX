// TypeScript types for Recruiter

export type RecruiterStatus = 'pending' | 'verified' | 'rejected';

export interface RecruiterProfile {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  avatar: string | null;
  phone: string | null;
  designation: string | null;

  // Company
  companyId: string | null;
  company: RecruiterCompany | null;

  // Verification
  status: RecruiterStatus;
  verificationNote: string | null;
  verifiedAt: string | null;

  onboardingComplete: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RecruiterCompany {
  id: string;
  name: string;
  logo: string | null;
  website: string | null;
  industry: string;
  size: string;
  location: string;
  description: string;
  linkedIn: string | null;
  totalJobs: number;
  totalApplications: number;
}

export interface CreateCompanyPayload {
  name: string;
  website?: string;
  industry: string;
  size: string;
  location: string;
  description: string;
  linkedIn?: string;
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
}
