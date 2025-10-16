// src/constants/auth.ts

/**
 * Authentication-related constants
 * Central location for auth configuration values and text
 */

// Authentication form field placeholders and labels
export const AUTH_FIELDS = {
  // Form Labels
  LABELS: {
    EMAIL: 'auth.email',
    PASSWORD: 'auth.password',
    FULL_NAME: 'auth.fullName',
    MOBILE_NUMBER: 'auth.mobileNumber',
    CONFIRM_PASSWORD: 'auth.confirmPassword',
    ROLE: 'auth.role',
    PLATFORM_USER_CODE: 'auth.platformUserCode',
    TENANT_CODE: 'auth.tenantCode',
    TENANT_USER_CODE: 'auth.tenantUserCode',
    ACCEPT_TERMS: 'auth.acceptTerms',
    CAPTCHA_VERIFICATION: 'auth.captchaVerification',
    CAPTCHA_LABEL: 'auth.captchaLabel'
  },
  
  // Form Placeholders
  PLACEHOLDERS: {
    EMAIL: 'auth.emailPlaceholder',
    EMAIL_ADDRESS: 'auth.emailAddressPlaceholder',
    PASSWORD: 'auth.passwordPlaceholder',
    CREATE_PASSWORD: 'auth.createPasswordPlaceholder',
    CONFIRM_PASSWORD: 'auth.confirmPasswordPlaceholder',
    FULL_NAME: 'auth.fullNamePlaceholder',
    MOBILE_NUMBER: 'auth.mobileNumberPlaceholder',
    PLATFORM_USER_CODE: 'auth.platformUserCodePlaceholder',
    TENANT_CODE: 'auth.tenantCodePlaceholder',
    TENANT_USER_CODE: 'auth.tenantUserCodePlaceholder',
    CAPTCHA: 'auth.captchaPlaceholder',
    ENTER_CAPTCHA: 'auth.enterCaptcha'
  },
  
  // Helper Text
  HELPERS: {
    PASSWORD_STRENGTH: 'auth.passwordStrengthHint',
    CAPTCHA_HELP: 'auth.captchaHelp'
  },
  
  // Buttons & Actions
  BUTTONS: {
    LOGIN: 'auth.login',
    SIGNUP: 'auth.signup',
    LOGGING_IN: 'auth.loggingIn',
    CREATING: 'auth.creating',
    GO_TO_HOME: 'auth.goToHome'
  },
  
  // Links & Navigation
  LINKS: {
    TERMS_CONDITIONS: 'auth.termsAndConditions',
    HAVE_ACCOUNT: 'auth.haveAccount',
    NO_ACCOUNT: 'auth.noAccount',
    SIGNIN: 'auth.signin'
  },
  
  // Headers & Titles
  HEADERS: {
    WELCOME: 'auth.welcome',
    LOGIN_SUBTITLE: 'auth.loginSubtitle',
    CREATE_ACCOUNT: 'auth.createAccount',
    SIGNUP_SUBTITLE: 'auth.signupSubtitle',
    SIGNUP_SUCCESS: 'auth.signupSuccessTitle'
  },
  
  // Social Sign-in/up
  SOCIAL: {
    OR: 'auth.socialSignupOr',
    GOOGLE: 'auth.signupWithGoogle',
    MICROSOFT: 'auth.signupWithMicrosoft'
  }
} as const;

// Password strength indicators
export const PASSWORD_STRENGTH = {
  LEVELS: ["Very Weak", "Weak", "Fair", "Good", "Strong"],
  CLASSES: ["strength-0", "strength-1", "strength-2", "strength-3", "strength-4"]
} as const;

// Form validation schemas (common patterns)
export const AUTH_VALIDATION = {
  NAME: {
    MIN_LENGTH: 2
  },
  PASSWORD: {
    MIN_LENGTH: 8,
    PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/
  },
  MOBILE: {
    LENGTH: 10
  }
} as const;

// Country codes for phone inputs
export const COUNTRY_CODES = {
  INDIA: '+91'
} as const;

// Default error messages
export const AUTH_ERRORS = {
  NETWORK: 'Network/server error. Please try again.',
  PASSWORD_MISMATCH: 'Passwords do not match',
  INVALID_ROLE: 'Please select a valid role',
  TERMS_REQUIRED: 'You must accept the terms and conditions',
  CAPTCHA_REQUIRED: 'Please complete the CAPTCHA verification',
  CAPTCHA_INVALID: 'Incorrect CAPTCHA, please try again',
  PASSWORD_REQUIREMENTS: 'Password must contain uppercase, lowercase, number and special character',
  MOBILE_FORMAT: 'Mobile number must be 10 digits'
} as const;

// Form steps for signup progress tracker
export const SIGNUP_STEPS = [
  { id: 'name', label: 'Name' },
  { id: 'mobileNumber', label: 'Mobile' },
  { id: 'email', label: 'Email' },
  { id: 'password', label: 'Password' },
  { id: 'confirmPassword', label: 'Confirm' },
  { id: 'acceptTerms', label: 'Terms' },
  { id: 'captcha', label: 'CAPTCHA' }
] as const;