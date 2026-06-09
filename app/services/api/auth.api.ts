import { supabase } from '../../lib/supabase/client';
import type { UserRole } from '../../constants/config';
import api from '../axios';

export const authApi = {
  /**
   * Sign in with email/password
   */
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  /**
   * Register a new user with role metadata
   */
  signUp: async (email: string, password: string, fullName: string, role: UserRole) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role },
      },
    });
    if (error) throw error;
    return data;
  },

  /**
   * Verify OTP sent to email
   */
  verifyOTP: async (email: string, token: string) => {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    });
    if (error) throw error;
    return data;
  },

  /**
   * Send password reset email
   */
  forgotPassword: async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'fresherx://reset-password',
    });
    if (error) throw error;
  },

  /**
   * Update password (user must be authenticated via reset link)
   */
  updatePassword: async (password: string) => {
    const { data, error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
    return data;
  },

  /**
   * Change password for logged-in user (requires current password)
   */
  changePassword: async (currentPassword: string, newPassword: string) => {
    const { data } = await api.put('/auth/update-password', { currentPassword, newPassword });
    return data;
  },

  /**
   * Sign out
   */
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  /**
   * Get the current session
   */
  getSession: async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  /**
   * Subscribe to auth state changes
   */
  onAuthStateChange: (callback: Parameters<typeof supabase.auth.onAuthStateChange>[0]) => {
    return supabase.auth.onAuthStateChange(callback);
  },
};
