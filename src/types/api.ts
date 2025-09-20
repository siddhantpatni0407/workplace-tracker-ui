// src/types/api.ts
export interface ResponseDTO<T = any> {
  status?: string;
  message?: string;
  data?: T;
}

// Pagination interface for API responses
export interface PaginationData {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

// Special Days API Types
export interface SpecialDayRecord {
  userId: number;
  name: string;
  email: string;
  designation: string;
  city: string;
  country: string;
  dateOfBirth: string; // ISO date string
  dateOfJoining: string; // ISO date string
}

export interface SpecialDaysData {
  // For current-month endpoint
  birthdays?: SpecialDayRecord[];
  anniversaries?: SpecialDayRecord[];
  
  // For main endpoints  
  records?: SpecialDayRecord[];
  
  // Common properties
  counts?: {
    birthdays: number;
    anniversaries: number;
    total: number;
  };
  pagination?: PaginationData;
}

export interface SpecialDaysResponse extends ResponseDTO<SpecialDaysData> {
  status: "SUCCESS" | "ERROR";
  message: string;
  data?: SpecialDaysData;
}

// Special Days Request Parameters
export interface SpecialDaysRequestParams {
  month?: number;
  year?: number;
  page?: number;
  limit?: number;
}
