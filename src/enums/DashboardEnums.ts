// src/enums/DashboardEnums.ts

/**
 * Dashboard card categories enum
 * Used to categorize different types of dashboard cards
 */
export enum DashboardCardCategory {
  PRODUCTIVITY = 'productivity',
  ATTENDANCE = 'attendance',
  ANALYTICS = 'analytics',
  LEAVE = 'leave',
  POLICY = 'policy',
  HOLIDAY = 'holiday',
  CALENDAR = 'calendar',
  NOTES = 'notes',
  PROFILE = 'profile'
}

/**
 * Activity type enum for recent activities
 * Used to categorize different types of activities in the timeline
 */
export enum ActivityType {
  LEAVE = 'leave',
  OFFICE_VISIT = 'office_visit',
  TASK = 'task',
  NOTE = 'note',
  HOLIDAY = 'holiday'
}

/**
 * Stat color classes enum
 * Used for styling quick stats cards
 */
export enum StatColorClass {
  LEAVE = 'stat-leave',
  OFFICE = 'stat-office',
  WFH = 'stat-wfh',
  HOLIDAYS = 'stat-holidays',
  LOADING = 'stat-loading',
  PRIMARY = 'stat-primary',
  SUCCESS = 'stat-success',
  WARNING = 'stat-warning',
  DANGER = 'stat-danger',
  SECONDARY = 'stat-secondary'
}

/**
 * Background gradient classes enum
 * Used for gradient backgrounds on stat cards
 */
export enum BgGradientClass {
  LEAVE = 'leave-gradient',
  OFFICE = 'office-gradient',
  WFH = 'wfh-gradient',
  HOLIDAYS = 'holidays-gradient',
  LOADING = 'loading-gradient'
}

/**
 * Filter status options enum
 * Used for status filtering in dashboard
 */
export enum FilterStatus {
  ALL = '',
  WFO = 'WFO',
  WFH = 'WFH',
  HOLIDAY = 'HOLIDAY',
  LEAVE = 'LEAVE'
}

/**
 * Dashboard data loading states enum
 */
export enum DashboardLoadingState {
  IDLE = 'idle',
  LOADING = 'loading',
  SUCCESS = 'success',
  ERROR = 'error'
}

/**
 * Quick stat icons enum
 * Standard icons used for quick stats
 */
export enum QuickStatIcon {
  CALENDAR_CHECK = 'bi-calendar-check',
  BUILDING = 'bi-building',
  HOUSE = 'bi-house',
  CALENDAR_HEART = 'bi-calendar-heart',
  HOURGLASS_SPLIT = 'bi-hourglass-split',
  CHECK_CIRCLE_FILL = 'bi-check-circle-fill',
  CLOCK = 'bi-clock'
}