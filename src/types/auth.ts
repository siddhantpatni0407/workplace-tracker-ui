// src/types/auth.ts

export type Role = "SUPER_ADMIN" | "ADMIN" | "MANAGER" | "USER";

/** Credentials used by login API (email + password) */
export interface LoginCredentials {
  email: string;
  password: string;
}

/** Signup payload (matches backend: mobileNumber) */
export interface SignupData {
  name: string;
  mobileNumber: string;
  email: string;
  password: string;
  role: Role;
  platformUserCode?: string;
  tenantCode?: string;
  tenantUserCode?: string;
}

/** Lightweight user shape stored in localStorage / used in context */
export interface User {
  userId?: number | null;
  name?: string | null;
  mobileNumber?: string | null;
  email?: string | null;
  role?: Role | null;
  isActive?: boolean | null;
  lastLoginTime?: string | null;
  loginAttempts?: number | null;
  accountLocked?: boolean | null;
}

/** Canonical AuthResponse used by authService and components */
export interface AuthResponse {
  accessToken?: string | null; // canonical access token field
  token?: string | null;       // legacy fallback
  role?: Role | null;
  userId?: number | null;
  name?: string | null;
  email?: string | null;
  status: "SUCCESS" | "FAILED";
  message?: string | null;
  lastLoginTime?: string | null;
  isActive?: boolean | null;
  loginAttempts?: number | null;
  accountLocked?: boolean | null;
}
