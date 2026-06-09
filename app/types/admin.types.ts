// TypeScript types for Admin

export interface AdminDashboardStats {
  totalStudents: number;
  totalRecruiters: number;
  totalJobs: number;
  pendingRecruiters: number;
  pendingJobs: number;
  totalReports: number;
  weeklyGrowth: {
    students: number;
    recruiters: number;
    jobs: number;
  };
}

export interface PendingRecruiter {
  id: string;
  fullName: string;
  email: string;
  status: 'pending' | 'verified' | 'rejected';
  phone: string | null;
  designation: string | null;
  createdAt: string;
}

export interface AdminJob {
  id: string;
  title: string;
  status: string;
  recruiterId: string;
  recruiter: { fullName: string; email: string };
  createdAt: string;
  reportCount: number;
  location?: string;
  type?: string;
  salary?: { min: number; max: number; currency: string } | null;
  description?: string;
  applications?: number;
}

export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
  status: 'active' | 'suspended';
  createdAt: string;
  lastSeen: string | null;
}

export interface Report {
  id: string;
  type: 'spam_job' | 'fake_recruiter' | 'complaint';
  reportedBy: { fullName: string; email: string };
  targetId: string;
  targetType: 'job' | 'recruiter' | 'user';
  reason: string;
  description: string | null;
  status: 'open' | 'resolved' | 'dismissed';
  createdAt: string;
}

export interface AdminActivity {
  id: string;
  title: string;
  time: string;
  type: 'user' | 'job' | 'report';
}

export interface AdminAnalytics {
  growthData: { date: string; students: number; recruiters: number; jobs: number }[];
  topSkills: { skill: string; count: number }[];
  topCompanies: { name: string; jobs: number; applications: number }[];
  applicationStats: { date: string; count: number }[];
}

export interface VerifyRecruiterPayload {
  recruiterId: string;
  action: 'approve' | 'reject';
  note?: string;
}

export interface ReviewJobPayload {
  jobId: string;
  action: 'approve' | 'reject' | 'spam';
  reason?: string;
}
