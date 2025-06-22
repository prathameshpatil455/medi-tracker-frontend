import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useMedicationStore } from "../../../store/medication";

export default function RefillTrackerScreen() {
  const router = useRouter();
  const { refillWarnings, fetchRefillWarnings, loading, error } =
    useMedicationStore();

  console.log(refillWarnings, "check refill");

  useEffect(() => {
    fetchRefillWarnings();
  }, []);

  const handleRefillNow = (medication: any) => {
    router.push({
      pathname: "/(tabs)/(medication)/add-medication",
      params: { id: medication.medicineId },
    });
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#1a8e2d", "#146922"]} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Refill Tracker</Text>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* All Refills */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Medications to Refill</Text>
          {refillWarnings.map((medication, index) => (
            <View
              key={`refill-${(medication as any).medicineId || index}`}
              style={styles.refillCard}
            >
              <View
                style={[
                  styles.medicationBadge,
                  { backgroundColor: "#4CAF5015" },
                ]}
              >
                <Ionicons name="medical" size={24} color="#4CAF50" />
              </View>
              <View style={styles.medicationInfo}>
                <Text style={styles.medicationName}>{medication.name}</Text>
                <Text style={styles.pillsInfo}>
                  {medication.tabletCount} pills remaining
                </Text>
                <Text style={styles.refillDate}>
                  Refill by:{" "}
                  {new Date(
                    new Date().setDate(
                      new Date().getDate() + (medication.daysLeft || 0)
                    )
                  ).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.refillButton}
                  onPress={() => handleRefillNow(medication)}
                >
                  <Text style={styles.refillButtonText}>Refill</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {refillWarnings.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="medical-outline" size={48} color="#ccc" />
            <Text style={styles.emptyStateText}>No medications to track</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 8,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingTop: 20,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  urgentTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FF5722",
    marginLeft: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 15,
  },
  refillCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  medicationBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  medicationInfo: {
    flex: 1,
  },
  medicationName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  pillsInfo: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  refillDate: {
    fontSize: 14,
    color: "#666",
  },
  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  refillButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  refillButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 12,
  },
  emptyState: {
    alignItems: "center",
    padding: 30,
    backgroundColor: "white",
    borderRadius: 16,
    marginHorizontal: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#666",
    marginTop: 10,
  },
});
