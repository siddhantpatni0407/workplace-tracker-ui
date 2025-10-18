// src/services/specialDaysService.ts
import axiosInstance from './axiosInstance';
import { API_ENDPOINTS } from '../constants/apiEndpoints';
import { SpecialDaysResponse, SpecialDaysRequestParams } from '../types/api';

/**
 * Service for managing special days (birthdays and work anniversaries)
 */
export class SpecialDaysService {
  /**
   * Fetch all special days with optional filtering and pagination
   * @param params - Request parameters for filtering and pagination
   * @returns Promise resolving to special days response
   */
  static async getSpecialDays(params: SpecialDaysRequestParams = {}): Promise<SpecialDaysResponse> {
    try {
      // Set default parameters
      const defaultParams: SpecialDaysRequestParams = {
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        page: 1,
        limit: 10,
        ...params
      };

      // Build query string
      const queryParams = new URLSearchParams();
      
      if (defaultParams.month) queryParams.append('month', defaultParams.month.toString());
      if (defaultParams.year) queryParams.append('year', defaultParams.year.toString());
      if (defaultParams.page) queryParams.append('page', defaultParams.page.toString());
      if (defaultParams.limit) queryParams.append('limit', defaultParams.limit.toString());

      const url = `${API_ENDPOINTS.SPECIAL_DAYS.GET_ALL}?${queryParams.toString()}`;
      
      const response = await axiosInstance.get<SpecialDaysResponse>(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching special days:', error);
      throw error;
    }
  }

  /**
   * Fetch current month special days for dashboard
   * @param params - Optional parameters for current month query
   * @returns Promise resolving to current month's special days
   */
  static async getCurrentMonthSpecialDays(params: { month?: number; year?: number; limit?: number } = {}): Promise<SpecialDaysResponse> {
    try {
      const defaultParams = {
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        limit: 5,
        ...params
      };

      const queryParams = new URLSearchParams();
      queryParams.append('month', defaultParams.month.toString());
      queryParams.append('year', defaultParams.year.toString());
      queryParams.append('limit', defaultParams.limit.toString());

      const url = `${API_ENDPOINTS.SPECIAL_DAYS.CURRENT_MONTH}?${queryParams.toString()}`;
      const response = await axiosInstance.get<SpecialDaysResponse>(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching current month special days:', error);
      throw error;
    }
  }

  /**
   * Fetch employee birthdays
   * @param params - Parameters for birthday query
   * @returns Promise resolving to birthdays
   */
  static async getBirthdays(params: { month?: number; year?: number; page?: number; limit?: number } = {}): Promise<SpecialDaysResponse> {
    try {
      const defaultParams = {
        year: new Date().getFullYear(),
        page: 1,
        limit: 8,
        ...params
      };

      const queryParams = new URLSearchParams();
      if (defaultParams.month) queryParams.append('month', defaultParams.month.toString());
      queryParams.append('year', defaultParams.year.toString());
      if (defaultParams.page) queryParams.append('page', defaultParams.page.toString());
      if (defaultParams.limit) queryParams.append('limit', defaultParams.limit.toString());

      const url = `${API_ENDPOINTS.SPECIAL_DAYS.BIRTHDAYS}?${queryParams.toString()}`;
      
      const response = await axiosInstance.get<SpecialDaysResponse>(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching birthdays:', error);
      throw error;
    }
  }

  /**
   * Fetch work anniversaries
   * @param params - Parameters for anniversary query
   * @returns Promise resolving to work anniversaries
   */
  static async getAnniversaries(params: { month?: number; year?: number; page?: number; limit?: number } = {}): Promise<SpecialDaysResponse> {
    try {
      const defaultParams = {
        year: new Date().getFullYear(),
        page: 1,
        limit: 8,
        ...params
      };

      const queryParams = new URLSearchParams();
      if (defaultParams.month) queryParams.append('month', defaultParams.month.toString());
      queryParams.append('year', defaultParams.year.toString());
      if (defaultParams.page) queryParams.append('page', defaultParams.page.toString());
      if (defaultParams.limit) queryParams.append('limit', defaultParams.limit.toString());

      const url = `${API_ENDPOINTS.SPECIAL_DAYS.ANNIVERSARIES}?${queryParams.toString()}`;
      
      const response = await axiosInstance.get<SpecialDaysResponse>(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching anniversaries:', error);
      throw error;
    }
  }
}

export default SpecialDaysService;