// src/services/adminManagementService.ts
import axiosInstance from './axiosInstance';
import { API_ENDPOINTS } from '../constants/apiEndpoints';

export interface Admin {
  tenantUserId: number;
  tenantId: number;
  tenantName: string;
  tenantCode: string;
  platformUserId: number;
  platformUserName: string;
  platformUserCode: string;
  roleId: number;
  role: string;
  tenantUserCode: string;
  managerTenantUserId: number | null;
  managerName: string | null;
  name: string;
  email: string;
  mobileNumber: string;
  isActive: boolean;
  loginAttempts: number;
  accountLocked: boolean;
  lastLoginTime: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminListItem {
  tenantUserId: number;
  tenantId: number;
  tenantName: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  managerName: string | null;
}

export interface UpdateStatusRequest {
  isActive: boolean;
}

export interface ApiResponse<T> {
  status: 'SUCCESS' | 'FAILED';
  message: string;
  data: T;
}

class AdminManagementService {
  /**
   * Get all Admin users in the Super Admin's tenant
   */
  async getAllAdmins(): Promise<ApiResponse<Admin[]>> {
    const response = await axiosInstance.get(API_ENDPOINTS.SUPER_ADMIN.GET_ALL_ADMINS);
    return response.data;
  }

  /**
   * Get Admin users by tenant (alternative endpoint)
   */
  async getAdminsByTenant(): Promise<ApiResponse<AdminListItem[]>> {
    const response = await axiosInstance.get(API_ENDPOINTS.SUPER_ADMIN.GET_ADMINS_BY_TENANT);
    return response.data;
  }

  /**
   * Search Admin users by name or email
   */
  async searchAdmins(searchTerm: string): Promise<ApiResponse<AdminListItem[]>> {
    const response = await axiosInstance.get(
      `${API_ENDPOINTS.SUPER_ADMIN.SEARCH_ADMINS}?searchTerm=${encodeURIComponent(searchTerm)}`
    );
    return response.data;
  }

  /**
   * Get detailed information about a specific Admin
   */
  async getAdminDetails(adminId: number): Promise<ApiResponse<Admin>> {
    const response = await axiosInstance.get(
      `${API_ENDPOINTS.SUPER_ADMIN.GET_ADMIN_DETAILS}?adminId=${adminId}`
    );
    return response.data;
  }

  /**
   * Update Admin status (activate/deactivate)
   */
  async updateAdminStatus(
    adminId: number, 
    statusData: UpdateStatusRequest
  ): Promise<ApiResponse<AdminListItem>> {
    const response = await axiosInstance.put(
      `${API_ENDPOINTS.SUPER_ADMIN.UPDATE_ADMIN_STATUS}?adminId=${adminId}`,
      statusData
    );
    return response.data;
  }
}

export const adminManagementService = new AdminManagementService();