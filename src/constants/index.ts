// src/constants/index.ts

/**
 * Centralized constants export
 * Single point of import for all application constants
 */

// App version information
export {
  APP_VERSION,
  isNewerVersion,
  getApiVersionHeader
} from './version';

// App-wide constants
export {
  APP,
  ENVIRONMENT,
  API_CONFIG,
  STORAGE_KEYS,
  DEFAULT_MESSAGES,
  VALIDATION_MESSAGES as APP_VALIDATION_MESSAGES,
  DATE_TIME_FORMATS,
  HTTP_STATUS,
  FILE_UPLOAD,
  NOTIFICATIONS,
  FEATURES
} from './app';

// Authentication constants
export {
  AUTH_FIELDS,
  PASSWORD_STRENGTH,
  AUTH_VALIDATION,
  COUNTRY_CODES,
  AUTH_ERRORS,
  SIGNUP_STEPS
} from './auth';

// API endpoints
export { API_ENDPOINTS } from './apiEndpoints';

// Routes
export * from './routes';

// Theme and styling
export * from './theme';

// UI constants
export {
  PAGINATION,
  DEBOUNCE,
  ANIMATION,
  BREAKPOINTS,
  Z_INDEX,
  LOADING_MESSAGES,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
  TABLE,
  MODAL_SIZES,
  THEME_COLORS
} from './ui';

// User settings options
export * from './userSettingsOptions';

// Re-export commonly used constants with aliases for convenience
export {
  API_CONFIG as ApiConfig,
  STORAGE_KEYS as StorageKeys,
  DEFAULT_MESSAGES as Messages,
  HTTP_STATUS as HttpStatus,
  FEATURES as FeatureFlags
} from './app';

export {
  ROUTES as AppRoutes,
  buildRoute as BuildRoute,
  NAVIGATION as Navigation
} from './routes';

export {
  COLORS as Colors,
  TYPOGRAPHY as Typography,
  SPACING as Spacing,
  THEME_MODES as ThemeModes
} from './theme';

export {
  LOCATION_CONSTANTS as LocationConstants,
  POSTAL_CODE_PATTERNS as PostalCodePatterns
} from './locationConstants';

// Daily Task constants
export * from './dailyTaskConstants';

export type { CountryCode } from './locationConstants';