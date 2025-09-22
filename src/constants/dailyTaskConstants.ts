// Daily Task Constants for the workplace tracker application

import { DailyTaskStatus, DailyTaskPriority, DailyTaskType, DailyTaskMonth } from '../enums/DailyTaskEnums';

// Default values
export const DAILY_TASK_DEFAULTS = {
  STATUS: DailyTaskStatus.DRAFT,
  PRIORITY: DailyTaskPriority.MEDIUM,
  TYPE: DailyTaskType.DEVELOPMENT,
  TASK_NUMBER_PREFIX: 'TSK',
  PROJECT_CODE_PREFIX: 'WPT',
  MAX_TASK_NUMBER: 9999,
  MIN_TASK_NUMBER: 1
} as const;

// Date configuration
export const DATE_CONFIG = {
  YEAR_RANGE: {
    PAST_YEARS: 2,
    FUTURE_YEARS: 1
  },
  FORMAT: {
    DISPLAY: 'DD-MM-YYYY',
    API: 'YYYY-MM-DD',
    INPUT: 'YYYY-MM-DD'
  },
  DEFAULT_MONTH: new Date().getMonth() + 1,
  DEFAULT_YEAR: new Date().getFullYear()
} as const;

// Form validation rules
export const VALIDATION_RULES = {
  TASK_NUMBER: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 20,
    PATTERN: /^[A-Z0-9-]+$/,
    REQUIRED: true
  },
  PROJECT_CODE: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 10,
    PATTERN: /^[A-Z0-9-]+$/,
    REQUIRED: true
  },
  PROJECT_NAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 100,
    REQUIRED: true
  },
  STORY_TASK_BUG_NUMBER: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 30,
    PATTERN: /^[A-Z0-9-]+$/,
    REQUIRED: false
  },
  TASK_DETAILS: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 1000,
    REQUIRED: true
  },
  REMARKS: {
    MIN_LENGTH: 0,
    MAX_LENGTH: 500,
    REQUIRED: false
  }
} as const;

// UI configuration
export const UI_CONFIG = {
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    PAGE_SIZE_OPTIONS: [5, 10, 20, 50, 100],
    MAX_VISIBLE_PAGES: 5
  },
  SEARCH: {
    DEBOUNCE_DELAY: 300,
    MIN_SEARCH_LENGTH: 2
  },
  MODAL: {
    ANIMATION_DURATION: 300,
    BACKDROP_DISMISS: true
  },
  TABLE: {
    DEFAULT_SORT_FIELD: 'date',
    DEFAULT_SORT_DIRECTION: 'desc',
    BULK_ACTION_THRESHOLD: 1
  },
  FILTERS: {
    DEFAULT_SHOW_FILTERS: false,
    ANIMATION_DURATION: 300
  }
} as const;

// API configuration
export const API_CONFIG = {
  ENDPOINTS: {
    BASE: '/api/daily-tasks',
    GET_TASKS: '/api/daily-tasks',
    CREATE_TASK: '/api/daily-tasks',
    UPDATE_TASK: '/api/daily-tasks/:id',
    DELETE_TASK: '/api/daily-tasks/:id',
    BULK_UPDATE: '/api/daily-tasks/bulk-update',
    BULK_DELETE: '/api/daily-tasks/bulk-delete',
    EXPORT: '/api/daily-tasks/export'
  },
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000
} as const;

// Export formats
export const EXPORT_CONFIG = {
  CSV: {
    FILENAME_PREFIX: 'daily_tasks_',
    DATE_FORMAT: 'YYYY_MM_DD',
    DELIMITER: ',',
    HEADERS: [
      'Date',
      'Day',
      'Task Number',
      'Project Code',
      'Project Name',
      'Story/Task/Bug Number',
      'Task Details',
      'Remarks',
      'Status',
      'Priority',
      'Type',
      'Created At',
      'Updated At'
    ]
  },
  EXCEL: {
    FILENAME_PREFIX: 'daily_tasks_',
    DATE_FORMAT: 'YYYY_MM_DD',
    SHEET_NAME: 'Daily Tasks',
    AUTO_WIDTH: true
  },
  PDF: {
    FILENAME_PREFIX: 'daily_tasks_',
    DATE_FORMAT: 'YYYY_MM_DD',
    PAGE_SIZE: 'A4',
    ORIENTATION: 'landscape'
  }
} as const;

// Error messages
export const ERROR_MESSAGES = {
  VALIDATION: {
    REQUIRED: 'This field is required',
    INVALID_FORMAT: 'Invalid format',
    MIN_LENGTH: 'Minimum length not met',
    MAX_LENGTH: 'Maximum length exceeded',
    INVALID_DATE: 'Invalid date format',
    FUTURE_DATE: 'Date cannot be in the future',
    INVALID_TASK_NUMBER: 'Task number must contain only letters, numbers, and hyphens',
    INVALID_PROJECT_CODE: 'Project code must contain only letters, numbers, and hyphens'
  },
  API: {
    NETWORK_ERROR: 'Network error occurred. Please check your connection.',
    SERVER_ERROR: 'Server error occurred. Please try again later.',
    UNAUTHORIZED: 'You are not authorized to perform this action.',
    NOT_FOUND: 'Requested resource not found.',
    TIMEOUT: 'Request timed out. Please try again.',
    UNKNOWN: 'An unknown error occurred.'
  },
  BULK_OPERATIONS: {
    NO_SELECTION: 'Please select at least one task to perform bulk operations.',
    UPDATE_FAILED: 'Some tasks could not be updated. Please try again.',
    DELETE_FAILED: 'Some tasks could not be deleted. Please try again.'
  }
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  TASK_CREATED: 'Task created successfully',
  TASK_UPDATED: 'Task updated successfully',
  TASK_DELETED: 'Task deleted successfully',
  BULK_UPDATE: 'Selected tasks updated successfully',
  BULK_DELETE: 'Selected tasks deleted successfully',
  EXPORT_SUCCESS: 'Data exported successfully',
  FILTERS_APPLIED: 'Filters applied successfully'
} as const;

// Toast configuration
export const TOAST_CONFIG = {
  POSITION: 'top-right' as const,
  AUTO_CLOSE: 3000,
  HIDE_PROGRESS_BAR: false,
  CLOSE_ON_CLICK: true,
  PAUSE_ON_HOVER: true,
  DRAGGABLE: true
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  DAILY_TASKS: 'dailyTasks',
  FILTERS: 'dailyTaskFilters',
  SORT_PREFERENCES: 'dailyTaskSortPreferences',
  VIEW_PREFERENCES: 'dailyTaskViewPreferences',
  PAGINATION_SIZE: 'dailyTaskPaginationSize'
} as const;

// Theme colors
export const THEME_COLORS = {
  PRIMARY: '#0d6efd',
  SECONDARY: '#6c757d',
  SUCCESS: '#198754',
  DANGER: '#dc3545',
  WARNING: '#fd7e14',
  INFO: '#0dcaf0',
  LIGHT: '#f8f9fa',
  DARK: '#212529'
} as const;

// Animation durations (in milliseconds)
export const ANIMATION_DURATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 600
} as const;

// Breakpoints for responsive design
export const BREAKPOINTS = {
  XS: 0,
  SM: 576,
  MD: 768,
  LG: 992,
  XL: 1200,
  XXL: 1400
} as const;