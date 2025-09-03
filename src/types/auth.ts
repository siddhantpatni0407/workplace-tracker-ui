// src/types/auth.ts
export type Role = "ADMIN" | "USER";

export interface LoginCredentials {
  username: string; // for login (we’ll use email as username)
  password: string;
}

export interface SignupData {
  name: string;
  mobile: string;
  email: string;
  password: string;
  role: Role;
}

export interface User {
  id: number;
  name: string;
  mobile: string;
  email: string;
  username: string; // same as email
  password: string;
  role: Role;
}
