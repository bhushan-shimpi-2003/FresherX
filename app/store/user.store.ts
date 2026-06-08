import { create } from 'zustand';
import { StudentProfile, UpdateStudentPayload } from '../types/user.types';
import { supabase } from '../lib/supabase/client';

interface UserStore {
  profile: StudentProfile | null;
  isLoading: boolean;
  error: string | null;

  fetchProfile: (userId: string) => Promise<void>;
  updateProfile: (userId: string, payload: UpdateStudentPayload) => Promise<{ success: boolean; error?: string }>;
  uploadAvatar: (userId: string, uri: string) => Promise<{ success: boolean; url?: string; error?: string }>;
  uploadResume: (userId: string, uri: string, name: string) => Promise<{ success: boolean; error?: string }>;
  deleteResume: (userId: string) => Promise<{ success: boolean; error?: string }>;
  setProfile: (profile: StudentProfile | null) => void;
  reset: () => void;
}

export const useUserStore = create<UserStore>((set, get) => ({
  profile: null,
  isLoading: false,
  error: null,

  setProfile: (profile) => set({ profile }),
  reset: () => set({ profile: null, isLoading: false, error: null }),

  fetchProfile: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('student_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      set({ profile: data as StudentProfile, isLoading: false });
    } catch (err: any) {
      set({ error: err?.message, isLoading: false });
    }
  },

  updateProfile: async (userId, payload) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('student_profiles')
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      set({ profile: data as StudentProfile, isLoading: false });
      return { success: true };
    } catch (err: any) {
      set({ error: err?.message, isLoading: false });
      return { success: false, error: err?.message };
    }
  },

  uploadAvatar: async (userId, uri) => {
    try {
      const ext = uri.split('.').pop() ?? 'jpg';
      const path = `${userId}/avatar.${ext}`;
      const formData = new FormData();
      formData.append('file', { uri, name: `avatar.${ext}`, type: `image/${ext}` } as any);

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, formData, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path);
      const avatarUrl = urlData.publicUrl;

      await supabase
        .from('student_profiles')
        .update({ avatar: avatarUrl })
        .eq('user_id', userId);

      const currentProfile = get().profile;
      if (currentProfile) set({ profile: { ...currentProfile, avatar: avatarUrl } });

      return { success: true, url: avatarUrl };
    } catch (err: any) {
      return { success: false, error: err?.message };
    }
  },

  uploadResume: async (userId, uri, name) => {
    try {
      const path = `${userId}/${name}`;
      const formData = new FormData();
      formData.append('file', { uri, name, type: 'application/pdf' } as any);

      const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(path, formData, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('resumes').getPublicUrl(path);
      const resumeUrl = urlData.publicUrl;

      await supabase
        .from('student_profiles')
        .update({ resume_url: resumeUrl, resume_name: name })
        .eq('user_id', userId);

      const currentProfile = get().profile;
      if (currentProfile) set({ profile: { ...currentProfile, resumeUrl, resumeName: name } });

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message };
    }
  },

  deleteResume: async (userId) => {
    try {
      await supabase
        .from('student_profiles')
        .update({ resume_url: null, resume_name: null })
        .eq('user_id', userId);

      const currentProfile = get().profile;
      if (currentProfile) set({ profile: { ...currentProfile, resumeUrl: null, resumeName: null } });
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message };
    }
  },
}));
