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

  // Transaction endpoints
  TRANSACTIONS: {
    LIST: "/api/transactions",
    CREATE: "/api/transactions",
    UPDATE: (id: string) => `/api/transactions/${id}`,
    DELETE: (id: string) => `/api/transactions/${id}`,
    SUMMARY: {
      CARDS: "/api/transactions/summary/cards",
      TRENDS: (range: "weekly" | "monthly" | "yearly") =>
        `/api/transactions/summary/trends?range=${range}`,
      CATEGORIES: "/api/transactions/summary/categories",
    },
  },

  // Category endpoints
  CATEGORIES: {
    LIST: "/api/categories",
    CREATE: "/api/categories",
    UPDATE: (id: string) => `/api/categories/${id}`,
    DELETE: (id: string) => `/api/categories/${id}`,
  },

  // Budget endpoints
  BUDGETS: {
    LIST: "/api/budgets",
    CREATE: "/api/budgets",
    UPDATE: (id: string) => `/api/budgets/${id}`,
    DELETE: (id: string) => `/api/budgets/${id}`,
    DETAILS: (id: string) => `/api/budgets/${id}`,
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
