// src/services/platformStatsService.ts
import { AxiosResponse } from 'axios';
import platformAxiosInstance from './platformAxiosInstance';
import { API_ENDPOINTS } from '../constants/apiEndpoints';
import { ApiResponse } from '../models/Api';
import { PlatformStatsDTO } from '../models/Platform';
import { ApiStatus } from '../enums/ApiEnums';

class PlatformStatsService {
  /**
   * Get comprehensive platform statistics
   * @returns Promise<ApiResponse<PlatformStatsDTO>>
   */
  async getPlatformStats(): Promise<ApiResponse<PlatformStatsDTO>> {
    try {
      const response: AxiosResponse<ApiResponse<PlatformStatsDTO>> = await platformAxiosInstance.get(
        API_ENDPOINTS.PLATFORM.STATS
      );

      if (response.data && response.data.status === 'SUCCESS') {
        return {
          status: ApiStatus.SUCCESS,
          message: response.data.message || 'Platform statistics retrieved successfully',
          data: response.data.data
        };
      }

      return {
        status: ApiStatus.ERROR,
        message: response.data?.message || 'Failed to retrieve platform statistics',
        data: undefined
      };
    } catch (error: any) {
      console.error('Error fetching platform statistics:', error);
      
      let errorMessage = 'Failed to fetch platform statistics';
      
      if (error.response?.status === 403) {
        errorMessage = 'Access denied. PLATFORM_USER role required.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Invalid or missing JWT token.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      return {
        status: ApiStatus.ERROR,
        message: errorMessage,
        data: undefined
      };
    }
  }

  /**
   * Format platform statistics for display
   * @param stats PlatformStatsDTO
   * @returns Formatted statistics object
   */
  formatPlatformStats(stats: PlatformStatsDTO) {
    return {
      overview: {
        totalTenants: stats.totalTenants,
        totalSuperAdmins: stats.totalSuperAdmins,
        totalAdmins: stats.totalAdmins,
        totalUsers: stats.totalUsers,
        totalTenantUsers: stats.totalTenantUsers
      },
      calculations: {
        averageUsersPerTenant: stats.totalTenants > 0 ? Math.round(stats.totalTenantUsers / stats.totalTenants) : 0,
        superAdminPercentage: stats.totalTenantUsers > 0 ? ((stats.totalSuperAdmins / stats.totalTenantUsers) * 100).toFixed(1) : '0',
        adminPercentage: stats.totalTenantUsers > 0 ? ((stats.totalAdmins / stats.totalTenantUsers) * 100).toFixed(1) : '0',
        userPercentage: stats.totalTenantUsers > 0 ? ((stats.totalUsers / stats.totalTenantUsers) * 100).toFixed(1) : '0'
      },
      tenantBreakdown: stats.tenantStats.map(tenant => ({
        ...tenant,
        userDistribution: {
          superAdminPercent: tenant.totalTenantUsers > 0 ? ((tenant.superAdminCount / tenant.totalTenantUsers) * 100).toFixed(1) : '0',
          adminPercent: tenant.totalTenantUsers > 0 ? ((tenant.adminCount / tenant.totalTenantUsers) * 100).toFixed(1) : '0',
          userPercent: tenant.totalTenantUsers > 0 ? ((tenant.userCount / tenant.totalTenantUsers) * 100).toFixed(1) : '0'
        }
      }))
    };
  }
}

export const platformStatsService = new PlatformStatsService();
export default platformStatsService;