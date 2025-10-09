// src/utils/errorHandling/errorHandler.ts

import { AxiosError } from 'axios';
import { ApiError } from '../../models';
import { ErrorType, ErrorInfo, ERROR_MESSAGES, NetworkErrorDetails } from './errorTypes';

// Type definitions for API error responses
interface ApiErrorResponse {
  message?: string;
  error?: string;
  details?: string;
  code?: string;
  status?: string;
}

/**
 * Comprehensive error handler that categorizes and formats errors
 */
export class ErrorHandler {
  /**
   * Process and categorize an error from various sources
   */
  static processError(error: unknown): ErrorInfo {
    const timestamp = new Date().toISOString();
    
    // Handle Axios errors
    if (this.isAxiosError(error)) {
      return this.processAxiosError(error, timestamp);
    }
    
    // Handle standard JavaScript errors
    if (error instanceof Error) {
      return this.processJavaScriptError(error, timestamp);
    }
    
    // Handle API response errors (objects with error structure)
    if (this.isApiError(error)) {
      return this.processApiError(error, timestamp);
    }
    
    // Handle string errors
    if (typeof error === 'string') {
      return {
        type: ErrorType.UNKNOWN_ERROR,
        message: error,
        userMessage: ERROR_MESSAGES[ErrorType.UNKNOWN_ERROR].message,
        timestamp
      };
    }
    
    // Fallback for unknown error types
    return {
      type: ErrorType.UNKNOWN_ERROR,
      message: 'An unknown error occurred',
      userMessage: ERROR_MESSAGES[ErrorType.UNKNOWN_ERROR].message,
      timestamp
    };
  }
  
  /**
   * Process Axios errors with detailed network error handling
   */
  private static processAxiosError(error: AxiosError, timestamp: string): ErrorInfo {
    const response = error.response;
    const request = error.request;
    
    // Network error (no response received)
    if (!response && request) {
      const networkDetails: NetworkErrorDetails = {
        isOnline: navigator.onLine,
        url: error.config?.url,
        method: error.config?.method?.toUpperCase(),
        timeout: error.config?.timeout
      };
      
      // Distinguish between different network error types
      if (error.code === 'ECONNREFUSED' || error.message.includes('ECONNREFUSED')) {
        return {
          type: ErrorType.SERVICE_UNAVAILABLE,
          message: 'Connection refused by server',
          userMessage: ERROR_MESSAGES[ErrorType.SERVICE_UNAVAILABLE].message,
          details: networkDetails,
          timestamp
        };
      }
      
      if (error.code === 'ETIMEDOUT' || error.message.includes('timeout')) {
        return {
          type: ErrorType.TIMEOUT_ERROR,
          message: 'Request timeout',
          userMessage: ERROR_MESSAGES[ErrorType.TIMEOUT_ERROR].message,
          details: networkDetails,
          timestamp
        };
      }
      
      return {
        type: ErrorType.NETWORK_ERROR,
        message: error.message || 'Network error',
        userMessage: networkDetails.isOnline 
          ? 'Unable to connect to the server. The service may be temporarily unavailable.'
          : 'No internet connection. Please check your network settings.',
        details: networkDetails,
        timestamp
      };
    }
    
    // Server responded with error status
    if (response) {
      const statusCode = response.status;
      const responseData = response.data;
      
      // Extract error message from response
      let errorMessage = 'An error occurred';
      if (typeof responseData === 'object' && responseData !== null) {
        const data = responseData as ApiErrorResponse;
        errorMessage = data.message || data.error || data.details || errorMessage;
      }
      
      switch (statusCode) {
        case 400:
          return {
            type: ErrorType.VALIDATION_ERROR,
            message: errorMessage,
            userMessage: ERROR_MESSAGES[ErrorType.VALIDATION_ERROR].message,
            statusCode,
            details: responseData,
            timestamp
          };
          
        case 401:
          return {
            type: ErrorType.AUTHENTICATION_ERROR,
            message: errorMessage,
            userMessage: ERROR_MESSAGES[ErrorType.AUTHENTICATION_ERROR].message,
            statusCode,
            timestamp
          };
          
        case 403:
          return {
            type: ErrorType.AUTHORIZATION_ERROR,
            message: errorMessage,
            userMessage: ERROR_MESSAGES[ErrorType.AUTHORIZATION_ERROR].message,
            statusCode,
            timestamp
          };
          
        case 404:
          return {
            type: ErrorType.NOT_FOUND_ERROR,
            message: errorMessage,
            userMessage: ERROR_MESSAGES[ErrorType.NOT_FOUND_ERROR].message,
            statusCode,
            timestamp
          };
          
        case 408:
          return {
            type: ErrorType.TIMEOUT_ERROR,
            message: errorMessage,
            userMessage: ERROR_MESSAGES[ErrorType.TIMEOUT_ERROR].message,
            statusCode,
            timestamp
          };
          
        case 500:
        case 502:
        case 503:
        case 504:
          return {
            type: ErrorType.SERVER_ERROR,
            message: errorMessage,
            userMessage: statusCode === 503 
              ? ERROR_MESSAGES[ErrorType.SERVICE_UNAVAILABLE].message 
              : ERROR_MESSAGES[ErrorType.SERVER_ERROR].message,
            statusCode,
            timestamp
          };
          
        default:
          if (statusCode >= 400 && statusCode < 500) {
            return {
              type: ErrorType.CLIENT_ERROR,
              message: errorMessage,
              userMessage: 'There was a problem with your request. Please try again.',
              statusCode,
              timestamp
            };
          } else {
            return {
              type: ErrorType.SERVER_ERROR,
              message: errorMessage,
              userMessage: ERROR_MESSAGES[ErrorType.SERVER_ERROR].message,
              statusCode,
              timestamp
            };
          }
      }
    }
    
    // Request setup error
    return {
      type: ErrorType.UNKNOWN_ERROR,
      message: error.message || 'Request setup error',
      userMessage: ERROR_MESSAGES[ErrorType.UNKNOWN_ERROR].message,
      timestamp
    };
  }
  
