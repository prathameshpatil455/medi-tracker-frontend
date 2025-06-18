import { useTheme } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "../../store/auth";
import styles from "../../styles/signup.styles";

export default function Signup() {
  const { colors } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [userName, setUserName] = useState("");
  const router = useRouter();
  const { register, error, clearError } = useAuthStore();

  const handleSignUp = async () => {
    console.log("=== SIGNUP COMPONENT DEBUG ===");
    console.log("Form values:", {
      userName,
      email,
      password: password ? "***" : "undefined",
      passwordType: typeof password,
      passwordLength: password ? password.length : "N/A",
    });

    if (!userName || !email || !password) {
      console.log("Form validation failed - missing fields");
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    try {
      setIsLoading(true);
      clearError();

      const success = await register({
        name: userName,
        email: email.toLowerCase().trim(),
        password,
      });

      if (success) {
        // Alert.alert(
        //   "Registration Successful!",
        //   "Your account has been created. Please login with your credentials.",
        //   [
        //     {
        //       text: "OK",
        //       onPress: () => router.back(),
        //     },
        //   ]
        // );
        router.replace("/(auth)");
      } else {
        console.log("Registration failed, error:", error);
        Alert.alert(
          "Registration Failed",
          "Please check your details and try again"
        );
      }
    } catch (err) {
      console.error("Registration error:", err);
      Alert.alert(
        "Error",
        "An error occurred during registration. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={[
        localStyles.mainContainer,
        { backgroundColor: colors.background },
      ]}
      edges={["top"]}
    >
      <KeyboardAvoidingView
        style={localStyles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      >
        <ScrollView
          contentContainerStyle={localStyles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={[styles.container, localStyles.contentContainer]}>
            <View style={styles.card}>
              <View style={styles.header}>
                <Text style={styles.title}>MediTracker</Text>
                <Text style={styles.subtitle}>
                  Best way to manage your medicines
                </Text>
              </View>
              <View style={styles.formContainer}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>UserName</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons
                      name="person-outline"
                      size={24}
                      color={colors.primary}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your username"
                      placeholderTextColor={colors.placeholderText}
                      onChangeText={setUserName}
                      value={userName}
                      autoCapitalize="none"
                      keyboardType="default"
                      returnKeyType="next"
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons
                      name="mail-outline"
                      size={24}
                      color={colors.primary}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your email"
                      placeholderTextColor={colors.placeholderText}
                      onChangeText={setEmail}
                      value={email}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      returnKeyType="next"
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Password</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons
                      name="lock-closed-outline"
                      size={24}
                      color={colors.primary}
                      style={styles.inputIcon}
                    />

                    <TextInput
                      style={styles.input}
                      placeholder="*******"
                      placeholderTextColor={colors.placeholderText}
                      secureTextEntry={!showPassword}
                      onChangeText={setPassword}
                      value={password}
                      returnKeyType="done"
                      onSubmitEditing={Keyboard.dismiss}
                    />

                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeIcon}
                    >
                      <Ionicons
                        name={showPassword ? "eye-outline" : "eye-off-outline"}
                        size={20}
                        color={colors.primary}
                        style={styles.inputIcon}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={handleSignUp}
                  style={styles.button}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>Register</Text>
                  )}
                </TouchableOpacity>

                <View style={styles.footer}>
                  <Text style={styles.footerText}>
                    Already have an account?
                  </Text>
                  <TouchableOpacity onPress={() => router.back()}>
                    <Text style={styles.link}>Login</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    paddingVertical: 20,
  },
});
