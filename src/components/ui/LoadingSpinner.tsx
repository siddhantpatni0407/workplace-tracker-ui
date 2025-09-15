// src/components/ui/LoadingSpinner.tsx
import React from 'react';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark';
  message?: string;
  fullScreen?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'spinner-border-sm',
  md: '',
  lg: 'spinner-border-lg',
  xl: 'spinner-border-xl'
};

/**
 * Reusable loading spinner component
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  variant = 'primary',
  message,
  fullScreen = false,
  className = ''
}) => {
  const spinnerClasses = [
    'spinner-border',
    `text-${variant}`,
    sizeClasses[size],
    className
  ].filter(Boolean).join(' ');

  const spinner = (
    <div className={spinnerClasses} role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="loading-spinner-fullscreen position-fixed top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center bg-white bg-opacity-75" style={{ zIndex: 9999 }}>
        {spinner}
        {message && (
          <div className="mt-3 text-muted fw-medium">{message}</div>
        )}
      </div>
    );
  }

  if (message) {
    return (
      <div className="loading-spinner-with-message d-flex flex-column align-items-center justify-content-center p-4">
        {spinner}
        <div className="mt-2 text-muted">{message}</div>
      </div>
    );
  }

  return spinner;
};

/**
 * Simple inline loading spinner
 */
export const InlineSpinner: React.FC<Omit<LoadingSpinnerProps, 'fullScreen' | 'message'>> = (props) => (
  <LoadingSpinner {...props} size="sm" />
);

/**
 * Button loading spinner
 */
export const ButtonSpinner: React.FC = () => (
  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true">
    <span className="visually-hidden">Loading...</span>
  </span>
);

/**
 * Page loading component
 */
export const PageLoader: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => (
  <div className="page-loader min-vh-100 d-flex align-items-center justify-content-center">
    <div className="text-center">
      <LoadingSpinner size="lg" />
      <div className="mt-3 text-muted fw-medium">{message}</div>
    </div>
  </div>
);

/**
 * Card loading skeleton
 */
export const CardSkeleton: React.FC<{ rows?: number }> = ({ rows = 3 }) => (
  <div className="card">
    <div className="card-body">
      <div className="placeholder-glow">
        <span className="placeholder col-6 mb-3"></span>
        {Array.from({ length: rows }, (_, index) => (
          <span key={index} className="placeholder col-12 mb-2"></span>
        ))}
        <span className="placeholder col-4"></span>
      </div>
    </div>
  </div>
);

/**
 * Table loading skeleton
 */
export const TableSkeleton: React.FC<{ rows?: number; cols?: number }> = ({ 
  rows = 5, 
  cols = 4 
}) => (
  <div className="table-responsive">
    <table className="table">
      <thead>
        <tr>
          {Array.from({ length: cols }, (_, index) => (
            <th key={index}>
              <span className="placeholder col-8"></span>
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="placeholder-glow">
        {Array.from({ length: rows }, (_, rowIndex) => (
          <tr key={rowIndex}>
            {Array.from({ length: cols }, (_, colIndex) => (
              <td key={colIndex}>
                <span className="placeholder col-10"></span>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default LoadingSpinner;