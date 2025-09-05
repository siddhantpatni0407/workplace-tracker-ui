const API_BASE_URL = "http://localhost:8010/api/v1/workplace-tracker-service"; 

export const API_ENDPOINTS = {
  AUTH: {
    SIGNUP: `${API_BASE_URL}/register`,          // /api/v1/workplace-tracker-service/register
    LOGIN: `${API_BASE_URL}/login`,              // /api/v1/workplace-tracker-service/login
    FORGOT_PASSWORD_RESET: `${API_BASE_URL}/forgot/reset`, // /api/v1/workplace-tracker-service/forgot/reset
    LOGOUT: `${API_BASE_URL}/logout`,            // (If you have implemented logout)
    REFRESH_TOKEN: `${API_BASE_URL}/refresh`,    // (If refresh endpoint is added later)
  },

  USERS: {
    GET_ALL: `${API_BASE_URL}/user/fetch`,       // /api/v1/workplace-tracker-service/user/fetch
    GET_BY_ID: (id: number | string) => `${API_BASE_URL}/user/${id}`, 
    CREATE: `${API_BASE_URL}/user`,              // /api/v1/workplace-tracker-service/user
    UPDATE: (id: number | string) => `${API_BASE_URL}/user/${id}`, 
    DELETE: (id: number | string) => `${API_BASE_URL}/user/${id}`,
    UPDATE_STATUS: `${API_BASE_URL}/user/status`  
  },

  DASHBOARD: {
    ADMIN: `${API_BASE_URL}/dashboard/admin`,    // (If backend has such endpoint, else remove)
    USER: `${API_BASE_URL}/dashboard/user`, 
  },

  ATTENDANCE: {
    LOG: `${API_BASE_URL}/attendance/log`,       // You need to confirm actual backend endpoint
    SUMMARY: `${API_BASE_URL}/attendance/summary`,
    BY_DATE: (date: string) => `${API_BASE_URL}/attendance/date/${date}`,
  },

  DB: {
    BACKUP: `${API_BASE_URL}/db-backup`,         // /api/v1/workplace-tracker-service/db-backup
  },
};
