// src/services/queryClient/index.ts
import { QueryClient } from '@tanstack/react-query';
import { ApiError } from '../../models';

/**
 * Global QueryClient configuration for React Query
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Disable automatic refetch when window regains focus
      retry: (failureCount, error) => {
        // Don't retry on 401, 403, or 404 errors
        const err = error as unknown;
        
        // Define a proper type for error objects with a code property
        type ErrorWithCode = {
          code: string;
        };
        
        if (err && typeof err === 'object' && 'code' in err) {
          const code = (err as ErrorWithCode).code;
          if (
            code === 'UNAUTHORIZED' || 
            code === 'FORBIDDEN' ||
            code === 'NOT_FOUND'
          ) {
            return false;
          }
        }
        // Retry up to 2 times for other errors
        return failureCount < 2;
      },
      staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
    },
    mutations: {
      // Empty onError handler - errors will be handled by the component using the mutation
      // This prevents default console errors
            onError: () => {},
    },
  },
});

/**
 * Helper function to extract error message from various error formats
 */
export const getErrorMessage = (error: unknown): string => {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  // ApiError type
  if (error && typeof error === 'object' && 'message' in error) {
    return (error as ApiError).message || 'An error occurred';
  }
  
  return 'An unexpected error occurred';
};