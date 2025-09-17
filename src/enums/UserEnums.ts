// src/enums/UserEnums.ts

export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  LOCKED = 'LOCKED',
  ALL = 'ALL'
}

export enum UserSortField {
  NAME = 'name',
  EMAIL = 'email', 
  ROLE = 'role',
  LAST_LOGIN = 'lastLoginTime',
  CREATED_AT = 'createdAt'
}

export enum SortDirection {
  ASC = 'asc',
  DESC = 'desc'
}

export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
  AUTO = 'auto'
}

export enum Language {
  ENGLISH = 'English',
  HINDI = 'Hindi',
  SPANISH = 'Spanish',
  FRENCH = 'French'
}

export enum DateFormat {
  ISO = 'yyyy-MM-dd',
  EU = 'dd-MM-yyyy',
  US = 'MM-dd-yyyy',
  LONG = 'dd MMMM yyyy'
}

export enum WeekStartDay {
  SUNDAY = 0,
  MONDAY = 1,
  TUESDAY = 2,
  WEDNESDAY = 3,
  THURSDAY = 4,
  FRIDAY = 5,
  SATURDAY = 6
}

// Display labels for enums
export const UserRoleLabels: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'Administrator',
  [UserRole.USER]: 'User'
};

export const UserStatusLabels: Record<UserStatus, string> = {
  [UserStatus.ACTIVE]: 'Active',
  [UserStatus.INACTIVE]: 'Inactive', 
  [UserStatus.LOCKED]: 'Locked',
  [UserStatus.ALL]: 'All Status'
};

export const ThemeLabels: Record<Theme, string> = {
  [Theme.LIGHT]: 'Light',
  [Theme.DARK]: 'Dark',
  [Theme.AUTO]: 'Auto'
};

export const LanguageLabels: Record<Language, string> = {
  [Language.ENGLISH]: 'English',
  [Language.HINDI]: 'हिंदी',
  [Language.SPANISH]: 'Español',
  [Language.FRENCH]: 'Français'
};

export const DateFormatLabels: Record<DateFormat, string> = {
  [DateFormat.ISO]: 'yyyy-MM-dd (2025-09-15)',
  [DateFormat.EU]: 'dd-MM-yyyy (15-09-2025)',
  [DateFormat.US]: 'MM-dd-yyyy (09-15-2025)',
  [DateFormat.LONG]: 'dd MMMM yyyy (15 September 2025)'
};

export const WeekStartDayLabels: Record<WeekStartDay, string> = {
  [WeekStartDay.SUNDAY]: 'Sunday',
  [WeekStartDay.MONDAY]: 'Monday',
  [WeekStartDay.TUESDAY]: 'Tuesday',
  [WeekStartDay.WEDNESDAY]: 'Wednesday',
  [WeekStartDay.THURSDAY]: 'Thursday',
  [WeekStartDay.FRIDAY]: 'Friday',
  [WeekStartDay.SATURDAY]: 'Saturday'
};