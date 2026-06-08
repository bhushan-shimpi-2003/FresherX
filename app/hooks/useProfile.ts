import { useEffect } from 'react';
import { useAuthStore } from '../store/auth.store';
import { useUserStore } from '../store/user.store';

/**
 * Fetches and exposes the current student's profile.
 */
export function useProfile() {
  const { user } = useAuthStore();
  const {
    profile,
    isLoading,
    fetchProfile,
    updateProfile,
    uploadAvatar,
    uploadResume,
  } = useUserStore();

  useEffect(() => {
    if (user) fetchProfile(user.id);
  }, [user?.id]);

  const update = async (updates: Parameters<typeof updateProfile>[1]) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    return updateProfile(user.id, updates);
  };

  const changeAvatar = async (localUri: string) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    return uploadAvatar(user.id, localUri);
  };

  const changeResume = async (localUri: string, fileName: string) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    return uploadResume(user.id, localUri, fileName);
  };

  return {
    profile,
    isLoading,
    update,
    changeAvatar,
    changeResume,
    refresh: () => user && fetchProfile(user.id),
  };
}
