// src/services/authService.ts
import axios from "axios";
import axiosInstance from "./axiosInstance";
import { API_ENDPOINTS } from "../constants/apiEndpoints";
import { Role } from "../types/auth";
import { TokenService, TokenInfo } from "./tokenService";

// Use consistent storage keys
const STORAGE_KEYS = {
  TOKEN: 'workplace_tracker_token',
  REFRESH_TOKEN: 'workplace_tracker_refresh_token',
  USER: 'workplace_tracker_user',
  LAST_LOGIN_TIME: 'workplace_tracker_last_login_time',
  LAST_LOGIN_SHOWN: 'workplace_tracker_last_login_shown'
} as const;

/**
 * AuthResponse:
 * - `accessToken` is the canonical field for new responses
 * - `token` is kept for backward compatibility
 */
export interface AuthResponse {
  accessToken?: string | null;
  token?: string | null;
  refreshToken?: string | null;
  tokenType?: string | null;
  expiresIn?: number | null;
  scope?: string | null;
  role?: Role | null;
  userId?: number | null;
  name?: string | null;
  email?: string | null;
  status: "SUCCESS" | "FAILED";
  message?: string | null;
  lastLoginTime?: string | null;
  isActive?: boolean | null;
  loginAttempts?: number | null;
  accountLocked?: boolean | null;
}

/** Signup payload */
export interface SignupData {
  name: string;
  mobileNumber: string;
  email: string;
  password: string;
  role: Role;
  platformUserCode?: string;
  tenantCode?: string;
  tenantUserCode?: string;
}

/** Captcha payload (optional) - allow null so callers with string | null don't error */
export interface CaptchaPayload {
  captchaToken?: string | null | undefined;
  mathCaptchaAnswer?: string | null | undefined;
}

