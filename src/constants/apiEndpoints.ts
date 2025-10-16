// src/constants/apiEndpoints.ts
import { API_CONFIG } from './app';

const API_BASE_URL = API_CONFIG.BASE_URL;

export const API_ENDPOINTS = {
  AUTH: {
    SIGNUP: `${API_BASE_URL}/register`,
    LOGIN: `${API_BASE_URL}/login`,
    FORGOT_PASSWORD_RESET: `${API_BASE_URL}/forgot/reset`,
    CHANGE_PASSWORD: `${API_BASE_URL}/user/change-password`,
    // LOGOUT: `${API_BASE_URL}/logout`, // Removed - no backend logout endpoint needed
    REFRESH_TOKEN: `${API_BASE_URL}/auth/refresh`,
  },

  PLATFORM_AUTH: {
    SIGNUP: `${API_BASE_URL}/platform-auth/signup`,
    LOGIN: `${API_BASE_URL}/platform-auth/login`,
    REFRESH_TOKEN: `${API_BASE_URL}/platform-auth/refresh-token`,
    PROFILE: (platformUserId: number | string) => `${API_BASE_URL}/platform-auth/profile?platformUserId=${platformUserId}`,
  },

  USERS: {
    GET_ALL: `${API_BASE_URL}/user/fetch`,
    GET_BY_ID: (id: number | string) => `${API_BASE_URL}/user/${id}`,
    CREATE: `${API_BASE_URL}/user`,
    UPDATE: (id: number | string) => `${API_BASE_URL}/user/${id}`,
    DELETE: (id: number | string) => `${API_BASE_URL}/user/${id}`,
    UPDATE_STATUS: `${API_BASE_URL}/user/status`,
  },

  USER_SETTINGS: {
    GET: `${API_BASE_URL}/user/settings`,
    UPSERT: `${API_BASE_URL}/user/settings`,
    DELETE: `${API_BASE_URL}/user/settings`,
  },

  USER: {
    SETTINGS: `${API_BASE_URL}/user-settings`,
    PROFILE: `${API_BASE_URL}/user/profile`,
  },

  DASHBOARD: {
    ADMIN: `${API_BASE_URL}/dashboard/admin`,
    USER: `${API_BASE_URL}/dashboard/user`,
  },

  ATTENDANCE: {
    LOG: `${API_BASE_URL}/attendance/log`,
    SUMMARY: `${API_BASE_URL}/attendance/summary`,
    BY_DATE: (date: string) => `${API_BASE_URL}/attendance/date/${date}`,
  },

  DB: {
    BACKUP: `${API_BASE_URL}/db-backup`,
  },

  // Leave policies
  LEAVE_POLICIES: {
    GET_ALL: `${API_BASE_URL}/leave-policies`,
    GET_EXACT: (policyId: number | string) =>
      `${API_BASE_URL}/leave-policies/exact?policyId=${policyId}`,
    CREATE: `${API_BASE_URL}/leave-policies`,
    UPDATE: (policyId: number | string) =>
      `${API_BASE_URL}/leave-policies?policyId=${policyId}`,
    // DELETE: (policyId: number | string) => `${API_BASE_URL}/leave-policies?policyId=${policyId}`
  },

  USER_LEAVES: {
    GET_BY_USER: `${API_BASE_URL}/user-leaves`,
    CREATE: `${API_BASE_URL}/user-leaves`,
    UPDATE: (leaveId: number | string) =>
      `${API_BASE_URL}/user-leaves?userLeaveId=${leaveId}`,
    DELETE: (leaveId: number | string) =>
      `${API_BASE_URL}/user-leaves?userLeaveId=${leaveId}`,
  },

  // User leave balance
  USER_LEAVE_BALANCE: {
    GET: (policyId: number | string, year: number) =>
      `${API_BASE_URL}/user-leave-balance?policyId=${policyId}&year=${year}`,
    UPSERT: `${API_BASE_URL}/user-leave-balance`,
    ADJUST: `${API_BASE_URL}/user-leave-balance/adjust`,
    RECALCULATE: (policyId: number | string, year: number) =>
      `${API_BASE_URL}/user-leave-balance/recalculate?policyId=${policyId}&year=${year}`,
  },

  // Holidays
  HOLIDAYS: {
    GET_ALL: `${API_BASE_URL}/holidays`,
    GET_BY_ID: (id: number | string) => `${API_BASE_URL}/holidays/${id}`,
    CREATE: `${API_BASE_URL}/holidays`,
    UPDATE: (id: number | string) => `${API_BASE_URL}/holidays/${id}`,
    DELETE: (id: number | string) => `${API_BASE_URL}/holidays/${id}`,
  },

  // Visits (office visits)
  VISITS: {
    LIST: `${API_BASE_URL}/visits`, // GET with ?year=...&month=... (userId from token)
    UPSERT: `${API_BASE_URL}/visits`, // POST body upsert
    DELETE: (officeVisitId: number | string) => `${API_BASE_URL}/visits?officeVisitId=${officeVisitId}`,
  },

  // Daily view records (month or custom range)
  DAILY_VIEW: {
    FETCH: `${API_BASE_URL}/fetch-daily-view-records`, // GET ?year=...&month=... or ?from=YYYY-MM-DD&to=YYYY-MM-DD (userId from token)
  },

  // Analytics
  ANALYTICS: {
    VISITS_LEAVES_AGGREGATE: (params: {
      from: string;
      to: string;
      groupBy: "month" | "week" | "year";
    }) => {
      const query = new URLSearchParams({
        from: params.from,
        to: params.to,
        groupBy: params.groupBy,
      });
      return `${API_BASE_URL}/analytics/visits-leaves-aggregate?${query}`;
    },
  },

  // Tasks (General task management system)
  TASKS: {
    GET_BY_USER: `${API_BASE_URL}/tasks/user`,
    GET_BY_ID: `${API_BASE_URL}/tasks/details`,
    CREATE: `${API_BASE_URL}/tasks`,
    UPDATE: `${API_BASE_URL}/tasks/update`,
    DELETE: `${API_BASE_URL}/tasks/delete`,
    UPDATE_STATUS: `${API_BASE_URL}/tasks/status/update`,
    UPDATE_PRIORITY: `${API_BASE_URL}/tasks/priority/update`,
    GET_STATS: `${API_BASE_URL}/tasks/stats`,
    SEARCH: `${API_BASE_URL}/tasks/search`,
    GET_OVERDUE: `${API_BASE_URL}/tasks/overdue`,
    GET_BY_STATUS: `${API_BASE_URL}/tasks/by-status`,
    GET_BY_PRIORITY: `${API_BASE_URL}/tasks/by-priority`,
    BULK_UPDATE: `${API_BASE_URL}/tasks/bulk-update`,
    BULK_DELETE: `${API_BASE_URL}/tasks/bulk-delete`,
    DUPLICATE: `${API_BASE_URL}/tasks/duplicate`,
    GET_COMMENTS: `${API_BASE_URL}/tasks/comments`,
    ADD_COMMENT: `${API_BASE_URL}/tasks/comments`,
    GET_SUBTASKS: `${API_BASE_URL}/tasks/subtasks`,
    CREATE_SUBTASK: `${API_BASE_URL}/tasks/subtasks`,
  },

  // Daily Tasks (Daily work tracking system)
  DAILY_TASKS: {
    // Core CRUD operations
    CREATE: `${API_BASE_URL}/daily-tasks`,
    UPDATE: (taskId: number | string) => `${API_BASE_URL}/daily-tasks?taskId=${taskId}`,
    GET_BY_ID: (taskId: number | string) => `${API_BASE_URL}/daily-tasks?taskId=${taskId}`,
    DELETE: (taskId: number | string) => `${API_BASE_URL}/daily-tasks?taskId=${taskId}`,
    
    // User-specific operations (userId now extracted from token)
    GET_BY_USER: `${API_BASE_URL}/daily-tasks/user`,
    GET_BY_DATE_RANGE: (startDate: string, endDate: string) => 
      `${API_BASE_URL}/daily-tasks/user/date-range?startDate=${startDate}&endDate=${endDate}`,
    GET_BY_DATE: (date: string) => 
      `${API_BASE_URL}/daily-tasks/user/date?date=${date}`,
  },

  // Notes - Simplified
  NOTES: {
    GET_BY_USER: `${API_BASE_URL}/notes/user`,
    GET_BY_ID: `${API_BASE_URL}/notes`,
    CREATE: `${API_BASE_URL}/notes`,
    UPDATE: `${API_BASE_URL}/notes`,
    DELETE: `${API_BASE_URL}/notes`,
    UPDATE_STATUS: `${API_BASE_URL}/notes/status`,
    TOGGLE_PIN: `${API_BASE_URL}/notes/pin`,
    UPDATE_COLOR: `${API_BASE_URL}/notes/color`,
    GET_STATS: `${API_BASE_URL}/notes/stats`,
    SEARCH: `${API_BASE_URL}/notes/search`,
    GET_BY_TYPE: `${API_BASE_URL}/notes/by-type`,
    GET_BY_CATEGORY: `${API_BASE_URL}/notes/by-category`,
    GET_PINNED: `${API_BASE_URL}/notes/pinned`,
    GET_ARCHIVED: `${API_BASE_URL}/notes/archived`,
    BULK_UPDATE: `${API_BASE_URL}/notes/bulk-update`,
    BULK_DELETE: `${API_BASE_URL}/notes/bulk-delete`,
    DUPLICATE: `${API_BASE_URL}/notes/duplicate`,
  },

  // Special Days
  SPECIAL_DAYS: {
    GET_ALL: `${API_BASE_URL}/special-days`, // GET with query params: ?month=9&year=2025&page=1&limit=10
    CURRENT_MONTH: `${API_BASE_URL}/special-days/current-month`, // GET with query params: ?month=9&year=2025&limit=5
    BIRTHDAYS: `${API_BASE_URL}/special-days/birthdays`, // GET with query params: ?month=9&year=2025&page=1&limit=8
    ANNIVERSARIES: `${API_BASE_URL}/special-days/anniversaries`, // GET with query params: ?month=9&year=2025
  },

  // Tenant Management (Platform endpoints)
  TENANTS: {
    CREATE: `${API_BASE_URL}/tenant`,
    GET_ALL: `${API_BASE_URL}/tenants`,
    GET_ACTIVE: `${API_BASE_URL}/tenants/active`,
    GET_BY_ID: `${API_BASE_URL}/tenant`,
    GET_BY_CODE: `${API_BASE_URL}/tenant/by-code`,
    UPDATE: `${API_BASE_URL}/tenant/update`,
    UPDATE_STATUS: `${API_BASE_URL}/tenant/status`,
    DELETE: `${API_BASE_URL}/tenant`,
    SEARCH: `${API_BASE_URL}/tenant/search`,
    GET_STATS: `${API_BASE_URL}/tenant/stats`,
    GET_USERS: `${API_BASE_URL}/tenant/users`,
  },

  // Subscriptions (Platform endpoints)
  SUBSCRIPTIONS: {
    GET_ALL: `${API_BASE_URL}/subscriptions`,
    GET_ACTIVE: `${API_BASE_URL}/subscriptions/active`,
    GET_BY_CODE: `${API_BASE_URL}/subscription/by-code`,
  },
};
