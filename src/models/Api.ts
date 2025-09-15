// src/models/Api.ts

// Generic API Response wrapper
export interface ApiResponse<T = any> {
  status: 'SUCCESS' | 'FAILED' | 'ERROR';
  message?: string;
  data?: T;
  error?: ApiError;
  timestamp?: string;
  path?: string;
}

// Error details
export interface ApiError {
  code: string;
  message: string;
  details?: string;
  field?: string;
  timestamp?: string;
}

// Pagination metadata
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Paginated response
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: PaginationMeta;
}

// Pagination request parameters
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

// Search and filter parameters
export interface SearchParams {
  query?: string;
  filters?: Record<string, any>;
}

// Common request parameters
export interface RequestParams extends PaginationParams, SearchParams {
  [key: string]: any;
}

// Loading state
export interface LoadingState {
  isLoading: boolean;
  loadingMessage?: string;
}

// Error state
export interface ErrorState {
  hasError: boolean;
  error?: ApiError | Error | string;
  errorCode?: string;
}

// Combined async state
export interface AsyncState<T = any> extends LoadingState, ErrorState {
  data?: T;
  lastFetched?: Date;
}

// HTTP methods
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

// API endpoint configuration
export interface ApiEndpoint {
  url: string;
  method: HttpMethod;
  requiresAuth?: boolean;
  timeout?: number;
}

// Request configuration
export interface RequestConfig {
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  cache?: boolean;
  cacheKey?: string;
}