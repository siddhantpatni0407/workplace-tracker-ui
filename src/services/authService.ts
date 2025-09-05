// src/services/authService.ts
import axios from "axios";
import axiosInstance from "./axiosInstance";
import { API_ENDPOINTS } from "../constants/apiEndpoints";
import { Role } from "../types/auth";

/**
 * AuthResponse:
 * - `accessToken` is the canonical field for new responses
 * - `token` is kept for backward compatibility
 */
export interface AuthResponse {
  accessToken?: string | null;
  token?: string | null;
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

/** Signup payload */
export interface SignupData {
  name: string;
  mobileNumber: string;
  email: string;
  password: string;
  role: Role;
}

export const authService = {
  signup: async (data: SignupData): Promise<AuthResponse> => {
    try {
      const resp = await axiosInstance.post<AuthResponse>(API_ENDPOINTS.AUTH.SIGNUP, data);
      return normalizeAuthResponse(resp.data);
    } catch (err: any) {
      if (err?.response?.data) return normalizeAuthResponse(err.response.data);
      return {
        status: "FAILED",
        message: err?.message || "Signup failed",
      };
    }
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const resp = await axiosInstance.post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, { email, password });
      return normalizeAuthResponse(resp.data);
    } catch (err: any) {
      if (err?.response?.data) return normalizeAuthResponse(err.response.data);
      return {
        status: "FAILED",
        message: err?.message || "Login failed",
      };
    }
  },

  /**
   * Call refresh endpoint to obtain a new access token.
   * Uses plain axios to avoid interceptor recursion.
   * Backend should set/expect HttpOnly refresh cookie (withCredentials:true).
   */
  refresh: async (): Promise<AuthResponse> => {
    try {
      const resp = await axios.post(API_ENDPOINTS.AUTH.REFRESH_TOKEN, {}, { withCredentials: true });
      return normalizeAuthResponse(resp.data);
    } catch (err: any) {
      if (err?.response?.data) return normalizeAuthResponse(err.response.data);
      return {
        status: "FAILED",
        message: err?.message || "Refresh failed",
      };
    }
  },

  logout: () => {
    // clear frontend stored tokens and user
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("lastLoginTime");
    localStorage.removeItem("lastLoginShown");

    // Optionally call server logout to clear refresh cookie server-side (best-effort)
    try {
      axiosInstance.post(API_ENDPOINTS.AUTH.LOGOUT).catch(() => {});
    } catch {}
  },

  saveSession: (resp: AuthResponse) => {
    // prefer canonical accessToken then fallback to token
    const access = resp.accessToken ?? resp.token ?? null;
    if (resp.status === "SUCCESS" && access) {
      localStorage.setItem("token", access);

      // Save user object (minimal fields)
      localStorage.setItem(
        "user",
        JSON.stringify({
          userId: resp.userId ?? null,
          name: resp.name ?? null,
          email: resp.email ?? null,
          role: resp.role ?? null,
          isActive: resp.isActive ?? null,
          lastLoginTime: resp.lastLoginTime ?? null,
          loginAttempts: resp.loginAttempts ?? null,
          accountLocked: resp.accountLocked ?? null,
        })
      );

      if (resp.lastLoginTime) {
        localStorage.setItem("lastLoginTime", resp.lastLoginTime);
        localStorage.setItem("lastLoginShown", "false");
      }
    }
  },

  getUser: (): {
    userId?: number | null;
    name?: string | null;
    email?: string | null;
    role?: Role | null;
    isActive?: boolean | null;
    lastLoginTime?: string | null;
    loginAttempts?: number | null;
    accountLocked?: boolean | null;
  } | null => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  },
};

/** Helpers */

/** Normalize backend response into AuthResponse shape we expect */
function normalizeAuthResponse(raw: any): AuthResponse {
  if (!raw) return { status: "FAILED", message: "Empty response" };

  // If backend returns fields under different names, map them here
  const accessToken = raw.accessToken ?? raw.token ?? raw.data?.accessToken ?? raw.data?.token;
  const payload: AuthResponse = {
    accessToken,
    token: raw.token ?? raw.accessToken ?? undefined,
    role: raw.role ?? raw.data?.role ?? undefined,
    userId: raw.userId ?? raw.data?.userId ?? undefined,
    name: raw.name ?? raw.data?.name ?? undefined,
    email: raw.email ?? raw.data?.email ?? undefined,
    status: raw.status ?? raw.data?.status ?? (accessToken ? "SUCCESS" : "FAILED"),
    message: raw.message ?? raw.data?.message ?? undefined,
    lastLoginTime: raw.lastLoginTime ?? raw.data?.lastLoginTime ?? undefined,
    isActive: raw.isActive ?? raw.data?.isActive ?? undefined,
    loginAttempts: typeof raw.loginAttempts === "number" ? raw.loginAttempts : raw.data?.loginAttempts,
    accountLocked: typeof raw.accountLocked === "boolean" ? raw.accountLocked : raw.data?.accountLocked,
  };
  return payload;
}
