/**
 * Platform Axios Instance
 * Dedicated axios instance for platform API calls with platform authentication
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { API_CONFIG } from "../constants/app";
import { getApiVersionHeader } from "../constants/version";
import { ErrorHandler } from "../utils/errorHandling/errorHandler";

/**
 * Platform authentication tokens storage keys
 */
const PLATFORM_STORAGE_KEYS = {
  TOKEN: 'platformAuthToken',
  REFRESH_TOKEN: 'platformRefreshToken',
  USER_ID: 'platformUserId',
  USER_NAME: 'platformUserName'
} as const;

/**
 * Get platform authorization header
 */
const getPlatformAuthHeader = (): string | null => {
  const token = localStorage.getItem(PLATFORM_STORAGE_KEYS.TOKEN);
  return token ? `Bearer ${token}` : null;
};

/**
 * Get platform user ID from token
 */
const getPlatformUserId = (): number | null => {
  const userId = localStorage.getItem(PLATFORM_STORAGE_KEYS.USER_ID);
  return userId ? parseInt(userId, 10) : null;
};

/**
 * Check if user has platform authentication
 */
const hasPlatformAuth = (): boolean => {
  return !!localStorage.getItem(PLATFORM_STORAGE_KEYS.TOKEN);
};

/**
 * Axios instance configured for platform API calls
 */
const platformAxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  withCredentials: true,
});

// Request interceptor for platform authentication
platformAxiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Ensure headers object exists
    config.headers = config.headers ?? {};
    
    // Add Authorization header with platform token
    const authHeader = getPlatformAuthHeader();
    if (authHeader) {
      (config.headers as any)["Authorization"] = authHeader;
    } else {
      console.warn('🚨 Platform API call without authentication token:', config.url);
    }
    
    // Add app version header
    (config.headers as any)["X-App-Version"] = getApiVersionHeader();
    
    // Add request timestamp for debugging
    (config.headers as any)["X-Request-Time"] = new Date().toISOString();
    
    // Add platform user ID header if available
    const platformUserId = getPlatformUserId();
    if (platformUserId) {
      (config.headers as any)["X-Platform-User-ID"] = platformUserId.toString();
    }
    
    // Add platform context header
    (config.headers as any)["X-Request-Context"] = "platform";
    
    // Log platform API calls in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔗 Platform API Call: ${config.method?.toUpperCase()} ${config.url}`, {
        headers: {
          Authorization: config.headers.Authorization ? 'Bearer [PLATFORM_TOKEN]' : 'Not Set',
          'X-Platform-User-ID': config.headers['X-Platform-User-ID'],
          'X-App-Version': config.headers['X-App-Version'],
          'X-Request-Context': config.headers['X-Request-Context']
        },
        data: config.data,
        params: config.params
      });
    }
    
    // Always log platform auth status
    console.log('🔐 Platform request auth status:', {
      url: config.url,
      hasAuthHeader: !!config.headers.Authorization,
      hasPlatformToken: hasPlatformAuth(),
      platformUserId: getPlatformUserId(),
      context: 'platform'
    });
    
    return config;
  },
  (err) => {
    console.error('Platform request interceptor error:', err);
    return Promise.reject(ErrorHandler.processError(err));
  }
);

// Response interceptor for platform API calls
platformAxiosInstance.interceptors.response.use(
  (response) => {
    // Log successful platform API responses in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ Platform API Success: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data?.status || 'No status',
        message: response.data?.message || 'No message'
      });
    }
    return response;
  },
  (error: AxiosError) => {
    // Enhanced error logging for platform API calls
    console.error('🚨 Platform API Error:', {
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      hasPlatformToken: hasPlatformAuth()
    });
    
    // Handle 401 errors for platform authentication
    if (error.response?.status === 401) {
      console.warn('🔓 Platform authentication failed - 401 response');
      console.warn('Current URL:', error.config?.url);
      console.warn('Has platform token:', hasPlatformAuth());
      
      // Don't auto-logout on first load - let the component handle it
      if (typeof window !== 'undefined' && window.location.pathname.includes('/platform/tenants')) {
        console.warn('⚠️ 401 on tenant management - not auto-redirecting');
        return Promise.reject(ErrorHandler.processError(error));
      }
      
      console.warn('🔓 Clearing platform tokens and redirecting to login');
      
      // Clear platform tokens
      localStorage.removeItem(PLATFORM_STORAGE_KEYS.TOKEN);
      localStorage.removeItem(PLATFORM_STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(PLATFORM_STORAGE_KEYS.USER_ID);
      localStorage.removeItem(PLATFORM_STORAGE_KEYS.USER_NAME);
      
      // Redirect to platform login
      if (typeof window !== 'undefined') {
        window.location.href = '/platform-login';
      }
    }
    
    // Handle 403 errors (insufficient permissions)
    if (error.response?.status === 403) {
      console.warn('🚫 Platform access denied - insufficient permissions');
    }
    
    return Promise.reject(ErrorHandler.processError(error));
  }
);

export default platformAxiosInstance;