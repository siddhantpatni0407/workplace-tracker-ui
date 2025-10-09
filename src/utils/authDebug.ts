// src/utils/authDebug.ts

import { TokenService } from '../services/tokenService';
import { authService } from '../services/authService';

/**
 * Debug utility to check authentication state
 */
export const debugAuthState = () => {
  const authState = {
    // Token status
    hasAccessToken: TokenService.hasAccessToken(),
    accessToken: TokenService.getAccessToken(),
    tokenInfo: TokenService.getTokenInfo(),
    authHeader: TokenService.getAuthorizationHeader(),
    
    // User info
    user: authService.getUser(),
    userId: TokenService.getUserIdFromToken(),
    
    // LocalStorage contents
    localStorage: {
      token: localStorage.getItem('workplace_tracker_token'),
      user: localStorage.getItem('workplace_tracker_user'),
      tokenInfo: localStorage.getItem('token_info')
    },
    
    // Token validation
    isValidToken: TokenService.hasAccessToken() && TokenService.getAccessToken() ? TokenService.isValidTokenFormat(TokenService.getAccessToken()!) : false,
    isExpired: TokenService.isTokenExpired(),
    needsRefresh: TokenService.needsRefresh(),
    expiryTime: TokenService.getTokenExpiryTime()
  };
  
  console.log('🔍 Auth Debug State:', authState);
  
  return authState;
};

/**
 * Test API call with current auth state
 */
export const testAuthenticatedCall = async () => {
  console.log('🧪 Testing authenticated API call...');
  
  const authState = debugAuthState();
  
  if (!authState.hasAccessToken) {
    console.error('❌ No access token available for API call');
    return false;
  }
  
  try {
    // Make a test API call to see if authentication works
    const axios = require('axios');
    const response = await axios.get('/api/test', {
      headers: {
        'Authorization': authState.authHeader,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Authenticated API call successful:', response.status);
    return true;
  } catch (error: any) {
    console.error('❌ Authenticated API call failed:', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      headers: error.config?.headers
    });
    return false;
  }
};