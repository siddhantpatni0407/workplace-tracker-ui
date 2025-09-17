// src/constants/app.ts

/**
 * Application-wide constants
 * Central location for app configuration values
 */

// Application metadata
export const APP = {
  NAME: 'Workplace Tracker',
  VERSION: '1.0.0',
  DESCRIPTION: 'Comprehensive workplace management solution',
  AUTHOR: 'Workplace Tracker Team',
  REPOSITORY: 'https://github.com/siddhantpatni0407/workplace-tracker-ui'
} as const;

// Environment configuration
export const ENVIRONMENT = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
  TESTING: 'testing'
} as const;

// API Configuration
export const API_CONFIG = {
  BASE_URL: 'http://localhost:8010/api/v1/workplace-tracker-service',
  TIMEOUT: 15000,
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
} as const;

// Storage keys for localStorage/sessionStorage
export const STORAGE_KEYS = {
  USER: 'user',
  TOKEN: 'token',
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'workplace_tracker_refresh_token',
  THEME: 'app-theme',
  LANGUAGE: 'i18nextLng',
  USER_SETTINGS: 'user_settings',
  SIDEBAR_STATE: 'sidebar_collapsed',
  LAST_ROUTE: 'last_route',
  LAST_LOGIN_TIME: 'lastLoginTime',
  LAST_LOGIN_SHOWN: 'lastLoginShown'
} as const;

// Default messages
export const DEFAULT_MESSAGES = {
  SUCCESS: {
    SAVE: 'Data saved successfully',
    UPDATE: 'Data updated successfully',
    DELETE: 'Data deleted successfully',
    CREATE: 'Data created successfully',
    RESET: 'Data reset successfully'
  },
  ERROR: {
    GENERIC: 'An unexpected error occurred',
    NETWORK: 'Network error. Please check your connection.',
    UNAUTHORIZED: 'You are not authorized to perform this action',
    FORBIDDEN: 'Access denied',
    NOT_FOUND: 'Resource not found',
    VALIDATION: 'Please check the entered information',
    SAVE_FAILED: 'Failed to save data',
    UPDATE_FAILED: 'Failed to update data',
    DELETE_FAILED: 'Failed to delete data',
    LOAD_FAILED: 'Failed to load data'
  },
  LOADING: {
    DEFAULT: 'Loading...',
    SAVING: 'Saving...',
    UPDATING: 'Updating...',
    DELETING: 'Deleting...',
    CREATING: 'Creating...',
    FETCHING: 'Fetching data...'
  },
  CONFIRMATION: {
    DELETE: 'Are you sure you want to delete this item?',
    UNSAVED_CHANGES: 'You have unsaved changes. Are you sure you want to leave?',
    RESET: 'Are you sure you want to reset all changes?',
    LOGOUT: 'Are you sure you want to logout?'
  }
} as const;

// Form validation messages
export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  EMAIL_INVALID: 'Please enter a valid email address',
  PASSWORD_MIN_LENGTH: 'Password must be at least 8 characters long',
  PASSWORD_STRENGTH: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  PHONE_INVALID: 'Please enter a valid phone number',
  DATE_INVALID: 'Please enter a valid date',
  TIME_INVALID: 'Please enter a valid time',
  NUMBER_INVALID: 'Please enter a valid number',
  URL_INVALID: 'Please enter a valid URL',
  FILE_SIZE_EXCEEDED: 'File size exceeds maximum limit',
  FILE_TYPE_INVALID: 'Invalid file type'
} as const;

// Date and time formats
export const DATE_TIME_FORMATS = {
  DATE: {
    ISO: 'YYYY-MM-DD',
    EU: 'DD/MM/YYYY',
    US: 'MM/DD/YYYY',
    LONG: 'MMMM DD, YYYY',
    SHORT: 'MMM DD, YYYY'
  },
  TIME: {
    TWELVE_HOUR: 'hh:mm A',
    TWENTY_FOUR_HOUR: 'HH:mm',
    WITH_SECONDS: 'HH:mm:ss'
  },
  DATETIME: {
    ISO: 'YYYY-MM-DD HH:mm:ss',
    DISPLAY: 'MMM DD, YYYY hh:mm A',
    FULL: 'MMMM DD, YYYY hh:mm:ss A'
  }
} as const;

// HTTP status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503
} as const;

// File upload constraints
export const FILE_UPLOAD = {
  MAX_SIZE: {
    IMAGE: 5 * 1024 * 1024, // 5MB
    DOCUMENT: 10 * 1024 * 1024, // 10MB
    VIDEO: 50 * 1024 * 1024 // 50MB
  },
  ALLOWED_TYPES: {
    IMAGE: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    DOCUMENT: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    SPREADSHEET: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
    TEXT: ['text/plain', 'text/csv']
  }
} as const;

// Notification settings
export const NOTIFICATIONS = {
  DURATION: {
    SHORT: 3000,
    MEDIUM: 5000,
    LONG: 8000,
    PERSISTENT: 0
  },
  POSITION: {
    TOP_RIGHT: 'top-right',
    TOP_LEFT: 'top-left',
    BOTTOM_RIGHT: 'bottom-right',
    BOTTOM_LEFT: 'bottom-left',
    TOP_CENTER: 'top-center',
    BOTTOM_CENTER: 'bottom-center'
  }
} as const;

// Feature flags
export const FEATURES = {
  DARK_MODE: true,
  NOTIFICATIONS: true,
  ANALYTICS: true,
  EXPORT: true,
  IMPORT: true,
  MULTI_LANGUAGE: true,
  OFFLINE_MODE: false,
  REAL_TIME_UPDATES: false
} as const;