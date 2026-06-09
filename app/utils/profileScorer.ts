import type { StudentProfile } from '../types/user.types';

export function calculateProfileCompleteness(profile: Partial<StudentProfile> | null): number {
  if (!profile) return 0;
  
  let score = 0;

  // Personal Info (Name): 25%
  if (profile.fullName && profile.fullName.trim().length > 2) {
    score += 25;
  }

  // Education: 25% (requires college and degree)
  if (profile.college && profile.degree) {
    score += 25;
  }

  // Skills: 25% (requires at least 1 skill)
  if (profile.skills && profile.skills.length > 0) {
    score += 25;
  }

  // Preferences: 25% (requires either job types or locations)
  if (
    (profile.preferredJobTypes && profile.preferredJobTypes.length > 0) ||
    (profile.preferredLocations && profile.preferredLocations.length > 0)
  ) {
    score += 25;
  }

  return Math.min(score, 100);
}
