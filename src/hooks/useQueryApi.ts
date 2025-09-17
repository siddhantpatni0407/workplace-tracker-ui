// src/hooks/useQueryApi.ts
import {
  useQuery,
  useMutation,
  UseQueryOptions,
  UseMutationOptions,
  QueryKey,
} from '@tanstack/react-query';
import { ApiResponse } from '../models';
import { queryClient, getErrorMessage } from '../services/queryClient';

/**
 * Custom hook for using React Query with our API structure
 * @param queryKey - Unique key for the query
 * @param queryFn - Function that returns a Promise with ApiResponse
 * @param options - Additional React Query options
 */
export const useQueryApi = <TData = any, TError = unknown>(
  queryKey: QueryKey,
  queryFn: () => Promise<ApiResponse<TData>>,
  options?: Omit<UseQueryOptions<TData, TError, TData, QueryKey>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<TData, TError, TData, QueryKey>({
    queryKey,
    queryFn: async () => {
      const response = await queryFn();
      
      if (response.status === 'SUCCESS' && response.data) {
        return response.data;
      }
      
      throw response.error || {
        message: response.message || 'Unknown error',
        code: 'UNKNOWN_ERROR'
      };
    },
    ...options,
  });
};

/**
 * Custom hook for mutations using React Query with our API structure
 * @param mutationFn - Function that returns a Promise with ApiResponse
 * @param options - Additional React Query options
 */
export const useMutationApi = <TData = any, TVariables = unknown, TError = unknown>(
  mutationFn: (variables: TVariables) => Promise<ApiResponse<TData>>,
  options?: Omit<UseMutationOptions<TData, TError, TVariables, unknown>, 'mutationFn'>
) => {
  return useMutation<TData, TError, TVariables>({
    mutationFn: async (variables) => {
      const response = await mutationFn(variables);
      
      if (response.status === 'SUCCESS' && response.data) {
        return response.data;
      }
      
      throw response.error || {
        message: response.message || 'Unknown error',
        code: 'UNKNOWN_ERROR'
      };
    },
    ...options,
  });
};

/**
 * Invalidate queries by key pattern
 * @param queryKey - Query key to invalidate
 */
export const invalidateQueries = (queryKey: QueryKey) => {
  return queryClient.invalidateQueries({ queryKey });
};

const QueryApiHelpers = {
  useQueryApi,
  useMutationApi,
  invalidateQueries,
  getErrorMessage,
};

export default QueryApiHelpers;