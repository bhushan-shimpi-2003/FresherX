// TypeScript types for Recruiter

export type RecruiterStatus = 'pending' | 'verified' | 'rejected';
export type PosterType = 'JOB_POSTER';

export interface RecruiterProfile {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  avatar: string | null;
  phone: string | null;
  designation: string | null;
  posterType: PosterType | null;



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
}
