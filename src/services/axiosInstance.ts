// src/services/axiosInstance.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { API_ENDPOINTS } from "../constants/apiEndpoints";
import { API_CONFIG } from "../constants/app";
import { getApiVersionHeader } from "../constants/version";
import { TokenService } from "./tokenService";
import { ErrorHandler } from "../utils/errorHandling/errorHandler";

// Use consistent storage keys
const STORAGE_KEYS = {
  TOKEN: 'workplace_tracker_token',
  REFRESH_TOKEN: 'workplace_tracker_refresh_token',
  USER: 'workplace_tracker_user'
} as const;

/**
 * Axios instance with:
 * - baseURL
 * - withCredentials (so HttpOnly refresh cookie is sent)
 * - attaches access token from localStorage
 * - response interceptor that attempts refresh on 401 and retries requests (queues concurrent requests)
 *
 * Uses proper Axios v1 types (InternalAxiosRequestConfig / AxiosError).
 */

const axiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  withCredentials: true,
});

// Enhanced request interceptor with improved token management
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Ensure headers object exists
    config.headers = config.headers ?? {};
    
    // Add Authorization header if token exists and is valid
    const authHeader = TokenService.getAuthorizationHeader();
    if (authHeader) {
      (config.headers as any)["Authorization"] = authHeader;
    }
    
    // Add app version header to API requests
    (config.headers as any)["X-App-Version"] = getApiVersionHeader();
    
    // Add request timestamp for debugging
    (config.headers as any)["X-Request-Time"] = new Date().toISOString();
    
    // Add user ID header if available (for backend logging)
    const userId = TokenService.getUserIdFromToken();
    if (userId) {
      (config.headers as any)["X-User-ID"] = userId.toString();
    }
    
    // Log API calls in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔗 API Call: ${config.method?.toUpperCase()} ${config.url}`, {
        headers: {
          Authorization: config.headers.Authorization ? 'Bearer [TOKEN]' : 'Not Set',
          'X-User-ID': config.headers['X-User-ID'],
          'X-App-Version': config.headers['X-App-Version']
        },
        data: config.data,
        params: config.params
      });
    }
    
    // Always log authorization header status
    console.log('🔐 Request auth status:', {
      url: config.url,
      hasAuthHeader: !!config.headers.Authorization,
      hasToken: !!TokenService.getAccessToken(),
      userId: TokenService.getUserIdFromToken()
    });
    
    return config;
  },
  (err) => {
    console.error('Request interceptor error:', err);
    return Promise.reject(ErrorHandler.processError(err));
  }
);

// --- Refresh token handling ---
let isRefreshing = false;
let failedQueue: {
  resolve: (value?: any) => void;
  reject: (err?: any) => void;
  requestConfig: InternalAxiosRequestConfig;
}[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else {
      if (token && prom.requestConfig && prom.requestConfig.headers) {
        (prom.requestConfig.headers as any)["Authorization"] = `Bearer ${token}`;
      }
      prom.resolve(axios(prom.requestConfig));
    }
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (resp) => {
    // Log successful responses in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ API Response: ${resp.config.method?.toUpperCase()} ${resp.config.url}`, {
        status: resp.status,
        data: resp.data
      });
    }
    return resp;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig | undefined;

    // Log errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`❌ API Error: ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url}`, {
        status: error.response?.status,
        message: error.message,
        data: error.response?.data
      });
    }

    // Enhanced error handling - transform network errors to more descriptive errors
    if (!originalRequest || !error.response) {
      // Network error (server down, no internet, etc.)
      if (error.code === 'ECONNREFUSED') {
        const enhancedError = new Error('Service temporarily unavailable. Please try again later.');
        (enhancedError as any).code = 'SERVICE_UNAVAILABLE';
        (enhancedError as any).isNetworkError = true;
        (enhancedError as any).originalError = error;
        return Promise.reject(enhancedError);
      }
      
      if (error.code === 'ETIMEDOUT') {
        const enhancedError = new Error('Request timed out. Please check your connection and try again.');
        (enhancedError as any).code = 'TIMEOUT_ERROR';
        (enhancedError as any).isNetworkError = true;
        (enhancedError as any).originalError = error;
        return Promise.reject(enhancedError);
      }
      
      // Generic network error
      const enhancedError = new Error('Unable to connect to the server. Please check your internet connection.');
      (enhancedError as any).code = 'NETWORK_ERROR';
      (enhancedError as any).isNetworkError = true;
      (enhancedError as any).originalError = error;
      return Promise.reject(enhancedError);
    }

    // ignore refresh attempts for the refresh endpoint itself
    const isRefreshEndpoint =
      (originalRequest.url && originalRequest.url.includes("/auth/refresh")) ||
      originalRequest.url === API_ENDPOINTS.AUTH.REFRESH_TOKEN;

    // Enhanced token refresh with better error handling
    if ((error.response.status === 401) && !(originalRequest as any)._retry && !isRefreshEndpoint) {
      (originalRequest as any)._retry = true;

      // Check if we have a refresh token before attempting refresh
      if (!TokenService.getRefreshToken() && !document.cookie.includes('refreshToken')) {
        console.warn('No refresh token available, redirecting to login');
        TokenService.clearTokens();
        // Emit custom event for auth failure
        window.dispatchEvent(new CustomEvent('auth:token-expired'));
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // queue and wait
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject, requestConfig: originalRequest });
        });
      }

      isRefreshing = true;
      try {
        console.log('🔄 Attempting token refresh...');
        
        // Call refresh endpoint using plain axios (not axiosInstance) to avoid interceptor loops
        const refreshResp = await axios.post(
          API_ENDPOINTS.AUTH.REFRESH_TOKEN, 
          {}, 
          { 
            withCredentials: true,
            timeout: 10000, // 10 second timeout for refresh
            headers: {
              'X-App-Version': getApiVersionHeader()
            }
          }
        );

        const responseData = refreshResp.data;
        const newToken = responseData?.accessToken || responseData?.token;
        
        if (!newToken) {
          throw new Error("No access token in refresh response");
        }

        // Save new token using TokenService
        TokenService.saveTokens({
          accessToken: newToken,
          tokenType: responseData.tokenType || 'Bearer',
          expiresIn: responseData.expiresIn,
          refreshToken: responseData.refreshToken,
          userId: responseData.userId
        });

        console.log('✅ Token refreshed successfully');

        // retry queued requests
        processQueue(null, newToken);

        // set header and retry original
        originalRequest.headers = originalRequest.headers ?? {};
        (originalRequest.headers as any)["Authorization"] = `Bearer ${newToken}`;
        (originalRequest.headers as any)["X-Token-Refreshed"] = "true";
        
        return axios(originalRequest);
      } catch (refreshError) {
        console.error('❌ Token refresh failed:', refreshError);
        
        processQueue(refreshError, null);
        
        // Clear all tokens and user session
        TokenService.clearTokens();
        localStorage.clear();
        
        // Emit custom event for auth failure
        window.dispatchEvent(new CustomEvent('auth:refresh-failed', { 
          detail: { error: refreshError } 
        }));
        
        // Transform error for better user experience
        const authError = new Error('Your session has expired. Please log in again.');
        (authError as any).code = 'AUTHENTICATION_ERROR';
        (authError as any).isAuthError = true;
        (authError as any).originalError = refreshError;
        
        return Promise.reject(authError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
