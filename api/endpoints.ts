// API Endpoints
export const ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: "/api/auth/login",
    REGISTER: "/api/auth/register",
    VERIFY: "/api/auth/verify",
    LOGOUT: "/api/auth/logout",
    UPDATE_PUSH_TOKEN: "/api/auth/update-token",
    UPDATE_USER: "/api/auth/update-name",
  },

  // User endpoints
  USER: {
    PROFILE: "/api/user/profile",
    UPDATE_PROFILE: "/api/user/profile",
    CHANGE_PASSWORD: "/api/user/change-password",
  },

  MEDICINE: {
    GET_ALL: "/api/medicines",
    GET_TODAY: "/api/medicines/today",
    ADD_MEDICINE: "/api/medicines",
    GET_MONTHLY: "/api/medicines/month",
    GET_UPCOMING: "/api/medicines/upcoming",
    GET_REFILL_WARNING: "/api/medicines/refill-warning",
    GET_PROGRESS_SUMMARY: "/api/medicines/progress/summary",
  },

  MEDICINE_LOGS: {
    GET_DAILY: "/api/medicineLogs/logs/daily",
    GET_MONTHLY: "/api/medicineLogs/logs/monthly",
    GET_BY_DATE: "/api/medicineLogs/logs",
    MARK_TAKEN: "/api/medicineLogs/", // for single medicine, append /:id
    MARK_BULK_TAKEN: "/api/medicineLogs/mark-bulk",
  },

  // Reports endpoints
  REPORTS: {
    MONTHLY: "/api/reports/monthly",
    YEARLY: "/api/reports/yearly",
    CATEGORY: "/api/reports/category",
  },

  // Dashboard endpoints
  DASHBOARD: {
    WEEKLY: "/api/dashboard/weekly",
    MONTHLY: "/api/dashboard/monthly",
    YEARLY: "/api/dashboard/yearly",
  },
} as const;
