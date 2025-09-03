// src/services/authService.ts
import { User, Role } from "../context/AuthContext";

interface SignupData extends User {
  password: string;
}

export const authService = {
  signup: (data: SignupData): User => {
    // Save user info in localStorage
    localStorage.setItem("user", JSON.stringify(data));
    return { name: data.name, mobile: data.mobile, email: data.email, role: data.role };
  },

  login: (email: string, password: string): User | null => {
    const stored = localStorage.getItem("user");
    if (stored) {
      const saved: SignupData = JSON.parse(stored);
      if (saved.email === email && saved.password === password) {
        return { name: saved.name, mobile: saved.mobile, email: saved.email, role: saved.role };
      }
    }
    return null;
  },

  logout: () => {
    localStorage.removeItem("user");
  },

  getUser: (): User | null => {
    const stored = localStorage.getItem("user");
    if (!stored) return null;
    const parsed: SignupData = JSON.parse(stored);
    return { name: parsed.name, mobile: parsed.mobile, email: parsed.email, role: parsed.role };
  },
};
