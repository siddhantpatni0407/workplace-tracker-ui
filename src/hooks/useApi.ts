// src/hooks/useApi.ts
import { useState, useCallback } from 'react';
import { ApiResponse, ErrorState, LoadingState } from '../models';

export interface UseApiState<T> extends LoadingState, ErrorState {
  data: T | null;
  success: boolean;
}

export interface UseApiActions<T> {
  execute: (...args: any[]) => Promise<T | null>;
  reset: () => void;
  setData: (data: T | null) => void;
}

export interface UseApiReturn<T> extends UseApiState<T>, UseApiActions<T> {}

/**
 * Custom hook for handling API calls with loading, error, and success states
 */
export const useApi = <T = any>(
  apiFunction: (...args: any[]) => Promise<ApiResponse<T>>,
  options: {
    onSuccess?: (data: T) => void;
    onError?: (error: any) => void;
    initialData?: T | null;
  } = {}
): UseApiReturn<T> => {
  const { onSuccess, onError, initialData = null } = options;

  const [state, setState] = useState<UseApiState<T>>({
    data: initialData,
    isLoading: false,
    hasError: false,
    success: false,
    loadingMessage: undefined,
    error: undefined,
    errorCode: undefined
  });

  const execute = useCallback(async (...args: any[]): Promise<T | null> => {
    setState(prev => ({
      ...prev,
      isLoading: true,
      hasError: false,
      error: undefined,
      success: false,
      loadingMessage: 'Loading...'
    }));

    try {
      const response = await apiFunction(...args);
      
      if (response.status === 'SUCCESS' && response.data) {
        setState(prev => ({
          ...prev,
          data: response.data!,
          isLoading: false,
          success: true,
          hasError: false,
          error: undefined
        }));
        
        onSuccess?.(response.data);
        return response.data;
      } else {
        const apiError = response.error || { 
          message: response.message || 'Unknown error',
          code: 'UNKNOWN_ERROR'
        };
        setState(prev => ({
          ...prev,
          isLoading: false,
          hasError: true,
          success: false,
          error: apiError,
          errorCode: apiError.code
        }));
        
        onError?.(apiError);
        return null;
      }
    } catch (error: any) {
      const apiError = {
        message: error.message || 'Network error',
        code: error.code || 'NETWORK_ERROR'
      };
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        hasError: true,
        success: false,
        error: apiError,
        errorCode: apiError.code
      }));
      
      onError?.(apiError);
      return null;
    }
  }, [apiFunction, onSuccess, onError]);

  const reset = useCallback(() => {
    setState({
      data: initialData,
      isLoading: false,
      hasError: false,
      success: false,
      loadingMessage: undefined,
      error: undefined,
      errorCode: undefined
    });
  }, [initialData]);

  const setData = useCallback((data: T | null) => {
    setState(prev => ({
      ...prev,
      data,
      success: data !== null
    }));
  }, []);

  return {
    ...state,
    execute,
    reset,
    setData
  };
};