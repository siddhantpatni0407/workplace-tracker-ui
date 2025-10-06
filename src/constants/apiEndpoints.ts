// src/constants/apiEndpoints.ts
import { API_CONFIG } from './app';

const API_BASE_URL = API_CONFIG.BASE_URL;

export const API_ENDPOINTS = {
  AUTH: {
    SIGNUP: `${API_BASE_URL}/register`,
    LOGIN: `${API_BASE_URL}/login`,
    FORGOT_PASSWORD_RESET: `${API_BASE_URL}/forgot/reset`,
    LOGOUT: `${API_BASE_URL}/logout`,
    REFRESH_TOKEN: `${API_BASE_URL}/auth/refresh`,
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
    GET: (userId: number | string) =>
      `${API_BASE_URL}/user/settings?userId=${userId}`,
    UPSERT: (userId: number | string) =>
      `${API_BASE_URL}/user/settings?userId=${userId}`,
    DELETE: (userId: number | string) =>
      `${API_BASE_URL}/user/settings?userId=${userId}`,
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
    GET_BY_USER: (userId: number | string) =>
      `${API_BASE_URL}/user-leaves?userId=${userId}`,
    CREATE: (userId: number | string) =>
      `${API_BASE_URL}/user-leaves?userId=${userId}`,
    UPDATE: (leaveId: number | string) =>
      `${API_BASE_URL}/user-leaves?userLeaveId=${leaveId}`,
    DELETE: (leaveId: number | string) =>
      `${API_BASE_URL}/user-leaves?userLeaveId=${leaveId}`,
  },

  // User leave balance
  USER_LEAVE_BALANCE: {
    GET: (userId: number | string, policyId: number | string, year: number) =>
      `${API_BASE_URL}/user-leave-balance?userId=${userId}&policyId=${policyId}&year=${year}`,
    UPSERT: `${API_BASE_URL}/user-leave-balance`,
    ADJUST: `${API_BASE_URL}/user-leave-balance/adjust`,
    RECALCULATE: (
      userId: number | string,
      policyId: number | string,
      year: number
    ) =>
      `${API_BASE_URL}/user-leave-balance/recalculate?userId=${userId}&policyId=${policyId}&year=${year}`,
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
    LIST: `${API_BASE_URL}/visits`, // GET with ?userId=...&year=...&month=...
    UPSERT: `${API_BASE_URL}/visits`, // POST body upsert
    DELETE: (officeVisitId: number | string) => `${API_BASE_URL}/visits?officeVisitId=${officeVisitId}`,
  },

  // Daily view records (month or custom range)
  DAILY_VIEW: {
    FETCH: `${API_BASE_URL}/fetch-daily-view-records`, // GET ?userId=...&year=...&month=... or ?userId=...&from=YYYY-MM-DD&to=YYYY-MM-DD
  },

  // Analytics
  ANALYTICS: {
    VISITS_LEAVES_AGGREGATE: (params: {
      userId?: number | string;
      from: string;
      to: string;
      groupBy: "month" | "week" | "year";
    }) => {
      const query = new URLSearchParams({
        ...(params.userId ? { userId: String(params.userId) } : {}),
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
    GET_BY_ID: `${API_BASE_URL}/tasks`,
    CREATE: `${API_BASE_URL}/tasks`,
    UPDATE: `${API_BASE_URL}/tasks`,
    DELETE: `${API_BASE_URL}/tasks`,
    UPDATE_STATUS: `${API_BASE_URL}/tasks/status`,
    UPDATE_PRIORITY: `${API_BASE_URL}/tasks/priority`,
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
    
    // User-specific operations
    GET_BY_USER: (userId: number | string) => `${API_BASE_URL}/daily-tasks/user?userId=${userId}`,
    GET_BY_DATE_RANGE: (userId: number | string, startDate: string, endDate: string) => 
      `${API_BASE_URL}/daily-tasks/user/date-range?userId=${userId}&startDate=${startDate}&endDate=${endDate}`,
    GET_BY_DATE: (userId: number | string, date: string) => 
      `${API_BASE_URL}/daily-tasks/user/date?userId=${userId}&date=${date}`,
  },

  // Notes
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
    GET_COMMENTS: `${API_BASE_URL}/notes/comments`,
    ADD_COMMENT: `${API_BASE_URL}/notes/comments`,
    GET_ACTIVITY: `${API_BASE_URL}/notes/activity`,
    GET_TEMPLATES: `${API_BASE_URL}/notes/templates`,
    CREATE_FROM_TEMPLATE: `${API_BASE_URL}/notes/template`,
    EXPORT: `${API_BASE_URL}/notes/export`,
    IMPORT: `${API_BASE_URL}/notes/import`,
    SYNC: `${API_BASE_URL}/notes/sync`,
  },

  // Special Days
  SPECIAL_DAYS: {
    GET_ALL: `${API_BASE_URL}/special-days`, // GET with query params: ?month=9&year=2025&page=1&limit=10
    CURRENT_MONTH: `${API_BASE_URL}/special-days/current-month`, // GET with query params: ?month=9&year=2025&limit=5
    BIRTHDAYS: `${API_BASE_URL}/special-days/birthdays`, // GET with query params: ?month=9&year=2025&page=1&limit=8
    ANNIVERSARIES: `${API_BASE_URL}/special-days/anniversaries`, // GET with query params: ?month=9&year=2025
  },
};
