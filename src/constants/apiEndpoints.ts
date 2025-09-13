// src/constants/apiEndpoints.ts
const API_BASE_URL = "http://localhost:8010/api/v1/workplace-tracker-service";

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
};
