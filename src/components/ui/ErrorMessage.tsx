// src/components/ui/ErrorMessage.tsx
import React from 'react';
import { ApiError } from '../../models';

export interface ErrorMessageProps {
  error?: string | Error | ApiError | null;
  variant?: 'danger' | 'warning' | 'info';
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
  showRetry?: boolean;
  onRetry?: () => void;
  retryLabel?: string;
}

/**
 * Reusable error message component
 */
export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  error,
  variant = 'danger',
  dismissible = false,
  onDismiss,
  className = '',
  showRetry = false,
  onRetry,
  retryLabel = 'Try Again'
}) => {
  if (!error) return null;

  const getErrorMessage = (): string => {
    if (typeof error === 'string') {
      return error;
    }
    
    if (error instanceof Error) {
      return error.message;
    }
    
    // ApiError
    if (error && typeof error === 'object' && 'message' in error) {
      return error.message || 'An error occurred';
    }
    
    return 'An unexpected error occurred';
  };

  const getErrorCode = (): string | undefined => {
    if (error && typeof error === 'object' && 'code' in error) {
      return (error as ApiError).code;
    }
    return undefined;
  };

  const alertClasses = [
    'alert',
    `alert-${variant}`,
    dismissible && 'alert-dismissible',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={alertClasses} role="alert">
      <div className="d-flex align-items-start">
        <div className="flex-grow-1">
          <div className="fw-medium mb-1">
            {variant === 'danger' && <i className="bi bi-exclamation-triangle me-2" />}
            {variant === 'warning' && <i className="bi bi-exclamation-circle me-2" />}
            {variant === 'info' && <i className="bi bi-info-circle me-2" />}
            Error
          </div>
          <div className="mb-0">{getErrorMessage()}</div>
          
          {process.env.NODE_ENV === 'development' && getErrorCode() && (
            <small className="text-muted">Code: {getErrorCode()}</small>
          )}
        </div>
        
        <div className="flex-shrink-0 ms-3">
          {showRetry && onRetry && (
            <button
              type="button"
              className={`btn btn-sm btn-outline-${variant} me-2`}
              onClick={onRetry}
            >
              <i className="bi bi-arrow-clockwise me-1" />
              {retryLabel}
            </button>
          )}
          
          {dismissible && onDismiss && (
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={onDismiss}
            />
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Inline error message (smaller, no dismiss)
 */
export const InlineError: React.FC<Pick<ErrorMessageProps, 'error' | 'className'>> = ({
  error,
  className = ''
}) => {
  if (!error) return null;

  const message = typeof error === 'string' ? error : 
                  error instanceof Error ? error.message :
                  (error as any)?.message || 'An error occurred';

  return (
    <div className={`text-danger small mt-1 ${className}`}>
      <i className="bi bi-exclamation-circle me-1" />
      {message}
    </div>
  );
};

/**
 * Form field error message
 */
export const FieldError: React.FC<{ error?: string; touched?: boolean }> = ({
  error,
  touched = true
}) => {
  if (!error || !touched) return null;

  return (
    <div className="invalid-feedback d-block">
      {error}
    </div>
  );
};

/**
 * API error handler component
 */
export const ApiErrorMessage: React.FC<{
  error?: ApiError | null;
  onRetry?: () => void;
  showRetry?: boolean;
}> = ({ error, onRetry, showRetry = true }) => {
  if (!error) return null;

  return (
    <ErrorMessage
      error={error}
      variant="danger"
      showRetry={showRetry}
      onRetry={onRetry}
      dismissible={false}
    />
  );
};

export default ErrorMessage;
