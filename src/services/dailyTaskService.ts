import axiosInstance from './axiosInstance';
import { ApiResponse } from '../models/Api';
import { API_ENDPOINTS } from '../constants/apiEndpoints';
import { ApiService } from './apiService';

// API Response Types
export interface DailyTaskApiResponse {
  dailyTaskId: number;
  userId: number;
  dailyTaskDate: string; // YYYY-MM-DD format
  taskNumber: string;
  projectCode?: string;
  projectName?: string;
  storyTaskBugNumber?: string;
  taskDetails?: string;
  remarks?: string;
  createdDate: string;
  modifiedDate: string;
}

export interface CreateDailyTaskRequest {
  userId: number;
  dailyTaskDate: string; // YYYY-MM-DD format
  projectCode?: string;
  projectName?: string;
  storyTaskBugNumber?: string;
  taskDetails?: string;
  remarks?: string;
}

export interface UpdateDailyTaskRequest {
  userId: number;
  dailyTaskDate: string;
  projectCode?: string;
  projectName?: string;
  storyTaskBugNumber?: string;
  taskDetails?: string;
  remarks?: string;
}

export const dailyTaskService = {
  // Create a new daily task
  createTask: async (taskData: CreateDailyTaskRequest): Promise<ApiResponse<DailyTaskApiResponse>> => {
    try {
      const response = await ApiService.post<ApiResponse<DailyTaskApiResponse>>(
        API_ENDPOINTS.DAILY_TASKS.CREATE,
        taskData,
        {
          requireAuth: true,
          showErrorToast: true
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('Error creating daily task:', error);
      throw error; // ApiService already handles error processing
    }
  },

  // Update an existing daily task
  updateTask: async (taskId: number, taskData: UpdateDailyTaskRequest): Promise<ApiResponse<DailyTaskApiResponse>> => {
    try {
      const response = await axiosInstance.put<ApiResponse<DailyTaskApiResponse>>(
        API_ENDPOINTS.DAILY_TASKS.UPDATE(taskId), 
        taskData
      );
      return response.data;
    } catch (error: any) {
      console.error('Error updating daily task:', error);
      throw new Error(error.response?.data?.message || 'Failed to update task');
    }
  },

  // Get a specific daily task by ID
  getTaskById: async (taskId: number): Promise<ApiResponse<DailyTaskApiResponse>> => {
    try {
      const response = await axiosInstance.get<ApiResponse<DailyTaskApiResponse>>(
        API_ENDPOINTS.DAILY_TASKS.GET_BY_ID(taskId)
      );
      return response.data;
    } catch (error: any) {
      console.error('Error fetching daily task:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch task');
    }
  },

  // Get all daily tasks for a user
  getTasksByUserId: async (userId: number): Promise<ApiResponse<DailyTaskApiResponse[]>> => {
    try {
      const response = await axiosInstance.get<ApiResponse<DailyTaskApiResponse[]>>(
        API_ENDPOINTS.DAILY_TASKS.GET_BY_USER(userId)
      );
      return response.data;
    } catch (error: any) {
      console.error('Error fetching user tasks:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch tasks');
    }
  },

  // Get daily tasks by date range
  getTasksByDateRange: async (
    userId: number, 
    startDate: string, 
    endDate: string
  ): Promise<ApiResponse<DailyTaskApiResponse[]>> => {
    try {
      const response = await axiosInstance.get<ApiResponse<DailyTaskApiResponse[]>>(
        API_ENDPOINTS.DAILY_TASKS.GET_BY_DATE_RANGE(userId, startDate, endDate)
      );
      return response.data;
    } catch (error: any) {
      console.error('Error fetching tasks by date range:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch tasks');
    }
  },

  // Get daily tasks for a specific date
  getTasksByDate: async (userId: number, date: string): Promise<ApiResponse<DailyTaskApiResponse[]>> => {
    try {
      const response = await axiosInstance.get<ApiResponse<DailyTaskApiResponse[]>>(
        API_ENDPOINTS.DAILY_TASKS.GET_BY_DATE(userId, date)
      );
      return response.data;
    } catch (error: any) {
      console.error('Error fetching tasks by date:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch tasks');
    }
  },

  // Delete a daily task
  deleteTask: async (taskId: number): Promise<ApiResponse<null>> => {
    try {
      const response = await axiosInstance.delete<ApiResponse<null>>(
        API_ENDPOINTS.DAILY_TASKS.DELETE(taskId)
      );
      return response.data;
    } catch (error: any) {
      console.error('Error deleting daily task:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete task');
    }
  },

  // Bulk delete daily tasks (using individual delete API calls)
  bulkDeleteTasks: async (taskIds: number[]): Promise<void> => {
    try {
      // Delete tasks individually since there's no bulk delete API
      const deletePromises = taskIds.map(taskId => dailyTaskService.deleteTask(taskId));
      await Promise.all(deletePromises);
    } catch (error: any) {
      console.error('Error bulk deleting tasks:', error);
      throw new Error('Failed to delete some tasks');
    }
  }
};

// Utility functions for date conversion
export const dateUtils = {
  // Convert from API date format (YYYY-MM-DD) to display format (DD-MM-YYYY)
  apiToDisplay: (apiDate: string): string => {
    const [year, month, day] = apiDate.split('-');
    return `${day}-${month}-${year}`;
  },

  // Convert from display format (DD-MM-YYYY) to API format (YYYY-MM-DD)
  displayToApi: (displayDate: string): string => {
    const [day, month, year] = displayDate.split('-');
    return `${year}-${month}-${day}`;
  },

  // Convert Date object to API format (YYYY-MM-DD)
  dateToApi: (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  // Get day name from date string (YYYY-MM-DD)
  getDayName: (apiDate: string): string => {
    const date = new Date(apiDate);
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  },

  // Get month start and end dates for filtering
  getMonthDateRange: (year: number, month: number): { startDate: string; endDate: string } => {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    return {
      startDate: dateUtils.dateToApi(startDate),
      endDate: dateUtils.dateToApi(endDate)
    };
  },

  // Get year start and end dates
  getYearDateRange: (year: number): { startDate: string; endDate: string } => {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);
    
    return {
      startDate: dateUtils.dateToApi(startDate),
      endDate: dateUtils.dateToApi(endDate)
    };
  }
};