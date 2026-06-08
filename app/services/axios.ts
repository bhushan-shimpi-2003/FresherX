import axios from 'axios';

// Axios is used for any non-Supabase external API calls (e.g., job board scraping, analytics)
// For most Supabase calls, we use the supabase-js client directly.

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

import { storage, STORAGE_KEYS } from '../utils/storage';

// Request interceptor — attach custom JWT session token
api.interceptors.request.use(
  async (config) => {
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.baseURL || ''}${config.url}`);
    try {
      const session = await storage.get<any>(STORAGE_KEYS.AUTH_SESSION);
      if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
      }
    } catch {}
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — normalize errors
api.interceptors.response.use(
  (response) => {
    console.log(`[API Success] ${response.config.method?.toUpperCase()} ${response.config.baseURL || ''}${response.config.url} - Status: ${response.status}`);
    return response;
  },
  (error) => {
    const method = error?.config?.method?.toUpperCase() || 'UNKNOWN';
    const url = error?.config?.url || 'UNKNOWN_URL';
    const status = error?.response?.status || 'NO_STATUS';
    
    console.error(`[API Failed] ${method} ${error?.config?.baseURL || ''}${url} - Status: ${status}`);
    
    const message =
      error?.response?.data?.message ??
      error?.response?.data?.error ??
      error?.message ??
      'An unexpected error occurred';
      
    console.error(`[API Error Details] ${message}`);
    return Promise.reject(new Error(message));
  }
);

export default api;
