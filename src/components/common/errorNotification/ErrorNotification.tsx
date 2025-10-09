// src/components/common/errorNotification/ErrorNotification.tsx

import React from 'react';
import { toast } from 'react-toastify';
import { ErrorHandler } from '../../../utils/errorHandling/errorHandler';
import { ErrorType, ERROR_MESSAGES } from '../../../utils/errorHandling/errorTypes';
import './ErrorNotification.css';

interface ErrorNotificationProps {
  error: unknown;
  onRetry?: () => void;
  onDismiss?: () => void;
  autoClose?: number;
}

export const ErrorNotification: React.FC<ErrorNotificationProps> = ({
  error,
  onRetry,
  onDismiss,
  autoClose = 8000
}) => {
  const errorInfo = ErrorHandler.processError(error);
  const errorConfig = ERROR_MESSAGES[errorInfo.type];
  
  const getIconForErrorType = (type: ErrorType): string => {
    switch (type) {
      case ErrorType.NETWORK_ERROR:
      case ErrorType.SERVICE_UNAVAILABLE:
        return 'bi-wifi-off';
      case ErrorType.AUTHENTICATION_ERROR:
        return 'bi-shield-lock';
      case ErrorType.AUTHORIZATION_ERROR:
        return 'bi-shield-x';
      case ErrorType.VALIDATION_ERROR:
        return 'bi-exclamation-circle';
      case ErrorType.SERVER_ERROR:
        return 'bi-server';
      case ErrorType.TIMEOUT_ERROR:
        return 'bi-clock';
      case ErrorType.NOT_FOUND_ERROR:
        return 'bi-search';
      default:
        return 'bi-exclamation-triangle';
    }
  };

  const getToastType = (type: ErrorType): 'error' | 'warning' | 'info' => {
    switch (type) {
      case ErrorType.VALIDATION_ERROR:
        return 'warning';
      case ErrorType.NETWORK_ERROR:
      case ErrorType.TIMEOUT_ERROR:
        return 'info';
      default:
        return 'error';
    }
  };

  return (
    <div className="error-notification">
      <div className="d-flex align-items-start">
        <div className="me-2 mt-1">
          <i className={`bi ${getIconForErrorType(errorInfo.type)} text-${
            getToastType(errorInfo.type) === 'error' ? 'danger' : 
            getToastType(errorInfo.type) === 'warning' ? 'warning' : 'info'
          }`}></i>
        </div>
        <div className="flex-grow-1">
          <div className="fw-bold">{errorConfig.title}</div>
          <div className="small">{errorInfo.userMessage}</div>
          {errorInfo.details?.isOnline === false && (
            <div className="small text-muted mt-1">
              <i className="bi bi-wifi-off me-1"></i>
              You appear to be offline
            </div>
          )}
        </div>
        <div className="ms-2">
          {onRetry && ErrorHandler.shouldRetry(error) && (
            <button 
              className="btn btn-sm btn-outline-primary me-1"
              onClick={onRetry}
              title={errorConfig.actionText}
            >
              <i className="bi bi-arrow-clockwise"></i>
            </button>
          )}
          {onDismiss && (
            <button 
              className="btn btn-sm btn-outline-secondary"
              onClick={onDismiss}
              title="Dismiss"
            >
              <i className="bi bi-x"></i>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper function to show error toast with improved styling
export const showErrorToast = (
  error: unknown, 
  onRetry?: () => void,
  options?: {
    autoClose?: number;
    position?: 'top-right' | 'top-center' | 'top-left' | 'bottom-right' | 'bottom-center' | 'bottom-left';
  }
) => {
  const errorInfo = ErrorHandler.processError(error);
  
  toast(
    <ErrorNotification 
      error={error} 
      onRetry={onRetry}
    />,
    {
      type: errorInfo.type === ErrorType.VALIDATION_ERROR ? 'warning' : 'error',
      autoClose: options?.autoClose ?? (ErrorHandler.shouldRetry(error) ? 10000 : 8000),
      closeOnClick: false,
      position: options?.position ?? 'top-right',
      hideProgressBar: false,
      pauseOnHover: true,
      draggable: true,
      className: `error-toast error-toast-${errorInfo.type.toLowerCase()}`,
    }
  );
};

// Helper function to show success toast
export const showSuccessToast = (message: string, options?: { autoClose?: number }) => {
  toast.success(
    <div className="d-flex align-items-center">
      <i className="bi bi-check-circle-fill me-2 text-success"></i>
      <span>{message}</span>
    </div>,
    {
      autoClose: options?.autoClose ?? 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    }
  );
};

// Helper function to show info toast
export const showInfoToast = (message: string, options?: { autoClose?: number }) => {
  toast.info(
    <div className="d-flex align-items-center">
      <i className="bi bi-info-circle-fill me-2 text-info"></i>
      <span>{message}</span>
    </div>,
    {
      autoClose: options?.autoClose ?? 6000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    }
  );
};