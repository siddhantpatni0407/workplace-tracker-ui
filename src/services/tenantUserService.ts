// src/services/tenantUserService.ts
import platformAxios from './platformAxiosInstance';
import { API_ENDPOINTS } from '../constants/apiEndpoints';

export interface SuperAdmin {
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

export interface SuperAdminListItem {
  tenantUserId: number;
  tenantId: number;
  tenantName: string;
  tenantCode: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
}

export interface UpdateStatusRequest {
  isActive: boolean;
}

export interface ApiResponse<T> {
  status: 'SUCCESS' | 'FAILED';
  message: string;
  data: T;
}

class TenantUserService {
  /**
   * Get all Super Admin users across all tenants
   */
  async getAllSuperAdmins(): Promise<ApiResponse<SuperAdmin[]>> {
    const response = await platformAxios.get(API_ENDPOINTS.PLATFORM_USERS.GET_ALL_SUPER_ADMINS);
    return response.data;
  }

  /**
   * Get Super Admin users by tenant ID
   */
  async getSuperAdminsByTenant(tenantId: number): Promise<ApiResponse<SuperAdminListItem[]>> {
    const response = await platformAxios.get(
      `${API_ENDPOINTS.PLATFORM_USERS.GET_SUPER_ADMINS_BY_TENANT}?tenantId=${tenantId}`
    );
    return response.data;
  }

  /**
   * Search Super Admin users by name or email
   */
  async searchSuperAdmins(searchTerm: string): Promise<ApiResponse<SuperAdminListItem[]>> {
    const response = await platformAxios.get(
      `${API_ENDPOINTS.PLATFORM_USERS.SEARCH_SUPER_ADMINS}?searchTerm=${encodeURIComponent(searchTerm)}`
    );
    return response.data;
  }

  /**
   * Get detailed information about a specific Super Admin
   */
  async getSuperAdminDetails(tenantUserId: number): Promise<ApiResponse<SuperAdmin>> {
    const response = await platformAxios.get(
      `${API_ENDPOINTS.PLATFORM_USERS.GET_SUPER_ADMIN_DETAILS}?tenantUserId=${tenantUserId}`
    );
    return response.data;
  }

  /**
   * Update Super Admin status (activate/deactivate)
   */
  async updateSuperAdminStatus(
    tenantUserId: number, 
    statusData: UpdateStatusRequest
  ): Promise<ApiResponse<SuperAdminListItem>> {
    const response = await platformAxios.put(
      `${API_ENDPOINTS.PLATFORM_USERS.UPDATE_SUPER_ADMIN_STATUS}?tenantUserId=${tenantUserId}`,
      statusData
    );
    return response.data;
  }
}

export const tenantUserService = new TenantUserService();