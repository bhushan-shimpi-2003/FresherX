// TypeScript types for Auth

import { UserRole } from '../constants/config';

export interface AuthUser {
  id: string;
  email: string;
  fullName?: string;
  role: UserRole;
  emailVerified: boolean;
  onboardingComplete?: boolean;
  createdAt: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
}

export interface OTPPayload {
  email: string;
  token: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  password: string;
  confirmPassword: string;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  user: AuthUser;
}

export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated';
