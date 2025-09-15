// src/constants/ui/index.ts

// Pagination constants
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 20, 50, 100],
  MAX_VISIBLE_PAGES: 5
} as const;

// Debounce timing
export const DEBOUNCE = {
  SEARCH: 300,
  TYPING: 150,
  RESIZE: 100,
  SCROLL: 50
} as const;

// Animation durations (in milliseconds)
export const ANIMATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  VERY_SLOW: 1000
} as const;

// Breakpoints (matches Bootstrap 5)
export const BREAKPOINTS = {
  XS: 0,
  SM: 576,
  MD: 768,
  LG: 992,
  XL: 1200,
  XXL: 1400
} as const;

// Z-index layers
export const Z_INDEX = {
  BASE: 1,
  DROPDOWN: 1000,
  STICKY: 1020,
  FIXED: 1030,
  MODAL_BACKDROP: 1040,
  MODAL: 1050,
  POPOVER: 1060,
  TOOLTIP: 1070,
  TOAST: 1080,
  MAXIMUM: 2147483647 // Max 32-bit integer
} as const;

// Form validation messages
export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  EMAIL: 'Please enter a valid email address',
  PHONE: 'Please enter a valid phone number',
  PASSWORD_MIN: 'Password must be at least 8 characters',
  PASSWORD_MATCH: 'Passwords do not match',
  MIN_LENGTH: (min: number) => `Must be at least ${min} characters`,
  MAX_LENGTH: (max: number) => `Must be no more than ${max} characters`,
  MIN_VALUE: (min: number) => `Must be at least ${min}`,
  MAX_VALUE: (max: number) => `Must be no more than ${max}`,
  PATTERN: 'Invalid format',
  DATE_FUTURE: 'Date must be in the future',
  DATE_PAST: 'Date must be in the past',
  FILE_SIZE: (maxSizeMB: number) => `File size must be less than ${maxSizeMB}MB`,
  FILE_TYPE: 'Invalid file type'
} as const;

// Loading messages
export const LOADING_MESSAGES = {
  DEFAULT: 'Loading...',
  SAVING: 'Saving...',
  DELETING: 'Deleting...',
  SUBMITTING: 'Submitting...',
  UPLOADING: 'Uploading...',
  PROCESSING: 'Processing...',
  AUTHENTICATING: 'Authenticating...',
  FETCHING: 'Fetching data...',
  REFRESHING: 'Refreshing...'
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  SAVED: 'Successfully saved',
  DELETED: 'Successfully deleted',
  CREATED: 'Successfully created',
  UPDATED: 'Successfully updated',
  SUBMITTED: 'Successfully submitted',
  UPLOADED: 'Successfully uploaded',
  SENT: 'Successfully sent',
  COPIED: 'Copied to clipboard',
  IMPORTED: 'Successfully imported',
  EXPORTED: 'Successfully exported'
} as const;

// Error messages
export const ERROR_MESSAGES = {
  GENERIC: 'Something went wrong. Please try again.',
  NETWORK: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION: 'Please correct the errors and try again.',
  FILE_TOO_LARGE: 'File is too large.',
  UNSUPPORTED_FORMAT: 'Unsupported file format.',
  SESSION_EXPIRED: 'Your session has expired. Please log in again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  TIMEOUT: 'Request timed out. Please try again.'
} as const;

// Date and time formats
export const DATE_FORMATS = {
  ISO: 'yyyy-MM-dd',
  EU: 'dd/MM/yyyy',
  US: 'MM/dd/yyyy',
  DISPLAY: 'dd MMM yyyy',
  DISPLAY_LONG: 'dd MMMM yyyy',
  TIME_24: 'HH:mm',
  TIME_12: 'h:mm a',
  DATETIME: 'dd MMM yyyy, HH:mm',
  DATETIME_LONG: 'dd MMMM yyyy, h:mm a'
} as const;

// File upload constraints
export const FILE_UPLOAD = {
  MAX_SIZE_MB: 10,
  ALLOWED_TYPES: {
    IMAGES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    DOCUMENTS: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    EXCEL: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
    ALL: ['*']
  },
  MAX_FILES: 5
} as const;

// Table configuration
export const TABLE = {
  ROWS_PER_PAGE_OPTIONS: [10, 25, 50, 100],
  DEFAULT_ROWS_PER_PAGE: 10,
  MAX_COLUMN_WIDTH: 300,
  MIN_COLUMN_WIDTH: 50
} as const;

// Modal sizes
export const MODAL_SIZES = {
  SMALL: 'modal-sm',
  MEDIUM: '',
  LARGE: 'modal-lg',
  EXTRA_LARGE: 'modal-xl'
} as const;

// Theme colors (CSS custom properties)
export const THEME_COLORS = {
  PRIMARY: 'var(--bs-primary)',
  SECONDARY: 'var(--bs-secondary)',
  SUCCESS: 'var(--bs-success)',
  DANGER: 'var(--bs-danger)',
  WARNING: 'var(--bs-warning)',
  INFO: 'var(--bs-info)',
  LIGHT: 'var(--bs-light)',
  DARK: 'var(--bs-dark)'
} as const;