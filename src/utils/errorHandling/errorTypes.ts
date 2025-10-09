// src/utils/errorHandling/errorTypes.ts

export enum ErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  CLIENT_ERROR = 'CLIENT_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE'
}

export interface ErrorInfo {
  type: ErrorType;
  message: string;
  userMessage: string;
  statusCode?: number;
  details?: any;
  timestamp: string;
}

export interface NetworkErrorDetails {
  isOnline: boolean;
  url?: string;
  method?: string;
  timeout?: number;
}

export const ERROR_MESSAGES = {
  [ErrorType.NETWORK_ERROR]: {
    title: 'Connection Problem',
    message: 'Unable to connect to the server. Please check your internet connection and try again.',
    actionText: 'Retry'
  },
  [ErrorType.SERVER_ERROR]: {
    title: 'Server Error',
    message: 'Something went wrong on our end. Please try again in a few moments.',
    actionText: 'Try Again'
  },
  [ErrorType.CLIENT_ERROR]: {
    title: 'Request Error',
    message: 'There was a problem with your request. Please try again.',
    actionText: 'Try Again'
  },
  [ErrorType.SERVICE_UNAVAILABLE]: {
    title: 'Service Temporarily Unavailable',
    message: 'The service is temporarily down for maintenance. Please try again later.',
    actionText: 'Retry Later'
  },
  [ErrorType.AUTHENTICATION_ERROR]: {
    title: 'Authentication Required',
    message: 'Your session has expired. Please log in again.',
    actionText: 'Log In'
  },
  [ErrorType.AUTHORIZATION_ERROR]: {
    title: 'Access Denied',
    message: 'You do not have permission to access this resource.',
    actionText: 'Go Back'
  },
  [ErrorType.VALIDATION_ERROR]: {
    title: 'Invalid Input',
    message: 'Please check your input and try again.',
    actionText: 'Fix Input'
  },
  [ErrorType.NOT_FOUND_ERROR]: {
    title: 'Not Found',
    message: 'The requested resource could not be found.',
    actionText: 'Go Back'
  },
  [ErrorType.TIMEOUT_ERROR]: {
    title: 'Request Timeout',
    message: 'The request took too long to complete. Please try again.',
    actionText: 'Try Again'
  },
  [ErrorType.UNKNOWN_ERROR]: {
    title: 'Unexpected Error',
    message: 'An unexpected error occurred. Please try again.',
    actionText: 'Retry'
  }
};