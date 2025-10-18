// src/services/platformAuthService.ts
import axios from 'axios';
import { API_ENDPOINTS } from '../constants/apiEndpoints';
import { API_CONFIG } from '../constants/app';

// Create a clean axios instance for platform authentication (no user auth headers)
const platformAuthAxios = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  withCredentials: false, // Platform auth doesn't need cookies
  headers: {
    'Content-Type': 'application/json',
  }
});

export interface PlatformAuthResponse {
  token: string;
  refreshToken: string;
  role: string;
  platformUserId: number;
  name: string;
  status: 'SUCCESS' | 'FAILED';
  message: string;
  lastLoginTime: string | null;
  isActive: boolean;
  loginAttempts: number;
  accountLocked: boolean;
}

export interface PlatformLoginRequest {
  emailOrMobile: string;
  password: string;
}

export interface PlatformSignupRequest {
  name: string;
  email: string;
  mobileNumber?: string;
  password: string;
  confirmPassword: string;
}

class PlatformAuthService {
  /**
   * Platform user signup
   */
  async signup(data: PlatformSignupRequest): Promise<PlatformAuthResponse> {
    const requestData: any = {
      name: data.name.trim(),
      email: data.email.trim(),
      password: data.password,
      confirmPassword: data.confirmPassword
    };

    // Add mobile number only if provided (it's optional)
    if (data.mobileNumber?.trim()) {
      requestData.mobileNumber = data.mobileNumber.trim();
    }

    const response = await platformAuthAxios.post(API_ENDPOINTS.PLATFORM_AUTH.SIGNUP, requestData);
    return response.data;
  }

  /**
   * Platform user login
   */
  async login(data: PlatformLoginRequest): Promise<PlatformAuthResponse> {
    const response = await platformAuthAxios.post(API_ENDPOINTS.PLATFORM_AUTH.LOGIN, {
      emailOrMobile: data.emailOrMobile,
      password: data.password
    });
    return response.data;
  }

  /**
   * Refresh platform auth tokens
   */
  async refreshToken(refreshToken: string): Promise<PlatformAuthResponse> {
    const response = await platformAuthAxios.post(API_ENDPOINTS.PLATFORM_AUTH.REFRESH_TOKEN, refreshToken, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  }

  /**
   * Get platform user profile
   */
  async getProfile(platformUserId: number | string) {
    const response = await platformAuthAxios.get(API_ENDPOINTS.PLATFORM_AUTH.PROFILE(platformUserId));
    return response.data;
  }

  /**
   * Store platform auth tokens in localStorage
   */
  storePlatformTokens(authResponse: PlatformAuthResponse): void {
    if (authResponse.token) {
      localStorage.setItem('platformAuthToken', authResponse.token);
    }
    if (authResponse.refreshToken) {
      localStorage.setItem('platformRefreshToken', authResponse.refreshToken);
    }
    if (authResponse.platformUserId) {
      localStorage.setItem('platformUserId', authResponse.platformUserId.toString());
    }
    if (authResponse.name) {
      localStorage.setItem('platformUserName', authResponse.name);
    }
  }

  /**
   * Get stored platform tokens
   */
  getPlatformTokens() {
    return {
      token: localStorage.getItem('platformAuthToken'),
      refreshToken: localStorage.getItem('platformRefreshToken'),
      userId: localStorage.getItem('platformUserId'),
      userName: localStorage.getItem('platformUserName')
    };
  }

  /**
   * Clear platform auth data
   */
  clearPlatformAuth(): void {
    localStorage.removeItem('platformAuthToken');
    localStorage.removeItem('platformRefreshToken');
    localStorage.removeItem('platformUserId');
    localStorage.removeItem('platformUserName');
  }

  /**
   * Check if platform user is authenticated
   */
  isPlatformAuthenticated(): boolean {
    const token = localStorage.getItem('platformAuthToken');
    return !!token;
  }

  /**
   * Auto-refresh platform token if needed
   */
  async ensureValidPlatformToken(): Promise<boolean> {
    const { token, refreshToken } = this.getPlatformTokens();
    
    if (!token) {
      return false;
    }

    // You could add JWT expiration check here
    // For now, we'll assume the token is valid
    return true;

    // If token is expired, try to refresh
    // if (refreshToken) {
    //   try {

    
    // return false;
  }
}

export const platformAuthService = new PlatformAuthService();
export default platformAuthService;