// src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback, useMemo } from "react";
import { authService, SignupData, AuthResponse } from "../services/authService";
import { UserRole } from "../enums";
import i18n from "../i18n";
import UserSettingsService from "../services/userSettingsService";

// Legacy compatibility - keep the old interface temporarily
export interface User {
  userId?: number;
  name: string;
  mobileNumber?: string;
  email?: string;
  role?: UserRole;
  isActive?: boolean;
  lastLoginTime?: string | null;
  loginAttempts?: number | null;
  accountLocked?: boolean | null;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, options?: { mathCaptchaAnswer?: string }) => Promise<AuthResponse>;
  signup: (user: SignupData) => Promise<AuthResponse>;
  logout: () => void;
  tryRefresh: () => Promise<boolean>;
  updateUser: (updates: Partial<User>) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Storage keys
const STORAGE_KEYS = {
  USER: 'workplace_tracker_user',
  TOKEN: 'workplace_tracker_token',
  REFRESH_TOKEN: 'workplace_tracker_refresh_token'
} as const;

function normalizeStoredUser(raw: any): User | null {
  if (!raw) return null;
  try {
    // if raw is a stringified JSON, parse it
    const obj = typeof raw === "string" ? JSON.parse(raw) : raw;
    return {
      userId: obj?.userId ?? obj?.id,
      name: obj?.name ?? "",
      mobileNumber: obj?.mobileNumber ?? obj?.mobile,
      email: obj?.email ?? obj?.username,
      role: obj?.role as UserRole,
      isActive: obj?.isActive,
      lastLoginTime: obj?.lastLoginTime ?? null,
      loginAttempts: typeof obj?.loginAttempts === "number" ? obj.loginAttempts : null,
      accountLocked: typeof obj?.accountLocked === "boolean" ? obj.accountLocked : null,
    };
  } catch (error) {
    console.error('Error normalizing stored user:', error);
    return null;
  }
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = authService.getUser();
    return normalizeStoredUser(stored);
  });

  const [isLoading, setIsLoading] = useState(false);

  // Attempt to refresh token on app mount (if refresh cookie present)
  useEffect(() => {
    let mounted = true;
    const init = async () => {
      try {
        setIsLoading(true);
        const refreshed = await authService.refresh();
        if (refreshed?.status === "SUCCESS" && (refreshed.accessToken || refreshed.token)) {
          authService.saveSession(refreshed);
          if (!mounted) return;
          const u = normalizeStoredUser(authService.getUser());
          setUser(u);
          localStorage.setItem("lastLoginShown", "false");
        }
      } catch {
        // ignore - user stays unauthenticated
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };
    init();
    return () => { mounted = false; };
  }, []);

  // Helper function to load user settings after successful authentication
  const loadUserSettingsAfterAuth = useCallback(async (userId: number) => {
    try {
      await UserSettingsService.loadAndApplyUserSettings(userId);
    } catch (error) {
      console.warn('Failed to load user settings after authentication:', error);
      // Don't block authentication flow if settings fail to load
    }
  }, []);

  const tryRefresh = useCallback(async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      const refreshed = await authService.refresh();
      if (refreshed?.status === "SUCCESS" && (refreshed.accessToken || refreshed.token)) {
        authService.saveSession(refreshed);
        const u = normalizeStoredUser(authService.getUser());
        setUser(u);

        // Load user settings and apply language preference after session refresh
        if (u?.userId) {
          await loadUserSettingsAfterAuth(u.userId);
        }

        return true;
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
    return false;
  }, [loadUserSettingsAfterAuth]);

  const login = useCallback(async (email: string, password: string, options?: { mathCaptchaAnswer?: string }): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const resp = await authService.login(email, password, options);

      if (resp.status === "SUCCESS" && (resp.accessToken || resp.token)) {
        authService.saveSession(resp);
        const saved = normalizeStoredUser(authService.getUser());

        const newUser = saved ?? {
          userId: resp.userId ?? undefined,
          name: resp.name ?? "",
          email,
          role: resp.role as UserRole ?? undefined,
          isActive: resp.isActive ?? undefined,
          lastLoginTime: resp.lastLoginTime ?? null,
          loginAttempts: resp.loginAttempts ?? null,
          accountLocked: resp.accountLocked ?? null,
        };

        setUser(newUser);

        // Load user settings and apply language preference after successful login
        if (newUser.userId) {
          await loadUserSettingsAfterAuth(newUser.userId);
        }

        localStorage.setItem("lastLoginShown", "false");
      }

      return resp;
    } finally {
      setIsLoading(false);
    }
  }, [loadUserSettingsAfterAuth]);

  const signup = useCallback(async (newUser: SignupData): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const resp = await authService.signup(newUser);

      if (resp.status === "SUCCESS" && (resp.accessToken || resp.token)) {
        authService.saveSession(resp);
        const saved = normalizeStoredUser(authService.getUser());

        setUser(
          saved ?? {
            userId: resp.userId ?? undefined,
            name: newUser.name,
            mobileNumber: (newUser as any).mobileNumber ?? (newUser as any).mobile ?? undefined,
            email: (newUser as any).email,
            role: (newUser as any).role as UserRole,
            lastLoginTime: resp.lastLoginTime ?? null,
            isActive: resp.isActive ?? undefined,
            loginAttempts: resp.loginAttempts ?? null,
            accountLocked: resp.accountLocked ?? null,
          }
        );

        localStorage.setItem("lastLoginShown", "false");
      }

      return resp;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setIsLoading(true);
    try {
      authService.logout();
      setUser(null);
      localStorage.removeItem("lastLoginShown");
      
      // Language will be automatically reset to English by the useEffect
      // when isAuthenticated becomes false
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateUser = useCallback((updates: Partial<User>) => {
    setUser(currentUser => {
      if (!currentUser) return null;
      
      const updatedUser = { ...currentUser, ...updates };
      
      // Save to storage if auth service supports it
      try {
        const userData = JSON.stringify(updatedUser);
        localStorage.setItem(STORAGE_KEYS.USER, userData);
      } catch (error) {
        console.error('Failed to save updated user to storage:', error);
      }
      
      return updatedUser;
    });
  }, []);

  const isAuthenticated = useMemo(() => !!user, [user]);

  // Initialize language based on authentication state
  useEffect(() => {
    i18n.initializeForAuthState(isAuthenticated);
  }, [isAuthenticated]);

  const contextValue = useMemo(() => ({
    user,
    isAuthenticated,
    login,
    signup,
    logout,
    tryRefresh,
    updateUser,
    isLoading
  }), [user, isAuthenticated, login, signup, logout, tryRefresh, updateUser, isLoading]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
