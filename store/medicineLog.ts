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
  logs: MedicineLog[];
  loading: boolean;
  error: string | null;
  getDailyMedicineLog: () => Promise<void>;
  getMonthlyMedicineLogs: (year: number, month: number) => Promise<void>;
  getMedicineLogsByDate: (date: string) => Promise<void>;
  markMedicineAsTaken: (logToTake: MedicineLog) => Promise<void>;
  markMultipleAsTaken: (medicineIds: string[]) => Promise<void>;
}

export const useMedicineLogStore = create<MedicineLogStore>((set) => ({
  logs: [],
  loading: false,
  error: null,

  getDailyMedicineLog: async () => {
    set({ loading: true, error: null });
    try {
      const res = await axiosInstance.get(ENDPOINTS.MEDICINE_LOGS.GET_DAILY);
      let processedLogs: any[] = [];
      const responseData = res.data;

      console.log(responseData, "check the response  data");

      set({ logs: responseData, loading: false });
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

      // The API returns an object with dates as keys (`{"2025-06-01": [...]}`).
      // This processor transforms it into a flat array (`[{...}, {...}]`) that the UI can render.
      if (
        responseData &&
        typeof responseData === "object" &&
        !Array.isArray(responseData)
      ) {
        processedLogs = Object.entries(responseData).flatMap(
          ([date, logsForDate]) =>
            (logsForDate as any[]).map((log: any) => ({
              // Pass through all original log data
              ...log,
              // Create a unique ID for React's key prop. The original medicineId is NOT changed.
              id: `${date}-${log.medicineId}-${log.scheduledTime}`,
              date: date,
              // Nest medication details into the structure the UI component expects
              medication: {
                name: log.medicineName,
                times: log.scheduledTime ? [log.scheduledTime] : [],
                color: log.color || "#808080", // Provide a default color
              },
            }))
        );
      } else if (Array.isArray(responseData)) {
        // Fallback for cases where the API might unexpectedly return a flat array
        processedLogs = responseData;
      }

      set({ logs: processedLogs, loading: false });
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
      set({ logs: res.data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  markMedicineAsTaken: async (logToTake) => {
    // // Optimistic update: update the UI immediately
    // set((state) => ({
    //   logs: state.logs.map((log) =>
    //     log.id === logToTake.id ? { ...log, taken: true } : log
    //   ),
    // }));

    try {
      // Make the API call
      await axiosInstance.post(
        `${ENDPOINTS.MEDICINE_LOGS.MARK_TAKEN}/${logToTake.medicineId}/mark-taken`,
        { time: logToTake.scheduledTime }
      );
    } catch (error: any) {
      // Revert the change if the API call fails
      //   set((state) => ({
      //     logs: state.logs.map((log) =>
      //       log.id === logToTake.id ? { ...log, taken: false } : log
      //     ),
      //   }));
      // Re-throw the error to be caught in the component
      throw error;
    }
  },

  markMultipleAsTaken: async (medicineIds: string[]) => {
    set({ loading: true, error: null });
    try {
      await axiosInstance.post(ENDPOINTS.MEDICINE_LOGS.MARK_BULK_TAKEN, {
        medicineIds,
      });
      // After marking as taken, you might want to refetch logs or update state optimistically
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
}));
