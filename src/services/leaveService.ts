import axiosInstance from './axiosInstance';
import { API_ENDPOINTS } from '../constants/apiEndpoints';
import { UserLeaveBalanceDTO } from '../models/Leave';
import { ApiStatus } from '../enums/ApiEnums';
import { ApiResponse } from '../models/Api';

class LeaveService {
  // Get user leave balance (userId now extracted from token)
  async getUserLeaveBalance(): Promise<ApiResponse<UserLeaveBalanceDTO[]>> {
    try {
      // Use USER_LEAVES endpoint to get user's leave data
      const response = await axiosInstance.get(API_ENDPOINTS.USER_LEAVES.GET_BY_USER);
      return {
        status: ApiStatus.SUCCESS,
        data: response.data,
        message: 'Leave balance fetched successfully'
      };
    } catch (error) {
      console.error('Error fetching leave balance:', error);
      return {
        status: ApiStatus.ERROR,
        data: [],
        message: 'Failed to fetch leave balance'
      };
    }
  }

  // Get leave balance summary for dashboard (userId now extracted from token)
  async getLeaveBalanceSummary(): Promise<ApiResponse<{
    totalLeave: number;
    usedLeave: number;
    availableLeave: number;
    utilizationPercentage: number;
  }>> {
    try {
      const balanceResponse = await this.getUserLeaveBalance();
      
      if (balanceResponse.status === ApiStatus.ERROR) {
        throw new Error(balanceResponse.message);
      }

      const balances = balanceResponse.data || [];
      
      // Calculate totals across all leave types
      let totalLeave = 0;
      let usedLeave = 0;
      
      balances.forEach(balance => {
        totalLeave += balance.allocatedDays || 0;
        usedLeave += balance.usedDays || 0;
      });

      const availableLeave = totalLeave - usedLeave;
      const utilizationPercentage = totalLeave > 0 ? Math.round((usedLeave / totalLeave) * 100) : 0;

      return {
        status: ApiStatus.SUCCESS,
        data: {
          totalLeave,
          usedLeave,
          availableLeave,
          utilizationPercentage
        },
        message: 'Leave balance summary calculated successfully'
      };
    } catch (error) {
      console.error('Error calculating leave balance summary:', error);
      return {
        status: ApiStatus.ERROR,
        data: {
          totalLeave: 0,
          usedLeave: 0,
          availableLeave: 0,
          utilizationPercentage: 0
        },
        message: 'Failed to calculate leave balance summary'
      };
    }
  }

  // Get recent leave applications (userId now extracted from token)
  async getRecentLeaveApplications(limit: number = 5): Promise<ApiResponse<any[]>> {
    try {
      const params = new URLSearchParams();
      params.append('limit', limit.toString());
      params.append('sortBy', 'createdAt');
      params.append('sortOrder', 'DESC');

      // Use USER_LEAVES endpoint to get leave applications data
      const response = await axiosInstance.get(`${API_ENDPOINTS.USER_LEAVES.GET_BY_USER}?${params}`);
      return {
        status: ApiStatus.SUCCESS,
        data: response.data.slice(0, limit),
        message: 'Recent leave applications fetched successfully'
      };
    } catch (error) {
      console.error('Error fetching recent leave applications:', error);
      return {
        status: ApiStatus.ERROR,
        data: [],
        message: 'Failed to fetch recent leave applications'
      };
    }
  }
}

export const leaveService = new LeaveService();
export default leaveService;