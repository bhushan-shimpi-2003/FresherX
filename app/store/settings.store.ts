import { create } from 'zustand';
import { storage, STORAGE_KEYS } from '../utils/storage';

type ThemeMode = 'dark' | 'light' | 'system';

interface SettingsStore {
  themeMode: ThemeMode;
  notificationsEnabled: boolean;
  emailNotifications: boolean;
  language: string;

  // Admin Configs
  autoVerifyDomains: boolean;
  autoApproveJobs: boolean;
  maintenanceMode: boolean;

  setThemeMode: (mode: ThemeMode) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setEmailNotifications: (enabled: boolean) => void;
  setLanguage: (lang: string) => void;
  
  setAutoVerifyDomains: (enabled: boolean) => void;
  setAutoApproveJobs: (enabled: boolean) => void;
  setMaintenanceMode: (enabled: boolean) => void;

  loadSettings: () => Promise<void>;
  saveSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  themeMode: 'light',
  notificationsEnabled: true,
  emailNotifications: true,
  language: 'en',
  autoVerifyDomains: false,
  autoApproveJobs: false,
  maintenanceMode: false,

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
  setAutoVerifyDomains: (enabled) => {
    set({ autoVerifyDomains: enabled });
    get().saveSettings();
  },
  setAutoApproveJobs: (enabled) => {
    set({ autoApproveJobs: enabled });
    get().saveSettings();
  },
  setMaintenanceMode: (enabled) => {
    set({ maintenanceMode: enabled });
    get().saveSettings();
  },

  loadSettings: async () => {
    const saved = await storage.get<Partial<SettingsStore>>(STORAGE_KEYS.THEME);
    if (saved) {
      set({
        themeMode: saved.themeMode ?? 'light',
        notificationsEnabled: saved.notificationsEnabled ?? true,
        emailNotifications: saved.emailNotifications ?? true,
        language: saved.language ?? 'en',
        autoVerifyDomains: saved.autoVerifyDomains ?? false,
        autoApproveJobs: saved.autoApproveJobs ?? false,
        maintenanceMode: saved.maintenanceMode ?? false,
      });
    }
  },

  saveSettings: async () => {
    const { 
      themeMode, notificationsEnabled, emailNotifications, language,
      autoVerifyDomains, autoApproveJobs, maintenanceMode 
    } = get();
    await storage.set(STORAGE_KEYS.THEME, {
      themeMode, notificationsEnabled, emailNotifications, language,
      autoVerifyDomains, autoApproveJobs, maintenanceMode
    });
  },
}));
