/**
 * Tenant management service
 * Handles all tenant-related API operations based on TENANT_MANAGEMENT_API_README.md
 */

import { AxiosResponse } from 'axios';
import { ApiResponse } from '../models/Api';
import { API_ENDPOINTS } from '../constants/apiEndpoints';
import platformAxiosInstance from './platformAxiosInstance';
import {
  TenantDTO,
  TenantCreateRequest,
  TenantUpdateRequest,
  TenantStatusUpdateRequest,
  TenantPaginatedResponse,
  TenantStats,
  TenantSearchParams,
  Subscription
} from '../models/Tenant';

// No need for BASE_URL since platformAxiosInstance already has the full base URL configured

/**
 * Create a new tenant
 */
export const createTenant = async (tenantData: TenantCreateRequest): Promise<ApiResponse<TenantDTO>> => {
  const response: AxiosResponse<ApiResponse<TenantDTO>> = await platformAxiosInstance.post(
    API_ENDPOINTS.TENANTS.CREATE,
    tenantData
  );
  return response.data;
};

/**
 * Get all tenants with pagination and sorting
 */
export const getTenants = async (params: TenantSearchParams = {}): Promise<ApiResponse<TenantPaginatedResponse>> => {
  const {
    page = 0,
    size = 10,
    sortBy = 'tenantName',
    sortDir = 'asc'
  } = params;

  const response: AxiosResponse<ApiResponse<TenantPaginatedResponse>> = await platformAxiosInstance.get(
    API_ENDPOINTS.TENANTS.GET_ALL,
    {
      params: {
        page,
        size,
        sortBy,
        sortDir
      }
    }
  );
  return response.data;
};

/**
 * Get all active tenants
 */
export const getActiveTenants = async (): Promise<ApiResponse<TenantDTO[]>> => {
  const response: AxiosResponse<ApiResponse<TenantDTO[]>> = await platformAxiosInstance.get(
    API_ENDPOINTS.TENANTS.GET_ACTIVE
  );
  return response.data;
};

/**
 * Get tenant by ID
 */
export const getTenantById = async (tenantId: number): Promise<ApiResponse<TenantDTO>> => {
  const response: AxiosResponse<ApiResponse<TenantDTO>> = await platformAxiosInstance.get(
    API_ENDPOINTS.TENANTS.GET_BY_ID,
    {
      params: { tenantId }
    }
  );
  return response.data;
};

/**
 * Get tenant by code
 */
export const getTenantByCode = async (tenantCode: string): Promise<ApiResponse<TenantDTO>> => {
  const response: AxiosResponse<ApiResponse<TenantDTO>> = await platformAxiosInstance.get(
    API_ENDPOINTS.TENANTS.GET_BY_CODE,
    {
      params: { tenantCode }
    }
  );
  return response.data;
};

/**
 * Update tenant
 */
export const updateTenant = async (
  tenantId: number,
  tenantData: TenantUpdateRequest
): Promise<ApiResponse<TenantDTO>> => {
  const response: AxiosResponse<ApiResponse<TenantDTO>> = await platformAxiosInstance.put(
    API_ENDPOINTS.TENANTS.UPDATE,
    tenantData,
    {
      params: { tenantId }
    }
  );
  return response.data;
};

/**
 * Update tenant status (activate/deactivate)
 */
export const updateTenantStatus = async (
  statusData: TenantStatusUpdateRequest
): Promise<ApiResponse<TenantDTO>> => {
  const response: AxiosResponse<ApiResponse<TenantDTO>> = await platformAxiosInstance.patch(
    API_ENDPOINTS.TENANTS.UPDATE_STATUS,
    statusData
  );
  return response.data;
};

/**
 * Delete tenant (soft delete - sets isActive to false)
 */
export const deleteTenant = async (tenantId: number): Promise<ApiResponse<string>> => {
  const response: AxiosResponse<ApiResponse<string>> = await platformAxiosInstance.delete(
    API_ENDPOINTS.TENANTS.DELETE,
    {
      params: { tenantId }
    }
  );
  return response.data;
};

