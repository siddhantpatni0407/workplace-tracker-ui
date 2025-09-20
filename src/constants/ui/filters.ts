// src/constants/ui/filters.ts

/**
 * Filter-related constants for UI components
 * Contains configuration for date ranges, search parameters, and other filter options
 */

// Year filter configuration for dashboard and other components
export const YEAR_FILTER = {
  START_YEAR: 2019,
  get CURRENT_YEAR() {
    return new Date().getFullYear();
  },
  get AVAILABLE_YEARS() {
    const years = [];
    for (let year = this.CURRENT_YEAR; year >= this.START_YEAR; year--) {
      years.push(year);
    }
    return years;
  }
} as const;

// Month filter configuration
export const MONTH_FILTER = {
  OPTIONS: [
    { value: '', label: 'All Months' },
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ]
} as const;

// Status filter configuration for visits/attendance
export const STATUS_FILTER = {
  OPTIONS: [
    { value: '', label: 'All Status' },
    { value: 'WFO', label: 'Work From Office' },
    { value: 'WFH', label: 'Work From Home' },
    { value: 'HOLIDAY', label: 'Holiday' },
    { value: 'LEAVE', label: 'On Leave' }
  ]
} as const;