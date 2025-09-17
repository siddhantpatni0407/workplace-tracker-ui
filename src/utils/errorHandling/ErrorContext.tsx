// src/utils/errorHandling/ErrorContext.tsx
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ApiError } from '../../models';
import { handleError, formatErrorMessage } from './errorHandler';

interface ErrorContextType {
  globalError: ApiError | null;
  setError: (error: unknown) => void;
  clearError: () => void;
  formatError: (error: unknown) => string;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export const ErrorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [globalError, setGlobalError] = useState<ApiError | null>(null);

  const setError = useCallback((error: unknown) => {
    const formattedError = handleError(error);
    setGlobalError(formattedError);
    
    // You can add additional error reporting here (e.g., logging to a service)
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to an error tracking service
      // errorTrackingService.captureException(formattedError);
      // Error logging is disabled to prevent console errors
      // If needed, implement a custom logger that doesn't use console
    }
  }, []);

  const clearError = useCallback(() => {
    setGlobalError(null);
  }, []);

  const formatError = useCallback((error: unknown): string => {
    const formattedError = handleError(error);
    return formatErrorMessage(formattedError);
  }, []);

  return (
    <ErrorContext.Provider value={{ globalError, setError, clearError, formatError }}>
      {children}
    </ErrorContext.Provider>
  );
};

export const useError = (): ErrorContextType => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
};

export default ErrorContext;