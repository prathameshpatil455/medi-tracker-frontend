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
import { Link, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

// Sample medication data
const SAMPLE_MEDICATIONS = [
  {
    id: "1",
    name: "Aspirin",
    dosage: "100mg",
    frequency: "Twice daily",
    time: "08:00, 20:00",
    color: "#4CAF50",
    refillDate: "2024-02-15",
    remainingPills: 15,
  },
  {
    id: "2",
    name: "Vitamin D",
    dosage: "1000 IU",
    frequency: "Once daily",
    time: "09:00",
    color: "#2196F3",
    refillDate: "2024-03-01",
    remainingPills: 28,
  },
  {
    id: "3",
    name: "Metformin",
    dosage: "500mg",
    frequency: "Three times daily",
    time: "08:00, 14:00, 20:00",
    color: "#FF9800",
    refillDate: "2024-02-20",
    remainingPills: 8,
  },
];

export default function MedicationScreen() {
  const router = useRouter();
  const [medications, setMedications] = useState(SAMPLE_MEDICATIONS);

  const handleAddMedication = () => {
    router.push("/(tabs)/(medication)/add-medication");
  };

  const handleRefillTracker = () => {
    router.push("/(tabs)/(medication)/refill-tracker");
  };

  const handleEditMedication = (medication: any) => {
    Alert.alert("Edit Medication", `Edit ${medication.name}`);
  };

  const handleDeleteMedication = (medication: any) => {
    Alert.alert(
      "Delete Medication",
      `Are you sure you want to delete ${medication.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setMedications(medications.filter((m) => m.id !== medication.id));
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient colors={["#1a8e2d", "#146922"]} style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Medications</Text>
          <Text style={styles.headerSubtitle}>
            Manage your medication schedule
          </Text>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleAddMedication}
          >
            <LinearGradient
              colors={["#4CAF50", "#2E7D32"]}
              style={styles.actionGradient}
            >
              <Ionicons name="add-circle-outline" size={24} color="white" />
              <Text style={styles.actionButtonText}>Add Medication</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleRefillTracker}
          >
            <LinearGradient
              colors={["#FF5722", "#E64A19"]}
              style={styles.actionGradient}
            >
              <Ionicons name="medical-outline" size={24} color="white" />
              <Text style={styles.actionButtonText}>Refill Tracker</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Medications List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Medications</Text>
          {medications.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="medical-outline" size={48} color="#ccc" />
              <Text style={styles.emptyStateText}>
                No medications added yet
              </Text>
              <TouchableOpacity
                style={styles.addMedicationButton}
                onPress={handleAddMedication}
              >
                <Text style={styles.addMedicationButtonText}>
                  Add Your First Medication
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            medications.map((medication) => (
              <View key={medication.id} style={styles.medicationCard}>
                <View
                  style={[
                    styles.medicationBadge,
                    { backgroundColor: `${medication.color}15` },
                  ]}
                >
                  <Ionicons name="medical" size={24} color={medication.color} />
                </View>
                <View style={styles.medicationInfo}>
                  <Text style={styles.medicationName}>{medication.name}</Text>
                  <Text style={styles.medicationDosage}>
                    {medication.dosage} • {medication.frequency}
                  </Text>
                  <Text style={styles.medicationTime}>
                    <Ionicons name="time-outline" size={14} color="#666" />{" "}
                    {medication.time}
                  </Text>
                  <Text style={styles.refillInfo}>
                    <Ionicons name="calendar-outline" size={14} color="#666" />{" "}
                    Refill: {medication.refillDate} •{" "}
                    {medication.remainingPills} pills left
                  </Text>
                </View>
                <View style={styles.medicationActions}>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => handleEditMedication(medication)}
                  >
                    <Ionicons name="pencil" size={16} color="#2196F3" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteMedication(medication)}
                  >
                    <Ionicons name="trash" size={16} color="#F44336" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    paddingTop: 50,
    paddingBottom: 25,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    alignItems: "center",
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
  },
  content: {
    flex: 1,
    paddingTop: 20,
  },
  actionButtons: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 25,
  },
  actionButton: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    overflow: "hidden",
  },
  actionGradient: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  actionButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  section: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 15,
  },
  medicationCard: {
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
  medicationDosage: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  medicationTime: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  refillInfo: {
    fontSize: 14,
    color: "#666",
  },
  medicationActions: {
    flexDirection: "row",
    gap: 8,
  },
  editButton: {
    padding: 8,
    backgroundColor: "#E3F2FD",
    borderRadius: 8,
  },
  deleteButton: {
    padding: 8,
    backgroundColor: "#FFEBEE",
    borderRadius: 8,
  },
  emptyState: {
    alignItems: "center",
    padding: 30,
    backgroundColor: "white",
    borderRadius: 16,
    marginTop: 10,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#666",
    marginTop: 10,
    marginBottom: 20,
  },
  addMedicationButton: {
    backgroundColor: "#1a8e2d",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  addMedicationButtonText: {
    color: "white",
    fontWeight: "600",
  },
});
