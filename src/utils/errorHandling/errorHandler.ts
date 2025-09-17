// src/utils/errorHandling/errorHandler.ts
import { ApiError } from '../../models';

// Generic error handling function
export const handleError = (error: unknown): ApiError => {
  if (isApiError(error)) {
    return error;
  }

  if (error instanceof Error) {
    return {
      code: 'CLIENT_ERROR',
      message: error.message,
      details: error.stack
    };
  }

  return {
    code: 'UNKNOWN_ERROR',
    message: 'An unexpected error occurred',
    details: String(error)
  };
};

// Type guard for ApiError
export const isApiError = (error: unknown): error is ApiError => {
  return (
    error !== null &&
    typeof error === 'object' &&
    'code' in error &&
    'message' in error
  );
};

// Categorize errors for appropriate handling
export const categorizeError = (error: ApiError): 'auth' | 'network' | 'validation' | 'server' | 'unknown' => {
  const { code } = error;
  
  if (code === 'UNAUTHORIZED' || code === 'FORBIDDEN' || code === 'TOKEN_EXPIRED') {
    return 'auth';
  }
  
  if (code === 'NETWORK_ERROR' || code === 'TIMEOUT') {
    return 'network';
  }
  
  if (code === 'VALIDATION_ERROR' || code === 'BAD_REQUEST') {
    return 'validation';
  }
  
  if (code.startsWith('SERVER_') || code === 'INTERNAL_ERROR') {
    return 'server';
  }
  
  return 'unknown';
};

// Format error message for display
export const formatErrorMessage = (error: ApiError): string => {
  const category = categorizeError(error);
  
  switch (category) {
    case 'auth':
      return 'Authentication error: Please login again.';
    case 'network':
      return 'Network error: Please check your internet connection.';
    case 'validation':
      return `Validation error: ${error.message}`;
    case 'server':
      return 'Server error: Our team has been notified.';
    default:
      return error.message || 'An unknown error occurred';
  }
};