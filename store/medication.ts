import { create } from "zustand";
import axios from "../api/axiosInstance";
import { ENDPOINTS } from "../api/endpoints";

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  times: string[];
  startDate: string;
  duration: string;
  color: string;
  reminderEnabled: boolean;
  // Add other fields as needed
}

interface MedicationStore {
  medications: Medication[];
  loading: boolean;
  error: string | null;
  fetchMedications: () => Promise<void>;
  fetchTodaysMedications: () => Promise<void>;
  fetchMonthlyMedications: () => Promise<void>;
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
  medications: [],
  loading: false,
  error: null,

  fetchMedications: async () => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get(ENDPOINTS.MEDICINE.GET_ALL);
      set({ medications: res.data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  fetchTodaysMedications: async () => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get(ENDPOINTS.MEDICINE.GET_TODAY);
      set({ medications: res.data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  fetchMonthlyMedications: async () => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get(ENDPOINTS.MEDICINE.GET_MONTHLY);
      set({ medications: res.data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  fetchUpcomingMedications: async () => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get(ENDPOINTS.MEDICINE.GET_UPCOMING);
      set({ medications: res.data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  fetchRefillWarnings: async () => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get(ENDPOINTS.MEDICINE.GET_REFILL_WARNING);
      set({ medications: res.data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  fetchProgressSummary: async () => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get(ENDPOINTS.MEDICINE.GET_PROGRESS_SUMMARY);
      set({ loading: false });
      return res.data;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      return null;
    }
  },

  addMedication: async (medication) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.post(ENDPOINTS.MEDICINE.ADD_MEDICINE, medication);
      set((state) => ({
        medications: [...state.medications, res.data],
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  updateMedication: async (id, medication) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.put(
        `${ENDPOINTS.MEDICINE.ADD_MEDICINE}/${id}`,
        medication
      );
      set((state) => ({
        medications: state.medications.map((m) => (m.id === id ? res.data : m)),
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  deleteMedication: async (id) => {
    set({ loading: true, error: null });
    try {
      await axios.delete(`${ENDPOINTS.MEDICINE.ADD_MEDICINE}/${id}`);
      set((state) => ({
        medications: state.medications.filter((m) => m.id !== id),
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
}));
