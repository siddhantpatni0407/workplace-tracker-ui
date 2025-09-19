import axiosInstance from './axiosInstance';
import { API_ENDPOINTS } from '../constants/apiEndpoints';
import { OfficeVisit, OfficeVisitDTO, DailyViewDTO } from '../models/OfficeVisit';
import { ApiStatus } from '../enums/ApiEnums';
import { ApiResponse } from '../models/Api';

class OfficeVisitService {
  // Get office visits for a user
  async getVisitsByUser(userId: number, year?: number, month?: number): Promise<ApiResponse<OfficeVisit[]>> {
    try {
      const params = new URLSearchParams();
      params.append('userId', userId.toString());
      if (year) params.append('year', year.toString());
      if (month) params.append('month', month.toString());

      const response = await axiosInstance.get(`${API_ENDPOINTS.VISITS.LIST}?${params}`);
      return {
        status: ApiStatus.SUCCESS,
        data: response.data,
        message: 'Office visits fetched successfully'
      };
    } catch (error) {
      console.error('Error fetching office visits:', error);
      return {
        status: ApiStatus.ERROR,
        data: [],
        message: 'Failed to fetch office visits'
      };
    }
  }

  // Get visits summary/analytics for dashboard
  async getVisitsSummary(userId: number): Promise<ApiResponse<{
    totalVisits: number;
    currentMonthVisits: number;
    attendancePercentage: number;
    lastVisitDate?: string;
  }>> {
    try {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;

      // Get current month visits
      const visitsResponse = await this.getVisitsByUser(userId, currentYear, currentMonth);
      
      if (visitsResponse.status === ApiStatus.ERROR) {
        throw new Error(visitsResponse.message);
      }

      const visits = visitsResponse.data || [];
      const totalVisits = visits.length;
      
      // Calculate office attendance percentage based on WFO (Work From Office) visits only
      // WFH, HYBRID, and OTHERS should not count as office attendance
      const officeVisits = visits.filter((visit: any) => visit.visitType === 'WFO').length;
      const workingDaysInMonth = 22;
      const attendancePercentage = Math.round((officeVisits / workingDaysInMonth) * 100);

      // Get last visit date
      const lastVisit = visits.sort((a, b) => 
        new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime()
      )[0];

      return {
        status: ApiStatus.SUCCESS,
        data: {
          totalVisits,
          currentMonthVisits: totalVisits,
          attendancePercentage: Math.min(attendancePercentage, 100),
          lastVisitDate: lastVisit?.visitDate
        },
        message: 'Visits summary fetched successfully'
      };
    } catch (error) {
      console.error('Error fetching visits summary:', error);
      return {
        status: ApiStatus.ERROR,
        data: {
          totalVisits: 0,
          currentMonthVisits: 0,
          attendancePercentage: 0
        },
        message: 'Failed to fetch visits summary'
      };
    }
  }

  // Get daily view records
  async getDailyViewRecords(
    userId: number, 
    year?: number, 
    month?: number
  ): Promise<ApiResponse<DailyViewDTO[]>> {
    try {
      const params = new URLSearchParams();
      params.append('userId', userId.toString());
      if (year) params.append('year', year.toString());
      if (month) params.append('month', month.toString());

      const response = await axiosInstance.get(`${API_ENDPOINTS.DAILY_VIEW.FETCH}?${params}`);
      return {
        status: ApiStatus.SUCCESS,
        data: response.data,
        message: 'Daily view records fetched successfully'
      };
    } catch (error) {
      console.error('Error fetching daily view records:', error);
      return {
        status: ApiStatus.ERROR,
        data: [],
        message: 'Failed to fetch daily view records'
      };
    }
  }

  // Create or update office visit
  async upsertVisit(visitData: OfficeVisitDTO): Promise<ApiResponse<OfficeVisit>> {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.VISITS.UPSERT, visitData);
      return {
        status: ApiStatus.SUCCESS,
        data: response.data,
        message: 'Office visit logged successfully'
      };
    } catch (error) {
      console.error('Error logging office visit:', error);
      return {
        status: ApiStatus.ERROR,
        data: undefined,
        message: 'Failed to log office visit'
      };
    }
  }
}

export const officeVisitService = new OfficeVisitService();
export default officeVisitService;