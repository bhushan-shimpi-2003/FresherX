// App-wide configuration constants

export const APP_NAME = 'FresherX';
export const APP_VERSION = '1.0.0';

// Supabase — fill in your actual values in .env
export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
export const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

// Pagination
export const PAGE_SIZE = 15;

// Job types
export const JOB_TYPES = ['Full-time', 'Part-time', 'Internship', 'Freelance', 'Remote'] as const;

// Experience levels
export const EXPERIENCE_LEVELS = ['Fresher', '0-1 years', '1-2 years', '2-5 years'] as const;

// Degree types
export const DEGREES = [
  'B.E / B.Tech',
  'B.Sc',
  'B.Com',
  'B.A',
  'MBA',
  'M.Tech',
  'M.Sc',
  'Diploma',
  'Other',
] as const;

// Skills list
export const POPULAR_SKILLS = [
  'JavaScript', 'TypeScript', 'React', 'React Native', 'Node.js',
  'Python', 'Java', 'Kotlin', 'Swift', 'Flutter',
  'SQL', 'MongoDB', 'PostgreSQL', 'GraphQL', 'REST API',
  'AWS', 'Docker', 'Kubernetes', 'Git', 'Linux',
  'Machine Learning', 'Data Science', 'UI/UX', 'Figma', 'Communication',
] as const;

// User roles
export const USER_ROLES = {
  STUDENT: 'student',
  RECRUITER: 'recruiter',
  ADMIN: 'admin',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

// Job status
export const JOB_STATUS = {
  DRAFT: 'draft',
  PENDING: 'pending',
  PUBLISHED: 'published',
  REJECTED: 'rejected',
  ARCHIVED: 'archived',
} as const;

// Recruiter status
export const RECRUITER_STATUS = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
} as const;

// Storage buckets
export const STORAGE_BUCKETS = {
  AVATARS: 'avatars',
  RESUMES: 'resumes',
  COMPANY_LOGOS: 'company-logos',
} as const;
