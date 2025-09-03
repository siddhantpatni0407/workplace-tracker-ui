// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, ReactNode } from "react";

export type Role = "ADMIN" | "USER";

export interface User {
  name: string;
  mobile: string;
  email: string;
  role: Role;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (user: Omit<User, "role"> & { password: string; role: Role }) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // TODO: Call backend API here
      // const response = await axios.post("/api/auth/login", { email, password });
      // setUser(response.data);
      return true;
    } catch (error) {
      console.error("Login failed", error);
      return false;
    }
  };

  const signup = async (newUser: Omit<User, "role"> & { password: string; role: Role }): Promise<boolean> => {
    try {
      // TODO: Call backend API here
      // const response = await axios.post("/api/auth/signup", newUser);
      // setUser(response.data);
      return true;
    } catch (error) {
      console.error("Signup failed", error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    // TODO: Optionally notify backend (invalidate token)
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
