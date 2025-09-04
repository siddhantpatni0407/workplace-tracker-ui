// src/services/authService.ts
import axiosInstance from "./axiosInstance";
import { API_ENDPOINTS } from "../constants/apiEndpoints";
import { Role } from "../types/auth";

/**
 * Mirror of backend response
 */
export interface AuthResponse {
  token: string | null;
  role: Role | null;
  userId: number | null;
  name: string | null;
  status: "SUCCESS" | "FAILED";
  message: string;
  lastLoginTime: string | null;
  isActive: boolean | null;
  loginAttempts: number | null;
  accountLocked: boolean | null;
}

export interface SignupData {
  name: string;
  mobileNumber: string; // backend expects mobileNumber
  email: string;
  password: string;
  role: Role;
}

export const authService = {
  signup: async (data: SignupData): Promise<AuthResponse> => {
    try {
      const resp = await axiosInstance.post<AuthResponse>(API_ENDPOINTS.AUTH.SIGNUP, data);
      return resp.data;
    } catch (err: any) {
      // If backend responded with a body, return that message
      if (err?.response?.data) {
        return err.response.data as AuthResponse;
      }
      return {
        token: null,
        role: null,
        userId: null,
        name: null,
        status: "FAILED",
        message: err?.message || "Signup failed due to network error.",
        lastLoginTime: null,
        isActive: null,
        loginAttempts: null,
        accountLocked: null,
      };
    }
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const resp = await axiosInstance.post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, { email, password });
      return resp.data;
    } catch (err: any) {
      if (err?.response?.data) {
        return err.response.data as AuthResponse;
      }
      return {
        token: null,
        role: null,
        userId: null,
        name: null,
        status: "FAILED",
        message: err?.message || "Login failed due to network error.",
        lastLoginTime: null,
        isActive: null,
        loginAttempts: null,
        accountLocked: null,
      };
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  saveSession: (resp: AuthResponse) => {
    if (resp.status === "SUCCESS" && resp.token) {
      localStorage.setItem("token", resp.token);
      localStorage.setItem(
        "user",
        JSON.stringify({
          userId: resp.userId,
          name: resp.name,
          role: resp.role,
          isActive: resp.isActive,
        })
      );
    }
  },

  getUser: (): { name: string; mobileNumber?: string; email?: string; role?: Role } | null => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  },
};