export const authService = {
  signup: async (data: SignupData): Promise<AuthResponse> => {
    try {
      const resp = await axiosInstance.post<AuthResponse>(API_ENDPOINTS.AUTH.SIGNUP, data);
      return normalizeAuthResponse(resp.data);
    } catch (err: any) {
      if (err?.response?.data) return normalizeAuthResponse(err.response.data);
      return {
        status: "FAILED",
        message: err?.message || "Signup failed",
      };
    }
  },

  /**
   * login now accepts an optional captcha payload as 3rd argument.
   * Example: authService.login(email, password, { captchaToken: '...' })
   */
  login: async (
    email: string,
    password: string,
    captcha?: CaptchaPayload
  ): Promise<AuthResponse> => {
    try {
      const payload: any = { email, password };

      // only attach captcha fields when they are not null/undefined/empty
      if (captcha?.captchaToken != null && captcha.captchaToken !== "") {
        payload.captchaToken = captcha.captchaToken;
      }
      if (captcha?.mathCaptchaAnswer != null && captcha.mathCaptchaAnswer !== "") {
        payload.mathCaptchaAnswer = captcha.mathCaptchaAnswer;
      }

      const resp = await axiosInstance.post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, payload);
      const authData = normalizeAuthResponse(resp.data);
      
      // If successful, store tokens using enhanced TokenService
      if (authData.status === "SUCCESS") {
        const token = authData.accessToken || authData.token;
        if (token) {
          console.log('💾 Saving login tokens...', {
            hasToken: !!token,
            tokenLength: token.length,
            userId: authData.userId,
            tokenType: resp.data.tokenType || 'Bearer'
          });
          
          const tokenInfo: TokenInfo = {
            accessToken: token,
            tokenType: resp.data.tokenType || 'Bearer',
            expiresIn: resp.data.expiresIn || undefined,
            refreshToken: resp.data.refreshToken || undefined,
            scope: resp.data.scope || undefined,
            userId: authData.userId || undefined
          };
          
          TokenService.saveTokens(tokenInfo);
          
          // Also save to legacy storage for backward compatibility
          localStorage.setItem(STORAGE_KEYS.TOKEN, token);
          
          // Verify token was saved correctly
          const savedToken = TokenService.getAccessToken();
          const authHeader = TokenService.getAuthorizationHeader();
          
          console.log('✅ Login tokens saved successfully:', {
            tokenSaved: !!savedToken,
            tokensMatch: savedToken === token,
            authHeaderGenerated: !!authHeader,
            userId: TokenService.getUserIdFromToken()
          });
          
          if (!savedToken || savedToken !== token) {
            console.error('❌ Token save verification failed!');
          }
        } else {
          console.error('❌ No token received from login response');
        }
      }
      
      return authData;
    } catch (err: any) {
      // Enhanced error handling for login
      if (err?.response?.data) {
        return normalizeAuthResponse(err.response.data);
      }
      
      // Handle network errors with better messages
      if (err?.isNetworkError || err?.code === 'NETWORK_ERROR' || err?.code === 'SERVICE_UNAVAILABLE') {
        return {
          status: "FAILED",
          message: err.message || "Unable to connect to the authentication service. Please check your internet connection and try again.",
          accessToken: null,
          token: null,
        };
      }
      
      // Handle timeout errors
      if (err?.code === 'TIMEOUT_ERROR') {
        return {
          status: "FAILED",
          message: "Login request timed out. Please try again.",
          accessToken: null,
          token: null,
        };
      }
      
      // Generic error fallback
      return {
        status: "FAILED",
        message: err?.message || "An unexpected error occurred during login. Please try again.",
        accessToken: null,
        token: null,
      };
    }
  },

  /**
   * Call refresh endpoint to obtain a new access token.
   * Uses plain axios to avoid interceptor recursion.
   * Backend should set/expect HttpOnly refresh cookie (withCredentials:true).
   */
  refresh: async (): Promise<AuthResponse> => {
    try {
      const resp = await axios.post(API_ENDPOINTS.AUTH.REFRESH_TOKEN, {}, { withCredentials: true });
      return normalizeAuthResponse(resp.data);
    } catch (err: any) {
      if (err?.response?.data) return normalizeAuthResponse(err.response.data);
      return {
        status: "FAILED",
        message: err?.message || "Refresh failed",
      };
    }
  },

  logout: () => {
    console.log('🚪 Logging out user...');
    
    // Since there's no backend logout API, perform client-side logout only
    
    // Clear all tokens using TokenService
    TokenService.clearTokens();
    
    // Clear all user-related data from localStorage
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.LAST_LOGIN_TIME);
    localStorage.removeItem(STORAGE_KEYS.LAST_LOGIN_SHOWN);
    
    // Clear any cached user settings or preferences
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('workplace_tracker_') || key.startsWith('user_settings_')) {
        localStorage.removeItem(key);
      }
    });
    
    console.log('✅ Client logout completed - no server logout required');
    
    // Emit logout event for other components
    window.dispatchEvent(new CustomEvent('auth:logout'));
  },

  saveSession: (resp: AuthResponse) => {
    console.log('💾 Saving user session...');
    
    // prefer canonical accessToken then fallback to token
    const access = resp.accessToken ?? resp.token ?? null;
    if (resp.status === "SUCCESS" && access) {
      // Save tokens using enhanced TokenService
      const tokenInfo: TokenInfo = {
        accessToken: access,
        tokenType: resp.tokenType || 'Bearer',
        expiresIn: resp.expiresIn || undefined,
        refreshToken: resp.refreshToken || undefined,
        scope: resp.scope || undefined,
        userId: resp.userId || undefined
      };
      
      TokenService.saveTokens(tokenInfo);
      
      // Also save to legacy storage for backward compatibility
      localStorage.setItem(STORAGE_KEYS.TOKEN, access);

      // Save user object (minimal fields)
      const userInfo = {
        userId: resp.userId ?? null,
        name: resp.name ?? null,
        email: resp.email ?? null,
        role: resp.role ?? null,
        isActive: resp.isActive ?? null,
        lastLoginTime: resp.lastLoginTime ?? null,
        loginAttempts: resp.loginAttempts ?? null,
        accountLocked: resp.accountLocked ?? null,
      };
      
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userInfo));

      if (resp.lastLoginTime) {
        localStorage.setItem(STORAGE_KEYS.LAST_LOGIN_TIME, resp.lastLoginTime);
        localStorage.setItem(STORAGE_KEYS.LAST_LOGIN_SHOWN, "false");
      }
      
      console.log('✅ Session saved successfully', {
        userId: resp.userId,
        email: resp.email,
        role: resp.role,
        tokenExpiry: tokenInfo.expiresAt ? new Date(tokenInfo.expiresAt) : 'Unknown'
      });
    }
  },

  getUser: (): {
    userId?: number | null;
    name?: string | null;
    email?: string | null;
    role?: Role | null;
    isActive?: boolean | null;
    lastLoginTime?: string | null;
    loginAttempts?: number | null;
    accountLocked?: boolean | null;
  } | null => {
    const stored = localStorage.getItem(STORAGE_KEYS.USER);
    return stored ? JSON.parse(stored) : null;
  },

  /**
   * Change user password
   * Uses JWT token to identify user (no userId required)
   */
  changePassword: async (
    currentPassword: string,
    newPassword: string
  ): Promise<{ status: "SUCCESS" | "FAILED"; message: string }> => {
    try {
      const payload = {
        currentPassword,
        newPassword,
      };

      const resp = await axiosInstance.patch(
        API_ENDPOINTS.AUTH.CHANGE_PASSWORD,
        payload
      );

      return {
        status: resp.data.status || "SUCCESS",
        message: resp.data.message || "Password changed successfully.",
      };
    } catch (err: any) {
      console.error("Password change error:", err);
      
      if (err?.response?.data) {
        return {
          status: "FAILED",
          message: err.response.data.message || "Failed to change password.",
        };
      }
      
      return {
        status: "FAILED",
        message: err?.message || "Failed to change password.",
      };
    }
  },
};

/** Helpers */

/** Normalize backend response into AuthResponse shape we expect */
function normalizeAuthResponse(raw: any): AuthResponse {
  if (!raw) return { status: "FAILED", message: "Empty response" };

  // If backend returns fields under different names, map them here
  const accessToken = raw.accessToken ?? raw.token ?? raw.data?.accessToken ?? raw.data?.token;
  const payload: AuthResponse = {
    accessToken,
    token: raw.token ?? raw.accessToken ?? undefined,
    role: raw.role ?? raw.data?.role ?? undefined,
    userId: raw.userId ?? raw.data?.userId ?? undefined,
    name: raw.name ?? raw.data?.name ?? undefined,
    email: raw.email ?? raw.data?.email ?? undefined,
    status: raw.status ?? raw.data?.status ?? (accessToken ? "SUCCESS" : "FAILED"),
    message: raw.message ?? raw.data?.message ?? undefined,
    lastLoginTime: raw.lastLoginTime ?? raw.data?.lastLoginTime ?? undefined,
    isActive: raw.isActive ?? raw.data?.isActive ?? undefined,
    loginAttempts: typeof raw.loginAttempts === "number" ? raw.loginAttempts : raw.data?.loginAttempts,
    accountLocked: typeof raw.accountLocked === "boolean" ? raw.accountLocked : raw.data?.accountLocked,
  };
  return payload;
}
