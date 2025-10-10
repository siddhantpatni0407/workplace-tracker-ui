// src/hooks/useDashboardData.ts
import { useQuery } from '@tanstack/react-query';
import { dashboardService, DashboardStats } from '../services/userDashboardService';
import { officeVisitService } from '../services/officeVisitService';
import { leaveService } from '../services/leaveService';
import { taskService } from '../services/taskService';
import { noteService } from '../services/noteService';
import holidayService from '../services/holidayService';
import { useAuth } from '../context/AuthContext';
import { NoteSortBy, NoteSortOrder } from '../enums/NoteEnums';

// Query keys
export const dashboardKeys = {
  all: ['dashboard'] as const,
  stats: (userId: number) => [...dashboardKeys.all, 'stats', userId] as const,
  officeVisits: (userId: number) => [...dashboardKeys.all, 'office-visits', userId] as const,
  leaveBalance: (userId: number) => [...dashboardKeys.all, 'leave-balance', userId] as const,
  tasks: (userId: number) => [...dashboardKeys.all, 'tasks', userId] as const,
  notes: (userId: number) => [...dashboardKeys.all, 'notes', userId] as const,
  holidays: () => [...dashboardKeys.all, 'holidays'] as const,
};

// Main dashboard data hook
export const useDashboardData = () => {
  const { user } = useAuth();
  const userId = user?.userId;

  return useQuery({
    queryKey: dashboardKeys.stats(userId || 0),
    queryFn: async () => {
      if (!userId) throw new Error('User not authenticated');
      const response = await dashboardService.getDashboardData(userId);
      if (response.status === 'ERROR') {
        throw new Error(response.message);
      }
      return response.data;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
  });
};

// Office visits data hook
export const useOfficeVisitsData = () => {
  const { user } = useAuth();
  const userId = user?.userId;

  return useQuery({
    queryKey: dashboardKeys.officeVisits(userId || 0),
    queryFn: async () => {
      if (!userId) throw new Error('User not authenticated');
      const response = await officeVisitService.getVisitsSummary(userId);
      if (response.status === 'ERROR') {
        throw new Error(response.message);
      }
      return response.data;
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};

// Leave balance data hook
export const useLeaveBalanceData = () => {
  const { user } = useAuth();
  const userId = user?.userId;

  return useQuery({
    queryKey: dashboardKeys.leaveBalance(userId || 0),
    queryFn: async () => {
      if (!userId) throw new Error('User not authenticated');
      const response = await leaveService.getLeaveBalanceSummary();
      if (response.status === 'ERROR') {
        throw new Error(response.message);
      }
      return response.data;
    },
    enabled: !!userId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: 30 * 60 * 1000, // Refetch every 30 minutes
  });
};

// Tasks data hook
export const useTasksData = () => {
  const { user } = useAuth();
  const userId = user?.userId;

  return useQuery({
    queryKey: dashboardKeys.tasks(userId || 0),
    queryFn: async () => {
      if (!userId) throw new Error('User not authenticated');
      const response = await taskService.getTasksByUser(userId, {
        limit: 50,
        sortBy: 'updatedAt',
        sortOrder: 'DESC'
      });
      if (response.status === 'ERROR') {
        throw new Error(response.message);
      }
      return response.data;
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};

// Notes data hook
export const useNotesData = () => {
  const { user } = useAuth();
  const userId = user?.userId;

  return useQuery({
    queryKey: dashboardKeys.notes(userId || 0),
    queryFn: async () => {
      if (!userId) throw new Error('User not authenticated');
      const response = await noteService.getNotesByUser(userId, {
        limit: 20,
        sortBy: NoteSortBy.MODIFIED_DATE,
        sortOrder: NoteSortOrder.DESC
      });
      if (response.status === 'ERROR') {
        throw new Error(response.message);
      }
      return response.data;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
  });
};

// Holidays data hook
export const useHolidaysData = () => {
  return useQuery({
    queryKey: dashboardKeys.holidays(),
    queryFn: async () => {
      const response = await holidayService.getHolidays();
      return response || [];
    },
    staleTime: 60 * 60 * 1000, // 1 hour
    refetchInterval: 24 * 60 * 60 * 1000, // Refetch daily
  });
};

// Recent leave applications hook
export const useRecentLeaveApplications = () => {
  const { user } = useAuth();
  const userId = user?.userId;

  return useQuery({
    queryKey: [...dashboardKeys.leaveBalance(userId || 0), 'applications'],
    queryFn: async () => {
      if (!userId) throw new Error('User not authenticated');
      const response = await leaveService.getRecentLeaveApplications(5);
      if (response.status === 'ERROR') {
        throw new Error(response.message);
      }
      return response.data;
    },
    enabled: !!userId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: 30 * 60 * 1000, // Refetch every 30 minutes
  });
};