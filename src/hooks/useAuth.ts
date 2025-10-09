// src/hooks/useAuth.ts

import { useState, useEffect, useCallback } from 'react';
import { TokenService } from '../services/tokenService';
import { authService, AuthResponse } from '../services/authService';
import { showErrorToast, showSuccessToast } from '../components/common/errorNotification/ErrorNotification';

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any | null;
  token: string | null;
  tokenExpiry: number | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
    token: null,
    tokenExpiry: null
  });

  // Update authentication state
  const updateAuthState = useCallback(() => {
    const token = TokenService.getAccessToken();
    const user = authService.getUser();
    const tokenExpiry = TokenService.getTokenExpiryTime();
    const isAuthenticated = !!token && !!user && !TokenService.isTokenExpired();

    setAuthState({
      isAuthenticated,
      isLoading: false,
      user,
      token,
      tokenExpiry
    });
  }, []);

  // Handle successful login
  const handleLoginSuccess = useCallback((response: AuthResponse) => {
    if (response.status === 'SUCCESS') {
      authService.saveSession(response);
      updateAuthState();
      showSuccessToast(`Welcome back, ${response.name || 'User'}!`);
      
      // Emit login success event
      window.dispatchEvent(new CustomEvent('auth:login-success', {
        detail: { user: response }
      }));
    }
  }, [updateAuthState]);

  // Handle logout
  const handleLogout = useCallback(() => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      authService.logout(); // Now synchronous - no await needed
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        token: null,
        tokenExpiry: null
      });
      
      showSuccessToast('You have been logged out successfully.');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if client logout fails, clear local state
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        token: null,
        tokenExpiry: null
      });
    }
  }, []);

  // Check token expiry and refresh if needed
  const checkTokenExpiry = useCallback(async () => {
    if (!TokenService.hasAccessToken()) {
      return false;
    }

    if (TokenService.needsRefresh()) {
      try {
        console.log('🔄 Token needs refresh, attempting refresh...');
        const refreshed = await authService.refresh();
        
        if (refreshed?.status === 'SUCCESS') {
          authService.saveSession(refreshed);
          updateAuthState();
          console.log('✅ Token refreshed successfully');
          return true;
        } else {
          console.warn('⚠️ Token refresh failed');
          handleLogout();
          return false;
        }
      } catch (error) {
        console.error('❌ Token refresh error:', error);
        handleLogout();
        return false;
      }
    }

    return true;
  }, [updateAuthState, handleLogout]);

  // Initialize auth state on mount
  useEffect(() => {
    updateAuthState();
  }, [updateAuthState]);

  // Set up token expiry monitoring
  useEffect(() => {
    if (!authState.isAuthenticated) return;

    const interval = setInterval(() => {
      checkTokenExpiry();
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [authState.isAuthenticated, checkTokenExpiry]);

  // Listen for auth events
  useEffect(() => {
    const handleTokenExpired = () => {
      console.log('🔒 Token expired event received');
      handleLogout();
    };

    const handleRefreshFailed = () => {
      console.log('❌ Token refresh failed event received');
      handleLogout();
    };

    const handleLogoutEvent = () => {
      console.log('🚪 Logout event received');
      updateAuthState();
    };

    window.addEventListener('auth:token-expired', handleTokenExpired);
    window.addEventListener('auth:refresh-failed', handleRefreshFailed);
    window.addEventListener('auth:logout', handleLogoutEvent);

    return () => {
      window.removeEventListener('auth:token-expired', handleTokenExpired);
      window.removeEventListener('auth:refresh-failed', handleRefreshFailed);
      window.removeEventListener('auth:logout', handleLogoutEvent);
    };
  }, [handleLogout, updateAuthState]);

  // Get authorization header
  const getAuthHeader = useCallback(() => {
    return TokenService.getAuthorizationHeader();
  }, []);

  // Check if user has specific role
  const hasRole = useCallback((role: string) => {
    return authState.user?.role === role;
  }, [authState.user]);

  // Check if user has any of the specified roles
  const hasAnyRole = useCallback((roles: string[]) => {
    return roles.includes(authState.user?.role);
  }, [authState.user]);

  // Get user permissions (if available)
  const getPermissions = useCallback(() => {
    return authState.user?.permissions || [];
  }, [authState.user]);

  // Check if user has specific permission
  const hasPermission = useCallback((permission: string) => {
    const permissions = getPermissions();
    return permissions.includes(permission);
  }, [getPermissions]);

  return {
    // State
    ...authState,
    
    // Actions
    login: handleLoginSuccess,
    logout: handleLogout,
    checkTokenExpiry,
    updateAuthState,
    
    // Utilities
    getAuthHeader,
    hasRole,
    hasAnyRole,
    hasPermission,
    getPermissions,
    
    // Token utilities
    tokenService: TokenService
  };
};