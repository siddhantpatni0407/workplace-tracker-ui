// src/models/User.ts

export interface BaseUser {
  userId?: number;
  name: string;
  email: string;
  mobileNumber: string;
  role: UserRole;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface User extends BaseUser {
  lastLoginTime?: string | null;
  loginAttempts?: number | null;
  accountLocked?: boolean | null;
  settings?: UserSettings;
}

export interface UserSettings {
  userId: number;
  language?: string;
  dateFormat?: string;
  weekStartDay?: number;
  theme?: 'light' | 'dark' | 'auto';
  notifications?: NotificationSettings;
  timezone?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  leaveApproval: boolean;
  holidayReminders: boolean;
  taskDeadlines: boolean;
}

export interface UserFormData {
  name: string;
  email: string;
  mobileNumber: string;
  role: UserRole;
  password?: string;
}

export interface UserUpdatePayload extends Partial<BaseUser> {
  userId: number;
}

export interface UserStatusUpdatePayload {
  userId: number;
  isActive: boolean;
  reason?: string;
}

// User role type
export type UserRole = 'ADMIN' | 'USER';

// User status for filtering and display
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'LOCKED' | 'ALL';

// Sorting options for user lists
export type UserSortField = 'name' | 'email' | 'role' | 'lastLoginTime' | 'createdAt';
export type SortDirection = 'asc' | 'desc' | null;

export interface UserSortConfig {
  field: UserSortField;
  direction: SortDirection;
}