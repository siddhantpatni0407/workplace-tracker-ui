// src/services/userService.ts
import axiosInstance from "./axiosInstance";
import { API_ENDPOINTS } from "../constants/apiEndpoints";

export interface BackendUser {
  userId: number;
  username: string;
  email: string;
  mobileNumber?: string;
  role: "ADMIN" | "USER";
  isActive: boolean;
  isAccountLocked?: boolean;
}

export const userService = {
  getAll: async (): Promise<{ status: string; message?: string; data?: BackendUser[] }> => {
    const resp = await axiosInstance.get(API_ENDPOINTS.USERS.GET_ALL);
    return resp.data;
  },

  // Placeholder update calls — update backend endpoints if available
  updateActive: async (id: number, isActive: boolean) => {
    // return await axiosInstance.patch(API_ENDPOINTS.USERS.UPDATE(id), { isActive });
    return { success: true };
  },

  updateLock: async (id: number, isAccountLocked: boolean) => {
    // return await axiosInstance.patch(API_ENDPOINTS.USERS.UPDATE(id), { isAccountLocked });
    return { success: true };
  },
};
