// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, ReactNode } from "react";
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
  login: (email: string, password: string) => Promise<AuthResponse>;
  signup: (user: SignupData) => Promise<AuthResponse>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = authService.getUser();
    return stored ? stored : null;
  });

  const login = async (email: string, password: string): Promise<AuthResponse> => {
    const resp = await authService.login(email, password);

    if (resp.status === "SUCCESS" && resp.token) {
      authService.saveSession(resp);

      setUser({
        userId: resp.userId ?? undefined,
        name: resp.name ?? "",
        email,
        role: resp.role ?? undefined,
        isActive: resp.isActive ?? undefined,
        lastLoginTime: resp.lastLoginTime ?? null,
        loginAttempts: resp.loginAttempts ?? null,
        accountLocked: resp.accountLocked ?? null,
      });

      // ✅ mark popup to show only once after login
      localStorage.setItem("lastLoginShown", "false");
    }

    return resp;
  };

  const signup = async (newUser: SignupData): Promise<AuthResponse> => {
    const resp = await authService.signup(newUser);

    if (resp.status === "SUCCESS" && resp.token) {
      authService.saveSession(resp);

      setUser({
        userId: resp.userId ?? undefined,
        name: newUser.name,
        mobileNumber: newUser.mobileNumber,
        email: newUser.email,
        role: newUser.role,
        lastLoginTime: resp.lastLoginTime ?? null,
        isActive: resp.isActive ?? undefined,
        loginAttempts: resp.loginAttempts ?? null,
        accountLocked: resp.accountLocked ?? null,
      });

      localStorage.setItem("lastLoginShown", "false");
    }

    return resp;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    localStorage.removeItem("lastLoginShown");
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
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
