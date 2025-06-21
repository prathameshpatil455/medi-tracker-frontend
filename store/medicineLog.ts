import { create } from "zustand";
import axiosInstance from "../api/axiosInstance";
import { ENDPOINTS } from "../api/endpoints";

export interface MedicineLog {
  id: string;
  medicineId: string;
  date: string; // ISO string
  taken: boolean;
  timeTaken?: string;
  scheduledTime?: string;
  medicineName?: string;
  dosage?: string;
  color?: string;
  // Add other fields from your backend model if needed
}

interface MedicineLogStore {
  dailyLogs: MedicineLog[];
  monthlyLogs: MedicineLog[];
  logsByDate: MedicineLog[];
  loading: boolean;
  error: string | null;
  getDailyMedicineLog: () => Promise<void>;
  getMonthlyMedicineLogs: (year: number, month: number) => Promise<void>;
  getMedicineLogsByDate: (date: string) => Promise<void>;
  markMedicineAsTaken: (logToTake: MedicineLog) => Promise<void>;
  markMultipleAsTaken: (medicineIds: string[]) => Promise<void>;
}

export const useMedicineLogStore = create<MedicineLogStore>((set) => ({
  dailyLogs: [],
  monthlyLogs: [],
  logsByDate: [],
  loading: false,
  error: null,

  getDailyMedicineLog: async () => {
    set({ loading: true, error: null });
    try {
      const res = await axiosInstance.get(ENDPOINTS.MEDICINE_LOGS.GET_DAILY);
      const responseData = res.data;
      set({ dailyLogs: responseData, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  getMonthlyMedicineLogs: async (year, month) => {
    set({ loading: true, error: null });
    try {
      const res = await axiosInstance.get(ENDPOINTS.MEDICINE_LOGS.GET_MONTHLY, {
        params: { year, month },
      });

      let processedLogs: any[] = [];
      const responseData = res.data;
      if (
        responseData &&
        typeof responseData === "object" &&
        !Array.isArray(responseData)
      ) {
        processedLogs = Object.entries(responseData).flatMap(
          ([date, logsForDate]) =>
            (logsForDate as any[])
              .filter((log) => log != null)
              .map((log: any) => ({
                ...log,
                id: `${date}-${log.medicineId}-${log.scheduledTime}`,
                date: date,
                medication: {
                  name: log.medicineName,
                  times: log.scheduledTime ? [log.scheduledTime] : [],
                  color: log.color || "#808080",
                },
              }))
        );
      } else if (Array.isArray(responseData)) {
        processedLogs = responseData;
      }
      set({ monthlyLogs: processedLogs, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  getMedicineLogsByDate: async (date) => {
    set({ loading: true, error: null });
    try {
      const res = await axiosInstance.get(ENDPOINTS.MEDICINE_LOGS.GET_BY_DATE, {
        params: { date },
      });
      set({ logsByDate: res.data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  markMedicineAsTaken: async (logToTake) => {
    try {
      await axiosInstance.post(
        `${ENDPOINTS.MEDICINE_LOGS.MARK_TAKEN}/${logToTake.medicineId}/mark-taken`,
        { time: logToTake.scheduledTime }
      );
    } catch (error: any) {
      throw error;
    }
  },

  markMultipleAsTaken: async (medicineIds: string[]) => {
    set({ loading: true, error: null });
    try {
      await axiosInstance.post(ENDPOINTS.MEDICINE_LOGS.MARK_BULK_TAKEN, {
        medicineIds,
      });
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
}));
