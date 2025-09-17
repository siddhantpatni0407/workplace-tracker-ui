// src/services/queryClient/queries/userQueries.ts
import { userService, BackendUser } from '../../userService';
import { useQueryApi, useMutationApi } from '../../../hooks/useQueryApi';
import { ApiResponse } from '../../../models';

// Query keys for user-related queries
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters: string) => [...userKeys.lists(), { filters }] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: number) => [...userKeys.details(), id] as const,
};

/**
 * Hook for fetching all users
 */
export const useUsers = () => {
  return useQueryApi<BackendUser[]>(
    userKeys.lists(),
    async () => {
      const response = await userService.getAll();
      return response as ApiResponse<BackendUser[]>;
    }
  );
};

/**
 * Hook for updating a user's active status
 */
export const useUpdateUserActiveStatus = () => {
  return useMutationApi<{ success: boolean }, { id: number; isActive: boolean }>(
    async ({ id, isActive }) => {
      const response = await userService.updateActive(id, isActive);
      return {
        status: response.success ? 'SUCCESS' : 'FAILED',
        data: response
      } as ApiResponse<{ success: boolean }>;
    }
  );
};

/**
 * Hook for updating a user's lock status
 */
export const useUpdateUserLockStatus = () => {
  return useMutationApi<{ success: boolean }, { id: number; isAccountLocked: boolean }>(
    async ({ id, isAccountLocked }) => {
      const response = await userService.updateLock(id, isAccountLocked);
      return {
        status: response.success ? 'SUCCESS' : 'FAILED',
        data: response
      } as ApiResponse<{ success: boolean }>;
    }
  );
};