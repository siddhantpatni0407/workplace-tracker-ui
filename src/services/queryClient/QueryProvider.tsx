// src/services/queryClient/QueryProvider.tsx
import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './index';

interface QueryProviderProps {
  children: React.ReactNode;
}

/**
 * Provider component for React Query
 * Wraps the application with QueryClientProvider
 */
export const QueryProvider: React.FC<QueryProviderProps> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

export default QueryProvider;