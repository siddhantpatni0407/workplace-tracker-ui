// src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback, useMemo } from "react";
import { authService, SignupData, AuthResponse } from "../services/authService";
import { Role } from "../types/auth";

export interface User {
  userId?: number;
  name: string;
  mobileNumber?: string;
  email?: string;
  role?: Role;
  isActive?: boolean;
  lastLoginTime?: string | null;
  loginAttempts?: number | null;
  accountLocked?: boolean | null;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  signup: (user: SignupData) => Promise<AuthResponse>;
  logout: () => void;
  tryRefresh: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
      role: obj?.role,
      isActive: obj?.isActive,
      lastLoginTime: obj?.lastLoginTime ?? null,
      loginAttempts: typeof obj?.loginAttempts === "number" ? obj.loginAttempts : null,
      accountLocked: typeof obj?.accountLocked === "boolean" ? obj.accountLocked : null,
    };
  } catch {
    return null;
  }
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = authService.getUser();
    return normalizeStoredUser(stored);
  });

  // Attempt to refresh token on app mount (if refresh cookie present)
  useEffect(() => {
    let mounted = true;
    const init = async () => {
      try {
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
      }
    };
    init();
    return () => { mounted = false; };
  }, []);

  const tryRefresh = useCallback(async (): Promise<boolean> => {
    try {
      const refreshed = await authService.refresh();
      if (refreshed?.status === "SUCCESS" && (refreshed.accessToken || refreshed.token)) {
        authService.saveSession(refreshed);
        const u = normalizeStoredUser(authService.getUser());
        setUser(u);
        return true;
      }
    } catch {
      // ignore
    }
    return false;
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<AuthResponse> => {
    const resp = await authService.login(email, password);

    if (resp.status === "SUCCESS" && (resp.accessToken || resp.token)) {
      authService.saveSession(resp);
      const saved = normalizeStoredUser(authService.getUser());

      setUser(
        saved ?? {
          userId: resp.userId ?? undefined,
          name: resp.name ?? "",
          email,
          role: resp.role ?? undefined,
          isActive: resp.isActive ?? undefined,
          lastLoginTime: resp.lastLoginTime ?? null,
          loginAttempts: resp.loginAttempts ?? null,
          accountLocked: resp.accountLocked ?? null,
        }
      );

      localStorage.setItem("lastLoginShown", "false");
    }

    return resp;
  }, []);

  const signup = useCallback(async (newUser: SignupData): Promise<AuthResponse> => {
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
          role: (newUser as any).role,
          lastLoginTime: resp.lastLoginTime ?? null,
          isActive: resp.isActive ?? undefined,
          loginAttempts: resp.loginAttempts ?? null,
          accountLocked: resp.accountLocked ?? null,
        }
      );

      localStorage.setItem("lastLoginShown", "false");
    }

    return resp;
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    localStorage.removeItem("lastLoginShown");
  }, []);

  const isAuthenticated = useMemo(() => !!user, [user]);

  const contextValue = useMemo(() => ({
    user,
    isAuthenticated,
    login,
    signup,
    logout,
    tryRefresh
  }), [user, isAuthenticated, login, signup, logout, tryRefresh]);

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
