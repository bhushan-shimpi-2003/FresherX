// TypeScript types for Users (Student Profile)

export interface StudentProfile {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  avatar: string | null;
  phone: string | null;
  bio: string | null;

  // Education
  college: string | null;
  degree: string | null;
  branch: string | null;
  passingYear: number | null;
  cgpa: number | null;

  // Skills & Preferences
  skills: string[];
  languages: string[];
  preferredJobTypes: string[];
  preferredLocations: string[];
  preferredSalaryMin: number | null;

  // Resume
  resumeUrl: string | null;
  resumeName: string | null;

  // Settings
  notificationsEnabled: boolean;
  emailNotifications: boolean;
  profileComplete: boolean;
  onboardingComplete: boolean;

  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: string;
  data?: any;
  read: boolean;
  createdAt: string;
}

export interface UpdateStudentPayload {
  fullName?: string;
  phone?: string;
  bio?: string;
  college?: string;
  degree?: string;
  branch?: string;
  passingYear?: number;
  cgpa?: number;
  skills?: string[];
  languages?: string[];
  preferredJobTypes?: string[];
  preferredLocations?: string[];
  preferredSalaryMin?: number;
  resumeUrl?: string;
  resumeName?: string;
  onboardingComplete?: boolean;
}
