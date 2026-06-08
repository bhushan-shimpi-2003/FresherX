import type { StudentProfile } from '../types/user.types';

export function calculateProfileCompleteness(profile: Partial<StudentProfile> | null): number {
  if (!profile) return 0;
  
  let score = 0;

  // Avatar: 20%
  if (profile.avatar && profile.avatar.trim() !== '') {
    score += 20;
  }

  // Bio: 20%
  if (profile.bio && profile.bio.trim().length > 10) {
    score += 20;
  }

  // Education: 20% (requires college, degree, and passing year)
  if (profile.college && profile.degree && profile.passingYear) {
    score += 20;
  } else if (profile.college || profile.degree) {
    score += 10; // Partial points
  }

  // Skills: 20% (requires at least 1 skill)
  if (profile.skills && profile.skills.length > 0) {
    score += 20;
  }

  // Preferences: 20% (requires either job types or locations)
  if (
    (profile.preferredJobTypes && profile.preferredJobTypes.length > 0) ||
    (profile.preferredLocations && profile.preferredLocations.length > 0)
  ) {
    score += 20;
  }

  return Math.min(score, 100);
}
