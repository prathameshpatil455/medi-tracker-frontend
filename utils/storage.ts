import AsyncStorage from "@react-native-async-storage/async-storage";

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  times: string[];
  startDate: string;
  duration: string;
  color: string;
  reminderEnabled: boolean;
}

export interface DoseHistory {
  id: string;
  medicationId: string;
  date: string;
  time: string;
  taken: boolean;
  timestamp: string;
}

const MEDICATIONS_KEY = "medications";
const DOSE_HISTORY_KEY = "dose_history";

export const getMedications = async (): Promise<Medication[]> => {
  try {
    const medications = await AsyncStorage.getItem(MEDICATIONS_KEY);
    return medications ? JSON.parse(medications) : [];
  } catch (error) {
    console.error("Error getting medications:", error);
    return [];
  }
};

export const saveMedication = async (medication: Medication): Promise<void> => {
  try {
    const medications = await getMedications();
    const existingIndex = medications.findIndex((m) => m.id === medication.id);

    if (existingIndex >= 0) {
      medications[existingIndex] = medication;
    } else {
      medications.push(medication);
    }

    await AsyncStorage.setItem(MEDICATIONS_KEY, JSON.stringify(medications));
  } catch (error) {
    console.error("Error saving medication:", error);
    throw error;
  }
};

export const deleteMedication = async (id: string): Promise<void> => {
  try {
    const medications = await getMedications();
    const filtered = medications.filter((m) => m.id !== id);
    await AsyncStorage.setItem(MEDICATIONS_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("Error deleting medication:", error);
    throw error;
  }
};

export const getDoseHistory = async (): Promise<DoseHistory[]> => {
  try {
    const history = await AsyncStorage.getItem(DOSE_HISTORY_KEY);
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error("Error getting dose history:", error);
    return [];
  }
};

export const getTodaysDoses = async (): Promise<DoseHistory[]> => {
  try {
    const history = await getDoseHistory();
    const today = new Date().toISOString().split("T")[0];
    return history.filter((dose) => dose.date === today);
  } catch (error) {
    console.error("Error getting today's doses:", error);
    return [];
  }
};

export const recordDose = async (
  medicationId: string,
  taken: boolean,
  timestamp: string
): Promise<void> => {
  try {
    const history = await getDoseHistory();
    const today = new Date().toISOString().split("T")[0];
    const time = new Date().toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    });

    const dose: DoseHistory = {
      id: `${medicationId}_${today}_${time}`,
      medicationId,
      date: today,
      time,
      taken,
      timestamp,
    };

    history.push(dose);
    await AsyncStorage.setItem(DOSE_HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.error("Error recording dose:", error);
    throw error;
  }
};
