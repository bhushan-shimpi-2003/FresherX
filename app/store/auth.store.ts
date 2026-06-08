import { create } from 'zustand';
import api from '../services/axios';
import { storage, STORAGE_KEYS } from '../utils/storage';
import { AuthUser, AuthStatus } from '../types/auth.types';
import { UserRole } from '../constants/config';
import { supabase } from '../lib/supabase/client';

interface AuthStore {
  user: AuthUser | null;
  status: AuthStatus;
  isLoading: boolean;
  error: string | null;

  // Actions
  setUser: (user: AuthUser | null) => void;
  setStatus: (status: AuthStatus) => void;
  setError: (error: string | null) => void;
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ success: boolean; role?: UserRole; error?: string }>;
  register: (email: string, password: string, fullName: string, role: UserRole, posterType?: string) => Promise<{ success: boolean; error?: string }>;
  forgotPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  verifyOTP: (email: string, token: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  status: 'idle',
  isLoading: false,
  error: null,

  setUser: (user) => set({ user }),
  setStatus: (status) => set({ status }),
  setError: (error) => set({ error }),

  initialize: async () => {
    set({ status: 'loading' });
    try {
      const session = await storage.get<any>(STORAGE_KEYS.AUTH_SESSION);
      
      if (!session || !session.access_token) {
        set({ status: 'unauthenticated', user: null });
        return;
      }

      // Check if token is expired (basic client-side check)
      // You could also ping an /api/auth/me route if you implement one
      
      const user: AuthUser = {
        id: session.user.id,
        email: session.user.email,
        role: session.user.user_metadata.role as UserRole,
        emailVerified: true,
        createdAt: new Date().toISOString(),
      };

      set({ user, status: 'authenticated' });
    } catch (err) {
      console.error('[AuthStore] Initialization error:', err);
      set({ status: 'unauthenticated', user: null });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/login', { email, password });
      const { session } = response.data;
      
      await storage.set(STORAGE_KEYS.AUTH_SESSION, session);

      const user: AuthUser = {
        id: session.user.id,
        email: session.user.email,
        role: session.user.user_metadata.role as UserRole,
        emailVerified: true,
        createdAt: new Date().toISOString(),
      };

      set({ user, status: 'authenticated', isLoading: false });
      return { success: true, role: user.role };
    } catch (err: any) {
      const message = err?.message ?? 'Login failed. Please try again.';
      set({ error: message, isLoading: false });
      return { success: false, error: message };
    }
  },

  register: async (email, password, fullName, role, posterType) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/register', { email, password, fullName, role, posterType });
      const { session } = response.data;
      
      await storage.set(STORAGE_KEYS.AUTH_SESSION, session);

      const user: AuthUser = {
        id: session.user.id,
        email: session.user.email,
        role: session.user.user_metadata.role as UserRole,
        emailVerified: true,
        createdAt: new Date().toISOString(),
      };

      set({ user, status: 'authenticated', isLoading: false });
      return { success: true };
    } catch (err: any) {
      const message = err?.message ?? 'Registration failed.';
      set({ error: message, isLoading: false });
      return { success: false, error: message };
    }
  },

  forgotPassword: async () => ({ success: false, error: 'Not implemented' }),
  verifyOTP: async () => ({ success: false, error: 'Not implemented' }),
  resetPassword: async () => ({ success: false, error: 'Not implemented' }),

  logout: async () => {
    console.log('[AuthStore] Starting logout process');
    try {
      await supabase.auth.signOut();
      // Optional: Ping a backend /auth/logout if you need to invalidate tokens server-side
    } catch (err) {
      console.error('[AuthStore] Logout error:', err);
    } finally {
      console.log('[AuthStore] Clearing storage and state');
      await storage.clear();
      
      // Slight delay to ensure UI transitions smoothly
      setTimeout(() => {
        set({ user: null, status: 'unauthenticated' });
      }, 300);
    }
  },
}));
