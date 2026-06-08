import { useEffect } from 'react';
import { useAuthStore } from '../store/auth.store';

/**
 * Provides auth state + actions with a convenient hook interface.
 * Initialises the session listener on first mount.
 */
export function useAuth() {
  const {
    user,
    status,
    isLoading,
    error,
    login,
    register,
    verifyOTP,
    forgotPassword,
    resetPassword,
    logout,
    initialize,
  } = useAuthStore();

  // Kick-off auth listener (idempotent — guarded inside the store)
  useEffect(() => {
    initialize();
  }, []);

  return {
    user,
    isAuthenticated: status === 'authenticated',
    status,
    isLoading,
    error,
    login,
    register,
    verifyOTP,
    forgotPassword,
    resetPassword,
    logout,
  };
}
