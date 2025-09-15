// src/models/Holiday.ts

export interface Holiday {
  holidayId?: number;
  name: string;
  date: string; // yyyy-MM-dd
  type: HolidayType;
  description?: string;
  isRecurring: boolean;
  location?: string;
  department?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: number;
}

export interface HolidayFormData {
  name: string;
  date: string;
  type: HolidayType;
  description?: string;
  isRecurring: boolean;
  location?: string;
  department?: string;
}

export interface HolidayFilters {
  year: number;
  month: string; // 'ALL' | '01' | '02' | ... | '12'
  type: HolidayTypeFilter;
  searchQuery: string;
  dateFrom?: string;
  dateTo?: string;
  quickFilter: HolidayQuickFilter;
}

// Holiday Types
export type HolidayType = 'MANDATORY' | 'OPTIONAL';
export type HolidayTypeFilter = HolidayType | 'ALL';
export type HolidayQuickFilter = 'ALL' | 'UPCOMING' | 'TODAY' | 'THIS_MONTH';

// Month options for filtering
export interface MonthOption {
  value: string;
  label: string;
}

// Holiday analytics
export interface HolidayStats {
  total: number;
  mandatory: number;
  optional: number;
  upcoming: number;
  thisMonth: number;
  byMonth: Array<{
    month: string;
    count: number;
  }>;
}