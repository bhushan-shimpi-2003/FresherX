import api from '../axios';
import type { StudentProfile } from '../../types/user.types';

export const profileApi = {
  fetchProfile: async (userId: string): Promise<StudentProfile | null> => {
    const { data } = await api.get('/profile');
    return data ? mapProfile(data) : null;
  },

  updateProfile: async (userId: string, updates: Partial<StudentProfile>): Promise<StudentProfile> => {
    const { data } = await api.put('/profile', updates);
    return mapProfile(data);
  },
};

function mapProfile(raw: any): StudentProfile {
  return {
    id: raw.id,
    userId: raw.user_id,
    fullName: raw.full_name,
    phone: raw.phone,
    bio: raw.bio,
    college: raw.college,
    degree: raw.degree,
    branch: raw.branch,
    passingYear: raw.passing_year,
    cgpa: raw.cgpa,
    skills: raw.skills ?? [],
    languages: raw.languages ?? [],
    resumeUrl: raw.resume_url,
    preferredJobTypes: raw.preferred_job_types ?? [],
    preferredLocations: raw.preferred_locations ?? [],
    preferredRoles: raw.preferred_roles ?? [],
    preferredSalaryMin: raw.preferred_salary_min,
    onboardingComplete: raw.onboarding_complete,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
    email: raw.email ?? '',
    avatar: raw.avatar,
    resumeName: raw.resume_name,
    notificationsEnabled: raw.notifications_enabled ?? true,
    emailNotifications: raw.email_notifications ?? true,
    profileComplete: raw.profile_complete ?? false,
    location: raw.location ?? '',
    resumeData: raw.resume_data,
  };
}
