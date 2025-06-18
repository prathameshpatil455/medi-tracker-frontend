import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { Medication } from "./storage";

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const registerForPushNotificationsAsync = async (): Promise<
  string | null
> => {
  try {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("Failed to get push token for push notification!");
      return null;
    }

    const token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log("Push token:", token);

    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    return token;
  } catch (error) {
    console.error("Error registering for push notifications:", error);
    return null;
  }
};

export const scheduleMedicationReminder = async (
  medication: Medication
): Promise<void> => {
  try {
    if (!medication.reminderEnabled) {
      return;
    }

    // For now, just log that we would schedule reminders
    console.log(
      `Would schedule reminders for ${
        medication.name
      } at times: ${medication.times.join(", ")}`
    );

    // TODO: Implement actual scheduling when notification triggers are properly configured
  } catch (error) {
    console.error("Error scheduling medication reminder:", error);
  }
};

export const cancelMedicationReminders = async (
  medicationId: string
): Promise<void> => {
  try {
    console.log(`Would cancel reminders for medication: ${medicationId}`);
    // TODO: Implement actual cancellation when notification triggers are properly configured
  } catch (error) {
    console.error("Error canceling medication reminders:", error);
  }
};
