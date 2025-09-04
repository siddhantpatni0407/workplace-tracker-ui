// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, ReactNode } from "react";
import { authService, SignupData, AuthResponse } from "../services/authService";
import { Role } from "../types/auth";

export interface User {
  name: string;
  mobileNumber?: string;
  email?: string;
  role?: Role;
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
    return stored ? { name: stored.name, mobileNumber: stored.mobileNumber, role: stored.role } : null;
  });

  /**
   * Return the full AuthResponse so pages (Login.tsx) can read message/status.
   */
  const login = async (email: string, password: string): Promise<AuthResponse> => {
    const resp = await authService.login(email, password);

    if (resp.status === "SUCCESS" && resp.token) {
      // save token + user
      authService.saveSession(resp);
      setUser({
        name: resp.name ?? "",
        email,
        role: resp.role ?? undefined,
      });
    }

    return resp;
  };

  const signup = async (newUser: SignupData): Promise<AuthResponse> => {
    const resp = await authService.signup(newUser);

    if (resp.status === "SUCCESS" && resp.token) {
      // Save session (backend provided token on signup)
      authService.saveSession(resp);
      setUser({
        name: newUser.name,
        mobileNumber: newUser.mobileNumber,
        email: newUser.email,
        role: newUser.role,
      });
    }

    return resp;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
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
