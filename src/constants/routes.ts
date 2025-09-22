// src/constants/routes.ts

/**
 * Application route constants
 * Centralized route management for better maintainability
 */

// Base routes
export const ROUTES = {
  // Public routes
  PUBLIC: {
    HOME: '/',
    LOGIN: '/login',
    SIGNUP: '/signup',
    FORGOT_PASSWORD: '/forgot-password',
    RESET_PASSWORD: '/reset-password',
    ABOUT: '/about-us',
    CONTACT: '/contact-us',
    PRIVACY: '/privacy',
    TERMS: '/terms',
    NOT_FOUND: '/404'
  },

  // Authentication routes
  AUTH: {
    LOGIN: '/auth/login',
    SIGNUP: '/auth/signup',
    LOGOUT: '/auth/logout',
    VERIFY: '/auth/verify',
    RESET: '/auth/reset'
  },

  // User routes
  USER: {
    DASHBOARD: '/user-dashboard',
    PROFILE: '/user/profile',
    SETTINGS: '/user/settings',
    TASKS: '/user/tasks',
    NOTES: '/user/notes',
    DAILY_TASK_UPDATES: '/user/daily-task-updates',
    LEAVE_MANAGEMENT: '/user/leave-management',
    LEAVE_POLICY: '/user/leave-policy',
    OFFICE_VISIT: '/user/office-visit',
    OFFICE_VISIT_ANALYTICS: '/user/office-visit-analytics',
    HOLIDAY: '/user/holiday',
    NOTIFICATIONS: '/user/notifications',
    ANALYTICS: '/user-analytics',
    HOLIDAY_TRACKER: '/holiday-tracker',
    USER_TASKS: '/user-tasks',
    USER_NOTES: '/user-notes',
    PF_MANAGEMENT: '/user/pf-management'
  },

  // Admin routes
  ADMIN: {
    DASHBOARD: '/admin-dashboard',
    USER_MANAGEMENT: '/admin/user-management',
    HOLIDAY_MANAGEMENT: '/admin/holiday-management',
    LEAVE_POLICY_MANAGEMENT: '/admin/leave-policy-management',
    REPORTS: '/admin/reports',
    SETTINGS: '/admin/settings',
    SYSTEM: '/admin/system',
    BACKUP: '/admin/db-backup',
    ANALYTICS: '/admin/analytics',
    ATTENDANCE: '/admin/attendance'
  },

  // API routes (for reference)
  API: {
    BASE: '/api/v1',
    AUTH: '/api/v1/auth',
    USERS: '/api/v1/users',
    TASKS: '/api/v1/tasks',
    NOTES: '/api/v1/notes',
    LEAVES: '/api/v1/leaves',
    HOLIDAYS: '/api/v1/holidays',
    REPORTS: '/api/v1/reports'
  }
} as const;

// Route parameters
export const ROUTE_PARAMS = {
  USER_ID: ':userId',
  TASK_ID: ':taskId',
  NOTE_ID: ':noteId',
  LEAVE_ID: ':leaveId',
  HOLIDAY_ID: ':holidayId',
  REPORT_ID: ':reportId'
} as const;

// Dynamic route builders
export const buildRoute = {
  userProfile: (userId: string | number) => `/user/profile/${userId}`,
  editTask: (taskId: string | number) => `/user/tasks/edit/${taskId}`,
  viewTask: (taskId: string | number) => `/user/tasks/view/${taskId}`,
  editNote: (noteId: string | number) => `/user/notes/edit/${noteId}`,
  viewNote: (noteId: string | number) => `/user/notes/view/${noteId}`,
  leaveDetails: (leaveId: string | number) => `/user/leave/${leaveId}`,
  holidayDetails: (holidayId: string | number) => `/user/holiday/${holidayId}`,
  adminUserEdit: (userId: string | number) => `/admin/user-management/edit/${userId}`,
  adminUserView: (userId: string | number) => `/admin/user-management/view/${userId}`,
  reportDetails: (reportId: string | number) => `/admin/reports/${reportId}`
} as const;

// Navigation groups for menu rendering
export const NAVIGATION = {
  PUBLIC: [
    { path: ROUTES.PUBLIC.HOME, label: 'Home', icon: 'home' },
    { path: ROUTES.PUBLIC.ABOUT, label: 'About', icon: 'info-circle' },
    { path: ROUTES.PUBLIC.CONTACT, label: 'Contact', icon: 'envelope' }
  ],
  USER: [
    { path: ROUTES.USER.DASHBOARD, label: 'Dashboard', icon: 'tachometer-alt' },
    { path: ROUTES.USER.TASKS, label: 'Tasks', icon: 'tasks' },
    { path: ROUTES.USER.NOTES, label: 'Notes', icon: 'sticky-note' },
    { path: ROUTES.USER.LEAVE_MANAGEMENT, label: 'Leave', icon: 'calendar-times' },
    { path: ROUTES.USER.OFFICE_VISIT, label: 'Office Visit', icon: 'building' },
    { path: ROUTES.USER.HOLIDAY, label: 'Holidays', icon: 'calendar-alt' },
    { path: ROUTES.USER.PROFILE, label: 'Profile', icon: 'user' },
    { path: ROUTES.USER.SETTINGS, label: 'Settings', icon: 'cog' }
  ],
  ADMIN: [
    { path: ROUTES.ADMIN.DASHBOARD, label: 'Dashboard', icon: 'chart-line' },
    { path: ROUTES.ADMIN.USER_MANAGEMENT, label: 'User Management', icon: 'users' },
    { path: ROUTES.ADMIN.HOLIDAY_MANAGEMENT, label: 'Holiday Management', icon: 'calendar-plus' },
    { path: ROUTES.ADMIN.LEAVE_POLICY_MANAGEMENT, label: 'Leave Policy', icon: 'file-contract' },
    { path: ROUTES.ADMIN.REPORTS, label: 'Reports', icon: 'chart-bar' },
    { path: ROUTES.ADMIN.SETTINGS, label: 'Settings', icon: 'tools' }
  ]
} as const;

// Route protection levels
export const ROUTE_PROTECTION = {
  PUBLIC: 'public',
  AUTHENTICATED: 'authenticated',
  USER_ONLY: 'user',
  ADMIN_ONLY: 'admin',
  ADMIN_OR_SELF: 'admin_or_self'
} as const;

// Route metadata for protection and navigation
export const ROUTE_META = {
  [ROUTES.PUBLIC.HOME]: { protection: ROUTE_PROTECTION.PUBLIC, title: 'Home' },
  [ROUTES.PUBLIC.LOGIN]: { protection: ROUTE_PROTECTION.PUBLIC, title: 'Login' },
  [ROUTES.PUBLIC.SIGNUP]: { protection: ROUTE_PROTECTION.PUBLIC, title: 'Sign Up' },
  [ROUTES.USER.DASHBOARD]: { protection: ROUTE_PROTECTION.AUTHENTICATED, title: 'Dashboard' },
  [ROUTES.USER.TASKS]: { protection: ROUTE_PROTECTION.AUTHENTICATED, title: 'Tasks' },
  [ROUTES.USER.PROFILE]: { protection: ROUTE_PROTECTION.AUTHENTICATED, title: 'Profile' },
  [ROUTES.ADMIN.DASHBOARD]: { protection: ROUTE_PROTECTION.ADMIN_ONLY, title: 'Admin Dashboard' },
  [ROUTES.ADMIN.USER_MANAGEMENT]: { protection: ROUTE_PROTECTION.ADMIN_ONLY, title: 'User Management' }
} as const;