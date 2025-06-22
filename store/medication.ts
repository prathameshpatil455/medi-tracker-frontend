import { create } from "zustand";
import axiosInstance from "../api/axiosInstance";
import { ENDPOINTS } from "../api/endpoints";

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequencyPerDay?: number;
  times: string[];
  startDate: string;
  endDate?: string;
  daysOfWeek?: number[];
  duration: string;
  color: string;
  reminderEnabled: boolean;
  refillReminder?: boolean;
  notes?: string;
  isUrgent?: boolean;
  remainingPills?: number;
  totalPills?: number;
  refillDate?: string;
  tabletCount?: number;
  daysLeft?: number;
  // Add other fields as needed
}

interface MedicationStore {
  allMedications: Medication[];
  todaysMedications: Medication[];
  monthlyMedications: Medication[];
  upcomingMedications: Medication[];
  refillWarnings: Medication[];
  progressSummary: Medication[];
  loading: boolean;
  error: string | null;
  fetchMedications: () => Promise<void>;
  fetchTodaysMedications: () => Promise<void>;
  fetchMonthlyMedications: (year: number, month: number) => Promise<void>;
  fetchUpcomingMedications: () => Promise<void>;
  fetchRefillWarnings: () => Promise<void>;
  fetchProgressSummary: () => Promise<any>;
  addMedication: (medication: Omit<Medication, "id">) => Promise<void>;
  updateMedication: (
    id: string,
    medication: Partial<Medication>
  ) => Promise<void>;
  deleteMedication: (id: string) => Promise<void>;
}

export const useMedicationStore = create<MedicationStore>((set) => ({
  allMedications: [],
  todaysMedications: [],
  monthlyMedications: [],
  upcomingMedications: [],
  refillWarnings: [],
  progressSummary: [],
  loading: false,
  error: null,

  fetchMedications: async () => {
    set({ loading: true, error: null });
    try {
      const res = await axiosInstance.get(ENDPOINTS.MEDICINE.GET_ALL);
      set({ allMedications: res.data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  fetchTodaysMedications: async () => {
    set({ loading: true, error: null });
    try {
      const res = await axiosInstance.get(ENDPOINTS.MEDICINE.GET_TODAY);
      set({ todaysMedications: res.data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  fetchMonthlyMedications: async (year, month) => {
    set({ loading: true, error: null });
    try {
      const res = await axiosInstance.get(ENDPOINTS.MEDICINE.GET_MONTHLY, {
        params: { year, month },
      });
      set({ monthlyMedications: res.data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  fetchUpcomingMedications: async () => {
    set({ loading: true, error: null });
    try {
      const res = await axiosInstance.get(ENDPOINTS.MEDICINE.GET_UPCOMING);
      set({ upcomingMedications: res.data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  fetchRefillWarnings: async () => {
    set({ loading: true, error: null });
    try {
      const res = await axiosInstance.get(
        ENDPOINTS.MEDICINE.GET_REFILL_WARNING
      );
      set({ refillWarnings: res.data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  fetchProgressSummary: async () => {
    set({ loading: true, error: null });
    try {
      const res = await axiosInstance.get(
        ENDPOINTS.MEDICINE.GET_PROGRESS_SUMMARY
      );
      set({ progressSummary: res.data, loading: false });
      return res.data;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      return null;
    }
  },

  addMedication: async (medication) => {
    set({ loading: true, error: null });
    try {
      const res = await axiosInstance.post(
        ENDPOINTS.MEDICINE.ADD_MEDICINE,
        medication
      );
      set((state) => ({
        ...state,
        allMedications: [...state.allMedications, res.data],
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  updateMedication: async (id, medication) => {
    set({ loading: true, error: null });
    try {
      const res = await axiosInstance.put(
        `${ENDPOINTS.MEDICINE.ADD_MEDICINE}/${id}`,
        medication
      );
      set((state) => ({
        ...state,
        allMedications: state.allMedications.map((m: Medication) =>
          m.id === id ? res.data : m
        ),
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  deleteMedication: async (id) => {
    set({ loading: true, error: null });
    try {
      await axiosInstance.delete(`${ENDPOINTS.MEDICINE.ADD_MEDICINE}/${id}`);
      set((state) => ({
        ...state,
        allMedications: state.allMedications.filter(
          (m: Medication) => m.id !== id
        ),
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
}));