  /**
   * Process standard JavaScript errors
   */
  private static processJavaScriptError(error: Error, timestamp: string): ErrorInfo {
    if (error.name === 'TypeError') {
      return {
        type: ErrorType.CLIENT_ERROR,
        message: error.message,
        userMessage: 'A technical error occurred. Please refresh the page and try again.',
        timestamp
      };
    }
    
    return {
      type: ErrorType.UNKNOWN_ERROR,
      message: error.message,
      userMessage: ERROR_MESSAGES[ErrorType.UNKNOWN_ERROR].message,
      timestamp
    };
  }
  
  /**
   * Process API response errors (structured error objects)
   */
  private static processApiError(error: ApiErrorResponse, timestamp: string): ErrorInfo {
    const status = error.status || error.code;
    const message = error.message || 'API error';
    
    if (status === 'FAILED' || status === 'ERROR') {
      return {
        type: ErrorType.SERVER_ERROR,
        message,
        userMessage: ERROR_MESSAGES[ErrorType.SERVER_ERROR].message,
        details: error,
        timestamp
      };
    }
    
    return {
      type: ErrorType.UNKNOWN_ERROR,
      message,
      userMessage: ERROR_MESSAGES[ErrorType.UNKNOWN_ERROR].message,
      timestamp
    };
  }
  
  /**
   * Check if error is an Axios error
   */
  private static isAxiosError(error: unknown): error is AxiosError {
    return error !== null && typeof error === 'object' && 'isAxiosError' in error;
  }
  
  /**
   * Check if error is a structured API error
   */
  private static isApiError(error: unknown): error is ApiErrorResponse {
    return error !== null && typeof error === 'object' && 
           (('status' in error || 'code' in error) && ('message' in error || 'error' in error));
  }
  
  /**
   * Get user-friendly error message
   */
  static getUserMessage(error: unknown): string {
    return this.processError(error).userMessage;
  }
  
  /**
   * Get error type
   */
  static getErrorType(error: unknown): ErrorType {
    return this.processError(error).type;
  }
  
  /**
   * Check if error should trigger a retry
   */
  static shouldRetry(error: unknown): boolean {
    const errorInfo = this.processError(error);
    return [
      ErrorType.NETWORK_ERROR,
      ErrorType.TIMEOUT_ERROR,
      ErrorType.SERVER_ERROR,
      ErrorType.SERVICE_UNAVAILABLE
    ].includes(errorInfo.type);
  }
  
  /**
   * Check if error indicates service is unavailable
   */
  static isServiceUnavailable(error: unknown): boolean {
    const errorInfo = this.processError(error);
    return [
      ErrorType.SERVICE_UNAVAILABLE,
      ErrorType.NETWORK_ERROR
    ].includes(errorInfo.type);
  }
}

// Legacy functions for backward compatibility
export const handleError = (error: unknown): ApiError => {
  const errorInfo = ErrorHandler.processError(error);
  
  return {
    code: errorInfo.type,
    message: errorInfo.message,
    details: errorInfo.details
  };
};

export const isApiError = (error: unknown): error is ApiError => {
  return (
    error !== null &&
    typeof error === 'object' &&
    'code' in error &&
    'message' in error
  );
};

export const categorizeError = (error: ApiError): 'auth' | 'network' | 'validation' | 'server' | 'unknown' => {
  const { code } = error;
  
  if (code === 'UNAUTHORIZED' || code === 'FORBIDDEN' || code === 'TOKEN_EXPIRED' || code === ErrorType.AUTHENTICATION_ERROR) {
    return 'auth';
  }
  
  if (code === 'NETWORK_ERROR' || code === 'TIMEOUT' || code === ErrorType.NETWORK_ERROR || code === ErrorType.TIMEOUT_ERROR) {
    return 'network';
  }
  
  if (code === 'VALIDATION_ERROR' || code === 'BAD_REQUEST' || code === ErrorType.VALIDATION_ERROR) {
    return 'validation';
  }
  
  if (code.startsWith('SERVER_') || code === 'INTERNAL_ERROR' || code === ErrorType.SERVER_ERROR) {
    return 'server';
  }
  
  return 'unknown';
};

export const formatErrorMessage = (error: ApiError): string => {
  const category = categorizeError(error);
  
  switch (category) {
    case 'auth':
      return 'Authentication error: Please login again.';
    case 'network':
      return 'Unable to connect to the server. Please check your internet connection and try again.';
    case 'validation':
      return `Validation error: ${error.message}`;
    case 'server':
      return 'Something went wrong on our end. Please try again in a few moments.';
    default:
      return error.message || 'An unknown error occurred';
  }
};