/**
 * Search tenants by term
 */
export const searchTenants = async (searchTerm: string): Promise<ApiResponse<TenantDTO[]>> => {
  const response: AxiosResponse<ApiResponse<TenantDTO[]>> = await platformAxiosInstance.get(
    API_ENDPOINTS.TENANTS.SEARCH,
    {
      params: { searchTerm }
    }
  );
  return response.data;
};

/**
 * Get tenant statistics
 */
export const getTenantStats = async (tenantId: number): Promise<ApiResponse<TenantStats>> => {
  const response: AxiosResponse<ApiResponse<TenantStats>> = await platformAxiosInstance.get(
    API_ENDPOINTS.TENANTS.GET_STATS,
    {
      params: { tenantId }
    }
  );
  return response.data;
};

/**
 * Get tenant users
 */
export const getTenantUsers = async (tenantId: number): Promise<ApiResponse<any[]>> => {
  const response: AxiosResponse<ApiResponse<any[]>> = await platformAxiosInstance.get(
    API_ENDPOINTS.TENANTS.GET_USERS,
    {
      params: { tenantId }
    }
  );
  return response.data;
};

// Subscription-related functions

/**
 * Get all subscriptions
 */
export const getAllSubscriptions = async (): Promise<ApiResponse<Subscription[]>> => {
  const response: AxiosResponse<ApiResponse<Subscription[]>> = await platformAxiosInstance.get(
    API_ENDPOINTS.SUBSCRIPTIONS.GET_ALL
  );
  return response.data;
};

/**
 * Get all active subscriptions (recommended for UI dropdowns)
 */
export const getActiveSubscriptions = async (): Promise<ApiResponse<Subscription[]>> => {
  const response: AxiosResponse<ApiResponse<Subscription[]>> = await platformAxiosInstance.get(
    API_ENDPOINTS.SUBSCRIPTIONS.GET_ACTIVE
  );
  return response.data;
};

/**
 * Get subscription by code
 */
export const getSubscriptionByCode = async (subscriptionCode: string): Promise<ApiResponse<Subscription>> => {
  const response: AxiosResponse<ApiResponse<Subscription>> = await platformAxiosInstance.get(
    API_ENDPOINTS.SUBSCRIPTIONS.GET_BY_CODE,
    {
      params: { subscriptionCode }
    }
  );
  return response.data;
};

// Utility functions for error handling and validation

/**
 * Check if tenant name is unique (by attempting to search for it)
 */
export const checkTenantNameExists = async (tenantName: string): Promise<boolean> => {
  try {
    const response = await searchTenants(tenantName);
    return (response.data && response.data.length > 0) || false;
  } catch (error) {
    // If search fails, assume name doesn't exist
    return false;
  }
};

/**
 * Validate subscription ID exists
 */
export const validateSubscriptionId = async (subscriptionId: number): Promise<boolean> => {
  try {
    const response = await getAllSubscriptions();
    return response.data?.some(sub => sub.appSubscriptionId === subscriptionId) || false;
  } catch (error) {
    return false;
  }
};

/**
 * Update tenant's subscription plan
 */
export const updateTenantSubscription = async (
  tenantCode: string,
  subscriptionCode: string
): Promise<ApiResponse<TenantDTO>> => {
  try {
    const response = await platformAxiosInstance.patch<ApiResponse<TenantDTO>>(
      `${API_ENDPOINTS.TENANTS.UPDATE_SUBSCRIPTION}?tenantCode=${tenantCode}&subscriptionCode=${subscriptionCode}`
    );
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { status: 'FAILED', message: 'Failed to update tenant subscription' };
  }
};

export default {
  createTenant,
  getTenants,
  getActiveTenants,
  getTenantById,
  getTenantByCode,
  updateTenant,
  updateTenantStatus,
  deleteTenant,
  searchTenants,
  getTenantStats,
  getTenantUsers,
  getAllSubscriptions,
  getActiveSubscriptions,
  getSubscriptionByCode,
  checkTenantNameExists,
  validateSubscriptionId,
  updateTenantSubscription
};