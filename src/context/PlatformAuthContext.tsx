// src/context/PlatformAuthContext.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { platformAuthService, PlatformAuthResponse, PlatformLoginRequest, PlatformSignupRequest } from "../services/platformAuthService";

export interface PlatformUser {
  platformUserId: number;
  name: string;
  email?: string;
  role?: string;
  isActive?: boolean;
  lastLoginTime?: string | null;
  loginAttempts?: number;
  accountLocked?: boolean;
}

interface PlatformAuthContextType {
  platformUser: PlatformUser | null;
  isPlatformAuthenticated: boolean;
  platformLogin: (data: PlatformLoginRequest) => Promise<PlatformAuthResponse>;
  platformSignup: (data: PlatformSignupRequest) => Promise<PlatformAuthResponse>;
  platformLogout: () => void;
  updatePlatformUser: (updates: Partial<PlatformUser>) => void;
  isLoading: boolean;
  checkPlatformTokenExpiry: () => Promise<boolean>;
  getPlatformAuthHeader: () => string | null;
}

const PlatformAuthContext = createContext<PlatformAuthContextType | undefined>(undefined);

// Storage keys for platform auth
const PLATFORM_STORAGE_KEYS = {
  USER: 'platform_user_data',
  TOKEN: 'platformAuthToken',
  REFRESH_TOKEN: 'platformRefreshToken',
  USER_ID: 'platformUserId',
  USER_NAME: 'platformUserName'
} as const;

function normalizeStoredPlatformUser(stored: any): PlatformUser | null {
  if (!stored) return null;
  try {
    const obj = typeof stored === "string" ? JSON.parse(stored) : stored;
    return {
      platformUserId: obj?.platformUserId ?? parseInt(obj?.userId) ?? 0,
      name: obj?.name ?? "",
      email: obj?.email,
      role: obj?.role,
      isActive: obj?.isActive,
      lastLoginTime: obj?.lastLoginTime ?? null,
      loginAttempts: typeof obj?.loginAttempts === "number" ? obj.loginAttempts : 0,
      accountLocked: typeof obj?.accountLocked === "boolean" ? obj.accountLocked : false,
    };
  } catch (error) {
    console.error('Error normalizing stored platform user:', error);
    return null;
  }
}

export const PlatformAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [platformUser, setPlatformUser] = useState<PlatformUser | null>(() => {
    const stored = localStorage.getItem(PLATFORM_STORAGE_KEYS.USER);
    return normalizeStoredPlatformUser(stored);
  });

  const [isLoading, setIsLoading] = useState(false);

  // Check if platform is authenticated
  const isPlatformAuthenticated = platformUser !== null && platformAuthService.isPlatformAuthenticated();

  // Platform login function
  const platformLogin = useCallback(async (data: PlatformLoginRequest): Promise<PlatformAuthResponse> => {
    setIsLoading(true);
    try {
      const response = await platformAuthService.login(data);
      
      if (response.status === "SUCCESS" && response.token) {
        // Store tokens and user data
        platformAuthService.storePlatformTokens(response);
        
        const userData: PlatformUser = {
          platformUserId: response.platformUserId,
          name: response.name,
          role: response.role,
          isActive: response.isActive,
          lastLoginTime: response.lastLoginTime,
          loginAttempts: response.loginAttempts,
          accountLocked: response.accountLocked
        };
        
        localStorage.setItem(PLATFORM_STORAGE_KEYS.USER, JSON.stringify(userData));
        setPlatformUser(userData);
      }
      
      return response;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Platform signup function
  const platformSignup = useCallback(async (data: PlatformSignupRequest): Promise<PlatformAuthResponse> => {
    setIsLoading(true);
    try {
      const response = await platformAuthService.signup(data);
      
      if (response.status === "SUCCESS" && response.token) {
        // Store tokens and user data
        platformAuthService.storePlatformTokens(response);
        
        const userData: PlatformUser = {
          platformUserId: response.platformUserId,
          name: response.name,
          role: response.role,
          isActive: response.isActive,
          lastLoginTime: response.lastLoginTime,
          loginAttempts: response.loginAttempts,
          accountLocked: response.accountLocked
        };
        
        localStorage.setItem(PLATFORM_STORAGE_KEYS.USER, JSON.stringify(userData));
        setPlatformUser(userData);
      }
      
      return response;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Platform logout function
  const platformLogout = useCallback(() => {
    try {
      // Clear platform auth data
      platformAuthService.clearPlatformAuth();
      localStorage.removeItem(PLATFORM_STORAGE_KEYS.USER);
      
      // Clear any additional platform-related storage
      const keysToRemove = [
        'platformAuthToken',
        'platformRefreshToken', 
        'platformUserId',
        'platformUserName',
        PLATFORM_STORAGE_KEYS.USER
      ];
      
      keysToRemove.forEach(key => {
        try {
          localStorage.removeItem(key);
        } catch (e) {
          console.warn(`Failed to remove ${key} from localStorage:`, e);
        }
      });
      
      // Update state
      setPlatformUser(null);
      
      console.log('Platform logout completed successfully');
    } catch (error) {
      console.error('Error during platform logout:', error);
      // Force clear state even if there's an error
      setPlatformUser(null);
    }
  }, []);

  // Update platform user function
  const updatePlatformUser = useCallback((updates: Partial<PlatformUser>) => {
    setPlatformUser(prevUser => {
      if (!prevUser) return null;
      
      const updatedUser = { ...prevUser, ...updates };
      localStorage.setItem(PLATFORM_STORAGE_KEYS.USER, JSON.stringify(updatedUser));
      return updatedUser;
    });
  }, []);

  // Check platform token expiry
  const checkPlatformTokenExpiry = useCallback(async (): Promise<boolean> => {
    return await platformAuthService.ensureValidPlatformToken();
  }, []);

  // Get platform auth header
  const getPlatformAuthHeader = useCallback((): string | null => {
    const tokens = platformAuthService.getPlatformTokens();
    return tokens.token ? `Bearer ${tokens.token}` : null;
  }, []);

  // Initialize platform auth on mount
  useEffect(() => {
    let mounted = true;
    
    const initializePlatformAuth = async () => {
      try {
        setIsLoading(true);
        
        // Check if we have stored platform user and valid token
        const tokens = platformAuthService.getPlatformTokens();
        const storedUser = localStorage.getItem(PLATFORM_STORAGE_KEYS.USER);
        
        if (tokens.token && storedUser && mounted) {
          const userData = normalizeStoredPlatformUser(storedUser);
          if (userData) {
            setPlatformUser(userData);
          }
        }
      } catch (error) {
        console.error('Platform auth initialization failed:', error);
        if (mounted) {
          platformAuthService.clearPlatformAuth();
          localStorage.removeItem(PLATFORM_STORAGE_KEYS.USER);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializePlatformAuth();

    return () => {
      mounted = false;
    };
  }, []);

  const contextValue: PlatformAuthContextType = {
    platformUser,
    isPlatformAuthenticated,
    platformLogin,
    platformSignup,
    platformLogout,
    updatePlatformUser,
    isLoading,
    checkPlatformTokenExpiry,
    getPlatformAuthHeader
  };

  return (
    <PlatformAuthContext.Provider value={contextValue}>
      {children}
    </PlatformAuthContext.Provider>
  );
};

export const usePlatformAuth = (): PlatformAuthContextType => {
  const context = useContext(PlatformAuthContext);
  if (!context) {
    throw new Error("usePlatformAuth must be used within a PlatformAuthProvider");
  }
  return context;
};