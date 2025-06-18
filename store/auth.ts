// src/store/auth.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import axiosInstance from "../api/axiosInstance";
import { ENDPOINTS } from "../api/endpoints";
import { useNotificationStore } from "./notificationStore";

// Types
interface User {
  _id: string;
  name: string;
  email: string;
  userImage: string;
}

interface AuthResponse {
  _id: string;
  email: string;
  name: string;
  token: string;
  userImage?: string;
}

interface RegisterResponse {
  _id: string;
  email: string;
  name: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

type AuthState = {
  token: string | null;
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (credentials: RegisterCredentials) => Promise<boolean>;
  logout: () => Promise<void>;
  checkToken: () => Promise<void>;
  clearError: () => void;
  updateUsername: (newName: string) => Promise<boolean>;
};

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  loading: true,
  error: null,

  login: async ({ email, password }) => {
    try {
      // Validate inputs
      if (!email || !password) {
        const missingFields = [];
        if (!email) missingFields.push("email");
        if (!password) missingFields.push("password");

        const errorMessage = `Missing required fields: ${missingFields.join(
          ", "
        )}`;
        set({ error: errorMessage });
        return false;
      }

      if (typeof password !== "string") {
        const errorMessage = `Password must be a string, got: ${typeof password}`;
        set({ error: errorMessage });
        return false;
      }

      if (password.length < 5) {
        const errorMessage = "Password is not strong";
        set({ error: errorMessage });
        return false;
      }

      set({ error: null });

      const res = await axiosInstance.post<AuthResponse>(ENDPOINTS.AUTH.LOGIN, {
        email,
        password, // Send plain password
      });

      console.log("Storing token in AsyncStorage...");
      if (res.data.token) {
        await AsyncStorage.setItem("token", res.data.token);
        console.log("Token stored successfully");
      } else {
        console.log("No token received from login response");
        set({ error: "Login failed: No authentication token received" });
        return false;
      }

      set({
        token: res.data.token,
        user: {
          _id: res.data._id,
          name: res.data.name,
          email: res.data.email,
          userImage: res.data.userImage || "",
        },
        error: null,
      });

      // Register for push notifications after successful login
      console.log("Registering for push notifications...");
      await useNotificationStore.getState().registerForPushNotifications();
      console.log("Push notifications registered");

      return true;
    } catch (error: any) {
      console.log("Error message:", error?.message);
      console.log("Error response:", error?.response);
      console.log("Error response data:", error?.response?.data);

      let errorMessage = "Login failed";

      set({ error: errorMessage });
      return false;
    }
  },

  register: async ({ name, email, password }) => {
    try {
      // Validate inputs
      if (!name || !email || !password) {
        const missingFields = [];
        if (!name) missingFields.push("name");
        if (!email) missingFields.push("email");
        if (!password) missingFields.push("password");

        const errorMessage = `Missing required fields: ${missingFields.join(
          ", "
        )}`;
        set({ error: errorMessage });
        return false;
      }

      if (typeof password !== "string") {
        const errorMessage = `Password must be a string, got: ${typeof password}`;
        set({ error: errorMessage });
        return false;
      }

      if (password.length < 5) {
        const errorMessage = "Password is not strong";
        set({ error: errorMessage });
        return false;
      }

      set({ error: null });

      const res = await axiosInstance.post<RegisterResponse>(
        ENDPOINTS.AUTH.REGISTER,
        {
          name,
          email,
          password, // Send plain password
        }
      );

      console.log("API Response received:", {
        status: res.status,
        statusText: res.statusText,
        data: res.data,
      });

      return true;
    } catch (error: any) {
      console.log("Error message:", error?.message);
      console.log("Error response:", error?.response);
      console.log("Error response data:", error?.response?.data);

      let errorMessage = "Registration failed";

      set({ error: errorMessage });
      return false;
    }
  },

  updateUsername: async (newName: string) => {
    try {
      set({ error: null });
      const res = await axiosInstance.put<AuthResponse>(
        ENDPOINTS.AUTH.UPDATE_USER,
        {
          name: newName,
        }
      );

      set((state) => ({
        user: state.user
          ? {
              ...state.user,
              name: res.data.name,
            }
          : null,
        error: null,
      }));

      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update username";
      set({ error: errorMessage });
      return false;
    }
  },

  logout: async () => {
    try {
      await AsyncStorage.removeItem("token");
      set({ token: null, user: null, error: null });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Logout failed";
      set({ error: errorMessage });
    }
  },

  checkToken: async () => {
    try {
      const stored = await AsyncStorage.getItem("token");
      if (stored) {
        const res = await axiosInstance.get<AuthResponse>(
          ENDPOINTS.AUTH.VERIFY
        );
        set({
          token: stored,
          user: {
            _id: res.data._id,
            name: res.data.name,
            email: res.data.email,
            userImage: res.data.userImage || "",
          },
          loading: false,
          error: null,
        });
      } else {
        set({ token: null, user: null, loading: false, error: null });
      }
    } catch (error) {
      // If token verification fails, clear the stored token
      await AsyncStorage.removeItem("token");
      set({
        token: null,
        user: null,
        loading: false,
        error: "Session expired",
      });
    }
  },

  clearError: () => set({ error: null }),
}));
