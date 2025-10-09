// src/services/tokenService.ts

// Use consistent storage keys across the app
const STORAGE_KEYS = {
  TOKEN: 'workplace_tracker_token',
  REFRESH_TOKEN: 'workplace_tracker_refresh_token',
  USER: 'workplace_tracker_user'
} as const;

export interface TokenInfo {
  accessToken: string;
  refreshToken?: string;
  tokenType: string;
  expiresIn?: number;
  expiresAt?: number;
  scope?: string;
  userId?: number;
}

export class TokenService {
  private static readonly TOKEN_REFRESH_BUFFER = 5 * 60 * 1000; // 5 minutes before expiry

  /**
   * Save token information to storage
   */
  static saveTokens(tokenInfo: TokenInfo): void {
    try {
      if (tokenInfo.accessToken) {
        localStorage.setItem(STORAGE_KEYS.TOKEN, tokenInfo.accessToken);
        
        // Calculate expiry time if expiresIn is provided
        if (tokenInfo.expiresIn) {
          const expiresAt = Date.now() + (tokenInfo.expiresIn * 1000);
          tokenInfo.expiresAt = expiresAt;
        }
        
        // Store complete token info
        localStorage.setItem('token_info', JSON.stringify({
          ...tokenInfo,
          savedAt: Date.now()
        }));
      }
      
      if (tokenInfo.refreshToken) {
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokenInfo.refreshToken);
      }
    } catch (error) {
      console.error('Failed to save tokens:', error);
    }
  }

  /**
   * Get current access token
   */
  static getAccessToken(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEYS.TOKEN);
    } catch (error) {
      console.error('Failed to get access token:', error);
      return null;
    }
  }

  /**
   * Get refresh token
   */
  static getRefreshToken(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    } catch (error) {
      console.error('Failed to get refresh token:', error);
      return null;
    }
  }

  /**
   * Get complete token information
   */
  static getTokenInfo(): TokenInfo | null {
    try {
      const tokenInfoStr = localStorage.getItem('token_info');
      if (!tokenInfoStr) return null;
      
      return JSON.parse(tokenInfoStr);
    } catch (error) {
      console.error('Failed to get token info:', error);
      return null;
    }
  }

  /**
   * Check if access token exists
   */
  static hasAccessToken(): boolean {
    return !!this.getAccessToken();
  }

  /**
   * Check if token is expired or about to expire
   */
  static isTokenExpired(): boolean {
    const tokenInfo = this.getTokenInfo();
    if (!tokenInfo || !tokenInfo.expiresAt) {
      // If no expiry info, assume token is still valid
      return false;
    }

    const now = Date.now();
    const expiryWithBuffer = tokenInfo.expiresAt - this.TOKEN_REFRESH_BUFFER;
    
    return now >= expiryWithBuffer;
  }

  /**
   * Check if token needs refresh (expired or about to expire)
   */
  static needsRefresh(): boolean {
    return this.hasAccessToken() && this.isTokenExpired();
  }

  /**
   * Get token expiry time in seconds
   */
  static getTokenExpiryTime(): number | null {
    const tokenInfo = this.getTokenInfo();
    if (!tokenInfo || !tokenInfo.expiresAt) return null;
    
    const remainingMs = tokenInfo.expiresAt - Date.now();
    return Math.max(0, Math.floor(remainingMs / 1000));
  }

  /**
   * Clear all tokens
   */
  static clearTokens(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem('token_info');
    } catch (error) {
      console.error('Failed to clear tokens:', error);
    }
  }

  /**
   * Validate token format
   */
  static isValidTokenFormat(token: string): boolean {
    if (!token || typeof token !== 'string') return false;
    
    // Basic JWT format validation (header.payload.signature)
    const parts = token.split('.');
    return parts.length === 3 && parts.every(part => part.length > 0);
  }

  /**
   * Get Authorization header value
   */
  static getAuthorizationHeader(): string | null {
    const token = this.getAccessToken();
    if (!token) {
      console.warn('🔒 No access token found in localStorage');
      return null;
    }
    
    const tokenInfo = this.getTokenInfo();
    const tokenType = tokenInfo?.tokenType || 'Bearer';
    const authHeader = `${tokenType} ${token}`;
    
    console.log('🔑 Authorization header generated:', {
      tokenType,
      tokenLength: token.length,
      tokenStart: token.substring(0, 20) + '...',
      hasTokenInfo: !!tokenInfo
    });
    
    return authHeader;
  }

  /**
   * Extract user ID from token (if available)
   */
  static getUserIdFromToken(): number | null {
    try {
      const token = this.getAccessToken();
      if (!token || !this.isValidTokenFormat(token)) return null;
      
      // Decode JWT payload (without verification - for client use only)
      const payload = token.split('.')[1];
      const decodedPayload = JSON.parse(atob(payload));
      
      return decodedPayload.userId || decodedPayload.sub || decodedPayload.user_id || null;
    } catch (error) {
      console.error('Failed to extract user ID from token:', error);
      return null;
    }
  }

  /**
   * Get token metadata for debugging
   */
  static getTokenMetadata(): object | null {
    try {
      const token = this.getAccessToken();
      if (!token || !this.isValidTokenFormat(token)) return null;
      
      const payload = token.split('.')[1];
      const decodedPayload = JSON.parse(atob(payload));
      
      return {
        userId: decodedPayload.userId || decodedPayload.sub,
        email: decodedPayload.email,
        role: decodedPayload.role,
        iat: decodedPayload.iat ? new Date(decodedPayload.iat * 1000) : null,
        exp: decodedPayload.exp ? new Date(decodedPayload.exp * 1000) : null,
        scope: decodedPayload.scope
      };
    } catch (error) {
      console.error('Failed to get token metadata:', error);
      return null;
    }
  }
}