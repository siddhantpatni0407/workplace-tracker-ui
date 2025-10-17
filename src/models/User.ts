// src/models/User.ts
// Note: This file expects src/models/Api.ts to export `ApiResponse` and `ApiError`.
// Example usage in code: import { ApiResponse } from './Api';

import { UserRole } from '../enums/UserEnums';

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



// User status for filtering and display
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'LOCKED' | 'ALL';

// Sorting options for user lists
export type UserSortField = 'name' | 'email' | 'role' | 'lastLoginTime' | 'createdAt';
export type SortDirection = 'asc' | 'desc' | null;

export interface UserSortConfig {
  field: UserSortField;
  direction: SortDirection;
}

///////////////////////////////////////////////////////////////////////////////
// Profile / Address types
///////////////////////////////////////////////////////////////////////////////

/**
 * Address DTO (user_address)
 */
export interface UserAddress {
  userAddressId?: number | null;
  userId?: number | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  postalCode?: string | null;
  isPrimary?: boolean | null;
  createdDate?: string | null;   // ISO timestamp from backend
  modifiedDate?: string | null;
}

/**
 * User profile shape returned by the backend (and used in the UI form).
 * The frontend keeps flat address fields for easy binding, but the API
 * returns/accepts nested `primaryAddress`. We keep both here for mapping convenience.
 */
export interface UserProfileData {
  userProfileId?: number | null;
  userId?: number | null;
  username?: string | null;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  phoneNumber?: string | null;

  // flat fields (used in form inputs). Service maps these to/from primaryAddress when calling API.
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  postalCode?: string | null;

  dateOfBirth?: string | null; // ISO date string e.g. "1995-09-16"
  gender?: string | null;
  department?: string | null;
  position?: string | null;
  employeeId?: string | null;
  dateOfJoining?: string | null; // ISO date string
  profilePicture?: string | null;
  bio?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  emergencyContactRelation?: string | null;

  // nested primary address returned by API (preferred source of truth)
  primaryAddress?: UserAddress | null;

  // timestamps coming from backend (OffsetDateTime as ISO string)
  createdDate?: string | null;
  modifiedDate?: string | null;
}

///////////////////////////////////////////////////////////////////////////////
// Convenience / UI types
///////////////////////////////////////////////////////////////////////////////

export interface UserListItem {
  userId: number;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  lastLoginTime?: string | null;
  createdAt?: string | null;
}

export type UserProfileUpdatePayload = Partial<UserProfileData> & { userId: number };
