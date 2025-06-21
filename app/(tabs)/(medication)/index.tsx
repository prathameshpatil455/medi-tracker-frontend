import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
  Platform,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useMedicationStore } from "../../../store/medication";
import { formatTime12Hour } from "../../../utils/time";
import { useFocusEffect } from "@react-navigation/native";

const WEEKDAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getWeekdayNames(days: number[]) {
  return days.map((d) => WEEKDAY_NAMES[d % 7]);
}

export default function MedicationScreen() {
  const router = useRouter();
  const { medications, fetchMedications, deleteMedication, loading, error } =
    useMedicationStore();

  const [selectedMedication, setSelectedMedication] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);

  console.log(medications, "check them");

  useEffect(() => {
    fetchMedications();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchMedications();
    }, [fetchMedications])
  );

  const handleAddMedication = () => {
    router.push("/(tabs)/(medication)/add-medication");
  };

  const handleRefillTracker = () => {
    router.push("/(tabs)/(medication)/refill-tracker");
  };

  const handleEditMedication = (medication: any) => {
    router.push({
      pathname: "/(tabs)/(medication)/add-medication",
      params: { id: medication.id },
    });
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
            console.log(medication, "this is the medicaition");
            deleteMedication(medication._id);
          },
        },
      ]
    );
  };

  const handleCardPress = (medication: any) => {
    setSelectedMedication(medication);
    setModalVisible(true);
  };

  const renderMedication = ({ item: medication }: { item: any }) => (
    <TouchableOpacity
      key={medication.id}
      style={styles.medicationCard}
      onPress={() => handleCardPress(medication)}
      activeOpacity={0.85}
    >
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
        {medication.dosage ? (
          <Text style={styles.medicationDosage}>{medication.dosage}</Text>
        ) : null}
        <Text style={styles.medicationTime}>
          Start: {new Date(medication.startDate).toLocaleDateString()}
        </Text>
        {medication.endDate && (
          <Text style={styles.medicationTime}>
            End: {new Date(medication.endDate).toLocaleDateString()}
          </Text>
        )}
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
    </TouchableOpacity>
  );

  const renderModal = () => {
    if (!selectedMedication) return null;
    const med = selectedMedication;
    return (
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{med.name}</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalLabel}>Dosage:</Text>
              <Text style={styles.modalValue}>{med.dosage || "-"}</Text>

              <Text style={styles.modalLabel}>Frequency per day:</Text>
              <Text style={styles.modalValue}>
                {med.frequencyPerDay || "-"}
              </Text>

              <Text style={styles.modalLabel}>Days of week:</Text>
              <Text style={styles.modalValue}>
                {med.daysOfWeek && med.daysOfWeek.length > 0
                  ? getWeekdayNames(med.daysOfWeek).join(", ")
                  : "Every day"}
              </Text>

              <Text style={styles.modalLabel}>Times:</Text>
              <Text style={styles.modalValue}>
                {med.times && med.times.length > 0
                  ? med.times.map((t: string) => formatTime12Hour(t)).join(", ")
                  : "-"}
              </Text>

              <Text style={styles.modalLabel}>Tablet count:</Text>
              <Text style={styles.modalValue}>{med.tabletCount || "-"}</Text>

              <Text style={styles.modalLabel}>Start date:</Text>
              <Text style={styles.modalValue}>
                {med.startDate
                  ? new Date(med.startDate).toLocaleDateString()
                  : "-"}
              </Text>

              <Text style={styles.modalLabel}>End date:</Text>
              <Text style={styles.modalValue}>
                {med.endDate ? new Date(med.endDate).toLocaleDateString() : "-"}
              </Text>

              <Text style={styles.modalLabel}>Notes:</Text>
              <Text style={styles.modalValue}>{med.notes || "-"}</Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
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
          {loading ? (
            <Text>Loading...</Text>
          ) : error ? (
            <Text style={{ color: "red" }}>{error}</Text>
          ) : medications.length === 0 ? (
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
            <FlatList
              data={medications}
              renderItem={renderMedication}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingBottom: 120 }}
            />
          )}
        </View>
      </View>
      {renderModal()}
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: Platform.OS === "ios" ? "70%" : "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1a8e2d",
  },
  closeButton: {
    padding: 5,
  },
  modalLabel: {
    fontSize: 14,
    color: "#888",
    marginTop: 12,
    marginBottom: 2,
  },
  modalValue: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
    marginBottom: 4,
  },
});
