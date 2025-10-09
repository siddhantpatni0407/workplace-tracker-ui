// src/services/queryClient/index.ts
import { QueryClient } from '@tanstack/react-query';
import { ErrorHandler } from '../../utils/errorHandling/errorHandler';
import { ErrorType } from '../../utils/errorHandling/errorTypes';

/**
 * Global QueryClient configuration for React Query
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Disable automatic refetch when window regains focus
      retry: (failureCount, error) => {
        // Use improved error handling to determine retry logic
        const shouldRetry = ErrorHandler.shouldRetry(error);
        
        // Don't retry on authentication/authorization errors or client errors
        const errorType = ErrorHandler.getErrorType(error);
        if ([
          ErrorType.AUTHENTICATION_ERROR,
          ErrorType.AUTHORIZATION_ERROR,
          ErrorType.NOT_FOUND_ERROR,
          ErrorType.VALIDATION_ERROR
        ].includes(errorType)) {
          return false;
        }
        
        // Retry up to 3 times for retryable errors, 1 time for others
        const maxRetries = shouldRetry ? 3 : 1;
        return failureCount < maxRetries;
      },
      staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    },
    mutations: {
      // Empty onError handler - errors will be handled by the component using the mutation
      // This prevents default console errors
      // eslint-disable-next-line no-empty-function
      onError: () => {
        // Intentionally empty - errors handled by components
      },
      retry: (failureCount, error) => {
        // Similar retry logic for mutations
        const shouldRetry = ErrorHandler.shouldRetry(error);
        const errorType = ErrorHandler.getErrorType(error);
        
        if ([
          ErrorType.AUTHENTICATION_ERROR,
          ErrorType.AUTHORIZATION_ERROR,
          ErrorType.VALIDATION_ERROR
        ].includes(errorType)) {
          return false;
        }
        
        return shouldRetry && failureCount < 1; // Retry once for mutations
      },
    },
  },
});

/**
 * Helper function to extract user-friendly error message
 */
export const getErrorMessage = (error: unknown): string => {
  return ErrorHandler.getUserMessage(error);
};

/**
 * Helper function to get detailed error information
 */
export const getErrorInfo = (error: unknown) => {
  return ErrorHandler.processError(error);
};