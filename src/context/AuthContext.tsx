// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, ReactNode } from "react";
import { authService, SignupData } from "../services/authService";

export type Role = "ADMIN" | "USER";

export interface User {
  name: string;
  mobileNumber: string;
  email: string;
  role: Role;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (user: SignupData) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(authService.getUser());

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const resp = await authService.login(email, password);
      if (resp.status === "SUCCESS" && resp.token) {
        authService.saveSession(resp);
        setUser({
          name: resp.name!,
          mobileNumber: "", // backend doesn't return mobile on login, skip
          email,
          role: resp.role!,
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login failed", error);
      return false;
    }
  };

  const signup = async (newUser: SignupData): Promise<boolean> => {
    try {
      const resp = await authService.signup(newUser);
      if (resp.status === "SUCCESS" && resp.token) {
        authService.saveSession(resp);
        setUser({
          name: newUser.name,
          mobileNumber: newUser.mobileNumber,
          email: newUser.email,
          role: newUser.role,
        });
        return true;
      } else {
        alert(resp.message); // show backend error e.g. "Email already exists."
      }
      return false;
    } catch (error) {
      console.error("Signup failed", error);
      return false;
    }
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
