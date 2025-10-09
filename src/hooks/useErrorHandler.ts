// src/hooks/useErrorHandler.ts

import { useCallback } from 'react';
import { ErrorHandler } from '../utils/errorHandling/errorHandler';
import { showErrorToast } from '../components/common/errorNotification/ErrorNotification';
import { ErrorType } from '../utils/errorHandling/errorTypes';

interface UseErrorHandlerOptions {
  showToast?: boolean;
  onRetry?: () => void;
  onAuthError?: () => void;
  onNetworkError?: () => void;
}

export const useErrorHandler = (options: UseErrorHandlerOptions = {}) => {
  const {
    showToast = true,
    onRetry,
    onAuthError,
    onNetworkError,
  } = options;

  const handleError = useCallback((error: unknown) => {
    const errorInfo = ErrorHandler.processError(error);
    
    // Handle specific error types
    switch (errorInfo.type) {
      case ErrorType.AUTHENTICATION_ERROR:
        if (onAuthError) {
          onAuthError();
        } else {
          // Default: redirect to login
          localStorage.clear();
          window.location.href = '/login';
        }
        break;
        
      case ErrorType.NETWORK_ERROR:
      case ErrorType.SERVICE_UNAVAILABLE:
        if (onNetworkError) {
          onNetworkError();
        }
        break;
        
      default:
        // Handle other errors normally
        break;
    }
    
    // Show toast notification if enabled
    if (showToast) {
      showErrorToast(error, onRetry);
    }
    
    // Log error for debugging (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.error('Error handled by useErrorHandler:', {
        errorInfo,
        originalError: error
      });
    }
    
    return errorInfo;
  }, [showToast, onRetry, onAuthError, onNetworkError]);

  const getUserMessage = useCallback((error: unknown): string => {
    return ErrorHandler.getUserMessage(error);
  }, []);

  const shouldRetry = useCallback((error: unknown): boolean => {
    return ErrorHandler.shouldRetry(error);
  }, []);

  const isServiceUnavailable = useCallback((error: unknown): boolean => {
    return ErrorHandler.isServiceUnavailable(error);
  }, []);

  return {
    handleError,
    getUserMessage,
    shouldRetry,
    isServiceUnavailable,
    ErrorHandler,
  };
};