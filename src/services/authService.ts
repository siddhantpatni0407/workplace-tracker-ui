// src/services/authService.ts
import axiosInstance from "./axiosInstance";
import { User, Role } from "../context/AuthContext";
import { API_ENDPOINTS } from "../constants/apiEndpoints";

export interface SignupData {
  name: string;
  mobileNumber: string; // ✅ changed from mobile → mobileNumber
  email: string;
  password: string;
  role: Role;
}

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

export const authService = {
  signup: async (data: SignupData): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>(
      API_ENDPOINTS.AUTH.SIGNUP,
      data // ✅ now includes correct field names
    );
    return response.data;
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>(
      API_ENDPOINTS.AUTH.LOGIN,
      { email, password }
    );
    return response.data;
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

  getUser: (): User | null => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  },
};
