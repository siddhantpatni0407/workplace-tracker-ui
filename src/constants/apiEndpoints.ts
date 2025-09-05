// src/constants/apiEndpoints.ts (replace the AUTH block or entire file)
const API_BASE_URL = "http://localhost:8010/api/v1/workplace-tracker-service";

export const API_ENDPOINTS = {
  AUTH: {
    SIGNUP: `${API_BASE_URL}/register`,
    LOGIN: `${API_BASE_URL}/login`,
    FORGOT_PASSWORD_RESET: `${API_BASE_URL}/forgot/reset`,
    LOGOUT: `${API_BASE_URL}/logout`,
    // Updated refresh endpoint (explicit /auth/refresh)
    REFRESH_TOKEN: `${API_BASE_URL}/auth/refresh`,
  },

  USERS: {
    GET_ALL: `${API_BASE_URL}/user/fetch`,
    GET_BY_ID: (id: number | string) => `${API_BASE_URL}/user/${id}`,
    CREATE: `${API_BASE_URL}/user`,
    UPDATE: (id: number | string) => `${API_BASE_URL}/user/${id}`,
    DELETE: (id: number | string) => `${API_BASE_URL}/user/${id}`,
    UPDATE_STATUS: `${API_BASE_URL}/user/status`
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
};
