// src/services/axiosInstance.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { API_ENDPOINTS } from "../constants/apiEndpoints";
import { API_CONFIG, STORAGE_KEYS } from "../constants/app";
import { getApiVersionHeader } from "../constants/version";

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

// Attach access token to every request
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    // ensure headers object exists (cast to any to safely assign Authorization)
    config.headers = config.headers ?? {};
    if (token) {
      (config.headers as any)["Authorization"] = `Bearer ${token}`;
    }
    
    // Add app version header to API requests
    (config.headers as any)["X-App-Version"] = getApiVersionHeader();
    return config;
  },
  (err) => Promise.reject(err)
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
  (resp) => resp,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig | undefined;

    if (!originalRequest || !error.response) {
      return Promise.reject(error);
    }

    // ignore refresh attempts for the refresh endpoint itself
    const isRefreshEndpoint =
      (originalRequest.url && originalRequest.url.includes("/auth/refresh")) ||
      originalRequest.url === API_ENDPOINTS.AUTH.REFRESH_TOKEN;

    // `_retry` is a custom flag we attach to avoid infinite loops
    if ((error.response.status === 401) && !(originalRequest as any)._retry && !isRefreshEndpoint) {
      (originalRequest as any)._retry = true;

      if (isRefreshing) {
        // queue and wait
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject, requestConfig: originalRequest });
        });
      }

      isRefreshing = true;
      try {
        // Call refresh endpoint using plain axios (not axiosInstance) to avoid interceptor loops
        const refreshResp = await axios.post(API_ENDPOINTS.AUTH.REFRESH_TOKEN, {}, { withCredentials: true });

        const newToken = (refreshResp?.data as any)?.accessToken || (refreshResp?.data as any)?.token;
        if (!newToken) {
          throw new Error("No access token in refresh response");
        }

        // persist new token
        localStorage.setItem(STORAGE_KEYS.TOKEN, newToken);

        // retry queued requests
        processQueue(null, newToken);

        // set header and retry original
        originalRequest.headers = originalRequest.headers ?? {};
        (originalRequest.headers as any)["Authorization"] = `Bearer ${newToken}`;
        return axios(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // clear session on refresh failure
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
