import React, { createContext, useContext, useState, ReactNode } from "react";
import { authService, SignupData, AuthResponse } from "../services/authService";

export type Role = "ADMIN" | "USER";

export interface User {
  name: string;
  mobileNumber: string;
  email: string;
  role: Role;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<AuthResponse>;
  signup: (user: SignupData) => Promise<AuthResponse>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(authService.getUser());

  const login = async (email: string, password: string): Promise<AuthResponse> => {
    const resp = await authService.login(email, password);
    if (resp.status === "SUCCESS" && resp.token) {
      authService.saveSession(resp);
      setUser({
        name: resp.name!,
        mobileNumber: "",
        email,
        role: resp.role!,
      });
    }
    return resp;
  };

  const signup = async (newUser: SignupData): Promise<AuthResponse> => {
    const resp = await authService.signup(newUser);
    if (resp.status === "SUCCESS" && resp.token) {
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
