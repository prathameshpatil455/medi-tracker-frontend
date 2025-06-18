import axios from "axios";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { create } from "zustand";
import axiosInstance from "../api/axiosInstance";
import { ENDPOINTS } from "../api/endpoints";

type NotificationStore = {
  expoPushToken: string | null;
  registerForPushNotifications: () => Promise<void>;
  sendPushNotification: (
    title: string,
    body: string,
    data?: Record<string, any>
  ) => Promise<void>;
  sendTokenToBackend: (token: string) => Promise<void>;
};

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  expoPushToken: null,

  // Step 1: Register for notifications
  registerForPushNotifications: async () => {
    try {
      if (!Device.isDevice) {
        alert("Must use a physical device for push notifications");
        return;
      }

      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        alert("Failed to get push token!");
        return;
      }

      const token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log("✅ Expo Push Token:", token);
      set({ expoPushToken: token });

      // Send token to backend after registration
      await get().sendTokenToBackend(token);
    } catch (err) {
      console.error("Error registering for push notifications:", err);
    }
  },

  // Send token to backend
  sendTokenToBackend: async (token: string) => {
    try {
      if (token) {
        await axiosInstance.put(ENDPOINTS.AUTH.UPDATE_PUSH_TOKEN, {
          token: token,
        });
        console.log("✅ Push token sent to backend successfully");
      }
    } catch (error) {
      console.log(ENDPOINTS.AUTH.UPDATE_PUSH_TOKEN, "check here");
      console.error("❌ Error sending push token to backend:", error);
    }
  },

  // Step 2: Send push notification
  sendPushNotification: async (title, body, data = {}) => {
    const token = get().expoPushToken;
    if (!token) {
      console.warn("⚠️ No Expo Push Token found. Cannot send notification.");
      return;
    }

    try {
      const message = {
        to: token,
        sound: "default",
        title,
        body,
        data,
        _displayInForeground: true,
        android: {
          channelId: "walletwise",
          icon: "notification_icon",
          color: "#4CAF50",
          priority: "high",
          sticky: false,
          vibrate: [0, 250, 250, 250],
          tag: "walletwise",
        },
        ios: {
          _displayInForeground: true,
          sound: "default",
        },
      };

      const response = await axios.post(
        "https://exp.host/--/api/v2/push/send",
        message,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "Accept-encoding": "gzip, deflate",
          },
        }
      );

      console.log("📩 Push sent:", response.data);
    } catch (error: any) {
      console.error("❌ Push error:", error.response?.data || error.message);
    }
  },
}));
