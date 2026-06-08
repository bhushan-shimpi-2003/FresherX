import { create } from 'zustand';
import { storage, STORAGE_KEYS } from '../utils/storage';

type ThemeMode = 'dark' | 'light' | 'system';

interface SettingsStore {
  themeMode: ThemeMode;
  notificationsEnabled: boolean;
  emailNotifications: boolean;
  language: string;

  setThemeMode: (mode: ThemeMode) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setEmailNotifications: (enabled: boolean) => void;
  setLanguage: (lang: string) => void;
  loadSettings: () => Promise<void>;
  saveSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  themeMode: 'dark',
  notificationsEnabled: true,
  emailNotifications: true,
  language: 'en',

  setThemeMode: (mode) => {
    set({ themeMode: mode });
    get().saveSettings();
  },
  setNotificationsEnabled: (enabled) => {
    set({ notificationsEnabled: enabled });
    get().saveSettings();
  },
  setEmailNotifications: (enabled) => {
    set({ emailNotifications: enabled });
    get().saveSettings();
  },
  setLanguage: (lang) => {
    set({ language: lang });
    get().saveSettings();
  },

  loadSettings: async () => {
    const saved = await storage.get<Partial<SettingsStore>>(STORAGE_KEYS.THEME);
    if (saved) {
      set({
        themeMode: saved.themeMode ?? 'dark',
        notificationsEnabled: saved.notificationsEnabled ?? true,
        emailNotifications: saved.emailNotifications ?? true,
        language: saved.language ?? 'en',
      });
    }
  },

  saveSettings: async () => {
    const { themeMode, notificationsEnabled, emailNotifications, language } = get();
    await storage.set(STORAGE_KEYS.THEME, {
      themeMode, notificationsEnabled, emailNotifications, language,
    });
  },
}));
