import { create } from "zustand";
import axiosInstance from "../api/axiosInstance";
import { ENDPOINTS } from "../api/endpoints";

// Types
export interface DashboardStats {
  cards: {
    balance: number;
    totalIncome: number;
    totalExpense: number;
  };
  trends: {
    weekly: TrendData[];
    monthly: TrendData[];
    yearly: TrendData[];
  };
  categories: {
    income: CategoryData[];
    expense: CategoryData[];
  };
}

interface TrendData {
  date: string;
  income: number;
  expense: number;
}

interface CategoryData {
  category: string;
  percentage: string;
}

interface CardsResponse {
  balance: number;
  totalIncome: number;
  totalExpense: number;
}

interface TrendsResponse {
  data: TrendData[];
}

interface CategoriesResponse {
  income: CategoryData[];
  expense: CategoryData[];
}

type DashboardState = {
  stats: DashboardStats | null;
  loading: boolean;
  error: string | null;
  // Actions
  fetchCards: () => Promise<void>;
  fetchTrends: (range: "weekly" | "monthly" | "yearly") => Promise<void>;
  fetchCategories: () => Promise<void>;
  clearError: () => void;
};

const initialStats: DashboardStats = {
  cards: {
    balance: 0,
    totalIncome: 0,
    totalExpense: 0,
  },
  trends: {
    weekly: [],
    monthly: [],
    yearly: [],
  },
  categories: {
    income: [],
    expense: [],
  },
};

export const useDashboardStore = create<DashboardState>((set, get) => ({
  stats: initialStats,
  loading: false,
  error: null,

  fetchCards: async () => {
    try {
      set({ loading: true, error: null });
      const res = await axiosInstance.get<CardsResponse>(
        ENDPOINTS.TRANSACTIONS.SUMMARY.CARDS
      );
      set((state) => ({
        stats: {
          ...(state.stats || initialStats),
          cards: {
            balance: res.data.balance,
            totalIncome: res.data.totalIncome,
            totalExpense: res.data.totalExpense,
          },
        },
        loading: false,
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch dashboard cards";
      set({ error: errorMessage, loading: false });
    }
  },

  fetchTrends: async (range: "weekly" | "monthly" | "yearly") => {
    try {
      set({ loading: true, error: null });
      const res = await axiosInstance.get<TrendData[]>(
        ENDPOINTS.TRANSACTIONS.SUMMARY.TRENDS(range)
      );
      set((state) => ({
        stats: {
          ...(state.stats || initialStats),
          trends: {
            ...(state.stats?.trends || initialStats.trends),
            [range]: res.data,
          },
        },
        loading: false,
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch trends data";
      set({ error: errorMessage, loading: false });
    }
  },

  fetchCategories: async () => {
    try {
      set({ loading: true, error: null });
      const res = await axiosInstance.get<CategoriesResponse>(
        ENDPOINTS.TRANSACTIONS.SUMMARY.CATEGORIES
      );
      set((state) => ({
        stats: {
          ...(state.stats || initialStats),
          categories: {
            income: res.data.income,
            expense: res.data.expense,
          },
        },
        loading: false,
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch category data";
      set({ error: errorMessage, loading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
