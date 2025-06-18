import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function AuthLayout() {
  const colorScheme = useColorScheme();

  return (
    <SafeAreaProvider>
      <StatusBar style={colorScheme === "dark" ? "dark" : "light"} />
      <Stack screenOptions={{ headerShown: false }} />;
    </SafeAreaProvider>
  );
}
