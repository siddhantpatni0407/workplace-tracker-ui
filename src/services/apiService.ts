// src/services/apiService.ts

import axiosInstance from './axiosInstance';
import { TokenService } from './tokenService';
import { ErrorHandler } from '../utils/errorHandling/errorHandler';
import { showErrorToast } from '../components/common/errorNotification/ErrorNotification';

export interface ApiRequestConfig {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  data?: any;
  params?: any;
  headers?: Record<string, string>;
  timeout?: number;
  requireAuth?: boolean;
  showErrorToast?: boolean;
  retryOnFailure?: boolean;
}

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: any;
  success: boolean;
}

export class ApiService {
  private static readonly DEFAULT_TIMEOUT = 30000; // 30 seconds

  /**
   * Make an authenticated API request
   */
  static async request<T = any>(config: ApiRequestConfig): Promise<ApiResponse<T>> {
    const {
      url,
      method = 'GET',
      data,
      params,
      headers = {},
      timeout = this.DEFAULT_TIMEOUT,
      requireAuth = true,
      showErrorToast: showToast = true,
      retryOnFailure = true
    } = config;

    // Check authentication if required
    if (requireAuth && !TokenService.hasAccessToken()) {
      const error = new Error('Authentication required');
      (error as any).code = 'AUTHENTICATION_ERROR';
      throw error;
    }

    // Prepare request configuration
    const requestConfig = {
      url,
      method,
      data,
      params,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      timeout
    };

    try {
      console.log(`🚀 API Request: ${method} ${url}`, {
        params,
        data: method !== 'GET' ? data : undefined,
        requireAuth,
        userId: TokenService.getUserIdFromToken()
      });

      const response = await axiosInstance(requestConfig);
      
      console.log(`✅ API Success: ${method} ${url}`, {
        status: response.status,
        dataSize: response.data ? JSON.stringify(response.data).length : 0
      });

      return {
        data: response.data,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        success: true
      };

    } catch (error) {
      console.error(`❌ API Error: ${method} ${url}`, error);

      if (showToast) {
        const retryFn = retryOnFailure ? () => this.request(config) : undefined;
        showErrorToast(error, retryFn);
      }

      // Re-throw the error for component handling
      throw error;
    }
  }

  /**
   * GET request
   */
  static async get<T = any>(url: string, params?: any, config?: Partial<ApiRequestConfig>): Promise<ApiResponse<T>> {
    return this.request<T>({
      url,
      method: 'GET',
      params,
      ...config
    });
  }

  /**
   * POST request
   */
  static async post<T = any>(url: string, data?: any, config?: Partial<ApiRequestConfig>): Promise<ApiResponse<T>> {
    return this.request<T>({
      url,
      method: 'POST',
      data,
      ...config
    });
  }

  /**
   * PUT request
   */
  static async put<T = any>(url: string, data?: any, config?: Partial<ApiRequestConfig>): Promise<ApiResponse<T>> {
    return this.request<T>({
      url,
      method: 'PUT',
      data,
      ...config
    });
  }

  /**
   * PATCH request
   */
  static async patch<T = any>(url: string, data?: any, config?: Partial<ApiRequestConfig>): Promise<ApiResponse<T>> {
    return this.request<T>({
      url,
      method: 'PATCH',
      data,
      ...config
    });
  }

  /**
   * DELETE request
   */
  static async delete<T = any>(url: string, config?: Partial<ApiRequestConfig>): Promise<ApiResponse<T>> {
    return this.request<T>({
      url,
      method: 'DELETE',
      ...config
    });
  }

  /**
   * Upload file with authentication
   */
  static async uploadFile<T = any>(
    url: string, 
    file: File, 
    additionalData?: Record<string, any>,
    config?: Partial<ApiRequestConfig>
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, typeof value === 'object' ? JSON.stringify(value) : value);
      });
    }

    return this.request<T>({
      url,
      method: 'POST',
      data: formData,
      headers: {
        // Don't set Content-Type for FormData, let the browser set it
      },
      ...config
    });
  }

  /**
   * Batch requests with authentication
   */
  static async batch<T = any>(requests: ApiRequestConfig[]): Promise<ApiResponse<T>[]> {
    console.log(`📦 Batch API Request: ${requests.length} requests`);
    
    try {
      const promises = requests.map(config => this.request<T>(config));
      const results = await Promise.allSettled(promises);
      
      const responses: ApiResponse<T>[] = [];
      const errors: any[] = [];
      
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          responses.push(result.value);
        } else {
          console.error(`❌ Batch request ${index} failed:`, result.reason);
          errors.push(result.reason);
        }
      });
      
      console.log(`📦 Batch completed: ${responses.length} success, ${errors.length} failed`);
      
      if (errors.length > 0 && responses.length === 0) {
        // All requests failed
        throw errors[0]; // Throw the first error
      }
      
      return responses;
    } catch (error) {
      console.error('❌ Batch API Error:', error);
      throw error;
    }
  }

  /**
   * Health check endpoint
   */
  static async healthCheck(): Promise<boolean> {
    try {
      const response = await this.get('/health', {}, {
        requireAuth: false,
        showErrorToast: false,
        timeout: 5000
      });
      return response.status === 200;
    } catch {
      return false;
    }
  }

  /**
   * Get API status and user session info
   */
  static getStatus() {
    return {
      hasToken: TokenService.hasAccessToken(),
      tokenExpired: TokenService.isTokenExpired(),
      needsRefresh: TokenService.needsRefresh(),
      userId: TokenService.getUserIdFromToken(),
      tokenExpiry: TokenService.getTokenExpiryTime(),
      tokenMetadata: TokenService.getTokenMetadata()
    };
  }
}