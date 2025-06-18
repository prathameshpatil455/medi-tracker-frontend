import { create } from "zustand";
import axiosInstance from "../api/axiosInstance";
import { ENDPOINTS } from "../api/endpoints";

// Types
export interface Transaction {
  _id: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  description: string;
  date: string;
  userId: string;
}

interface TransactionResponse {
  transactions: Transaction[];
  total: number;
}

interface CreateTransactionData {
  amount: number;
  type: "income" | "expense";
  category: string;
  description: string;
  date: string;
}

interface UpdateTransactionData extends Partial<CreateTransactionData> {
  _id: string;
}

type TransactionState = {
  transactions: Transaction[];
  totalRecords: number;
  loading: boolean;
  error: string | null;
  // Actions
  fetchTransactions: () => Promise<void>;
  createTransaction: (data: CreateTransactionData) => Promise<boolean>;
  updateTransaction: (data: UpdateTransactionData) => Promise<boolean>;
  deleteTransaction: (id: string) => Promise<boolean>;
  clearError: () => void;
};

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: [],
  totalRecords: 0,
  loading: false,
  error: null,

  fetchTransactions: async () => {
    try {
      set({ loading: true, error: null });
      const res = await axiosInstance.get<TransactionResponse>(
        ENDPOINTS.TRANSACTIONS.LIST
      );
      set({
        transactions: res.data.transactions,
        totalRecords: res.data.total,
        loading: false,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch transactions";
      set({ error: errorMessage, loading: false });
    }
  },

  createTransaction: async (data) => {
    try {
      set({ loading: true, error: null });
      const res = await axiosInstance.post<Transaction>(
        ENDPOINTS.TRANSACTIONS.CREATE,
        data
      );
      set((state) => ({
        transactions: [...state.transactions, res.data],
        loading: false,
      }));
      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create transaction";
      set({ error: errorMessage, loading: false });
      return false;
    }
  },

  updateTransaction: async (data) => {
    try {
      set({ loading: true, error: null });
      const res = await axiosInstance.put<Transaction>(
        ENDPOINTS.TRANSACTIONS.UPDATE(data._id),
        data
      );
      set((state) => ({
        transactions: state.transactions.map((t) =>
          t._id === data._id ? res.data : t
        ),
        loading: false,
      }));
      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update transaction";
      set({ error: errorMessage, loading: false });
      return false;
    }
  },

  deleteTransaction: async (id) => {
    try {
      set({ loading: true, error: null });
      await axiosInstance.delete(ENDPOINTS.TRANSACTIONS.DELETE(id));
      set((state) => ({
        transactions: state.transactions.filter((t) => t._id !== id),
        loading: false,
      }));
      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete transaction";
      set({ error: errorMessage, loading: false });
      return false;
    }
  },

  clearError: () => set({ error: null }),
}));
