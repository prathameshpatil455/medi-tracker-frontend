import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useAuthStore } from "../../store/auth";

export default function SplashScreen() {
  const router = useRouter();
  const { checkToken, token } = useAuthStore();

  useEffect(() => {
    const init = async () => {
      await checkToken();
      router.replace(token ? "/(tabs)" : "/login");
    };
    init();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Money Tracker</Text>
      <ActivityIndicator size="large" color="#4169E1" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  text: { fontSize: 24, marginBottom: 20 },
});
