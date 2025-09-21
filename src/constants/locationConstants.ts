// Location-related constants
export const LOCATION_CONSTANTS = {
  // API URLs
  ZIPPOPOTAM_BASE_URL: 'http://api.zippopotam.us',
  
  // Timeouts
  API_TIMEOUT: 5000,
  
  // Cache settings
  CACHE_EXPIRY_MS: 30 * 60 * 1000, // 30 minutes
  
  // Special values
  OTHER_CITY_VALUE: 'other',
  OTHER_CITY_LABEL: 'Other (Enter manually)',
  
  // Default messages
  NO_OPTIONS_MESSAGE: 'No options available',
  SELECT_COUNTRY_FIRST: 'Select country first',
  SELECT_STATE_FIRST: 'Select state first',
  
  // Validation
  DEFAULT_POSTAL_CODE_PATTERN: /^[\w\s-]{3,10}$/,
  MIN_SEARCH_LENGTH: 1,
  MAX_RESULTS_DEFAULT: 100
} as const;

// Postal code validation patterns by country
export const POSTAL_CODE_PATTERNS = {
  US: /^\d{5}(-\d{4})?$/,
  CA: /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/,
  GB: /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i,
  DE: /^\d{5}$/,
  FR: /^\d{5}$/,
  IN: /^\d{6}$/,
  AU: /^\d{4}$/,
  JP: /^\d{3}-\d{4}$/,
  CN: /^\d{6}$/,
  BR: /^\d{5}-?\d{3}$/,
  IT: /^\d{5}$/,
  ES: /^\d{5}$/,
  NL: /^\d{4} ?[A-Z]{2}$/i,
  SE: /^\d{3} ?\d{2}$/,
  NO: /^\d{4}$/,
  DK: /^\d{4}$/,
  FI: /^\d{5}$/,
  CH: /^\d{4}$/,
  AT: /^\d{4}$/,
  BE: /^\d{4}$/,
  LU: /^\d{4}$/,
  IE: /^[A-Z]\d{2}( ?\w{4})?$/i,
  PT: /^\d{4}-\d{3}$/,
  GR: /^\d{3} ?\d{2}$/,
  PL: /^\d{2}-\d{3}$/,
  CZ: /^\d{3} ?\d{2}$/,
  SK: /^\d{3} ?\d{2}$/,
  HU: /^\d{4}$/,
  RO: /^\d{6}$/,
  BG: /^\d{4}$/,
  HR: /^\d{5}$/,
  SI: /^\d{4}$/,
  EE: /^\d{5}$/,
  LV: /^LV-\d{4}$/,
  LT: /^LT-\d{5}$/,
  MT: /^[A-Z]{3} ?\d{4}$/i,
  CY: /^\d{4}$/
} as const;

export type CountryCode = keyof typeof POSTAL_CODE_PATTERNS;