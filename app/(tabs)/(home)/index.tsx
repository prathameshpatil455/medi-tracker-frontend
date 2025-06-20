import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Modal,
  Alert,
  Animated,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "@react-navigation/native";
import Svg, { Circle } from "react-native-svg";
import { useMedicineLogStore } from "../../../store/medicineLog";
import React from "react";
import { formatTime12Hour } from "../../../utils/time";

const { width } = Dimensions.get("window");

const QUICK_ACTIONS = [
  {
    icon: "add-circle-outline" as const,
    label: "Add\nMedication",
    route: "/(tabs)/(medication)/add-medication" as const,
    color: "#2E7D32",
    gradient: ["#4CAF50", "#2E7D32"] as [string, string],
  },
  {
    icon: "calendar-outline" as const,
    label: "Calendar\nView",
    route: "/(tabs)/(home)/calendar-view" as const,
    color: "#1976D2",
    gradient: ["#2196F3", "#1976D2"] as [string, string],
  },
  {
    icon: "time-outline" as const,
    label: "History\nLog",
    route: "/(tabs)/(home)/history-log" as const,
    color: "#C2185B",
    gradient: ["#E91E63", "#C2185B"] as [string, string],
  },
  {
    icon: "medical-outline" as const,
    label: "Refill\nTracker",
    route: "/(tabs)/(medication)/refill-tracker" as const,
    color: "#E64A19",
    gradient: ["#FF5722", "#E64A19"] as [string, string],
  },
];

interface CircularProgressProps {
  progress: number;
  totalDoses: number;
  completedDoses: number;
}

function CircularProgress({
  progress,
  totalDoses,
  completedDoses,
}: CircularProgressProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const size = width * 0.55;
  const strokeWidth = 15;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: progress,
      duration: 1500,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  const AnimatedCircle = Animated.createAnimatedComponent(Circle);

  return (
    <View style={styles.progressContainer}>
      <View style={styles.progressTextContainer}>
        <Text style={styles.progressPercentage}>
          {Math.round(progress * 100)}%
        </Text>
        <Text style={styles.progressDetails}>
          {completedDoses} of {totalDoses} doses
        </Text>
      </View>

      <Svg width={size} height={size} style={styles.progressSvg}>
        {/* Background circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />

        {/* Progress circle */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="white"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
    </View>
  );
}

interface MedicationItemProps {
  item: any;
  onTakeDose: (logItem: any) => void;
}

function MedicationItem({ item, onTakeDose }: MedicationItemProps) {
  const color = item.color || "#4CAF50"; // Use a default color as it's not in the log

  return (
    <View style={styles.medicationCard}>
      <View style={styles.medicationHeader}>
        <View
          style={[styles.medicationBadge, { backgroundColor: `${color}15` }]}
        >
          <Ionicons name="medical" size={24} color={color} />
        </View>
        <View style={styles.medicationInfo}>
          <Text style={styles.medicationName}>{item.medicineName}</Text>
          {/* <Text style={styles.medicationDosage}>{item.dosage || "N/A"}</Text> */}
        </View>
        <View style={styles.medicationStatus}>
          {item.taken ? (
            <View style={styles.takenBadge}>
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
              <Text style={styles.takenText}>Taken</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.takeButton, { backgroundColor: color }]}
              onPress={() => onTakeDose(item)}
            >
              <Text style={styles.takeButtonText}>Take</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.medicationDetails}>
        <View style={styles.timeInfo}>
          <Ionicons name="time-outline" size={16} color="#666" />
          <Text style={styles.timeText}>
            Scheduled: {formatTime12Hour(item.scheduledTime)}
          </Text>
        </View>
        {item.taken && item.takenTime && (
          <View style={styles.frequencyInfo}>
            <Ionicons name="checkmark-done-outline" size={16} color="#666" />
            <Text style={styles.frequencyText}>
              Taken at:{" "}
              {new Date(item.takenTime).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
              {/* {formatTime12Hour(item.takenTime)} */}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const {
    loading,
    error,
    dailyLogs,
    getDailyMedicineLog,
    markMedicineAsTaken,
  } = useMedicineLogStore();

  // Fetch today's medications on mount and focus
  useEffect(() => {
    getDailyMedicineLog();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      getDailyMedicineLog();
    }, [getDailyMedicineLog])
  );

  console.log(dailyLogs, "check here");

  // Extract the 'doses' array from the log object.
  const dailyDoses = (dailyLogs as any)?.doses || [];

  // Calculate progress
  const totalDoses = dailyDoses.length;
  const completedDoses = dailyDoses.filter((log: any) => log.taken).length;
  const progress = totalDoses > 0 ? completedDoses / totalDoses : 0;

  const handleTakeDose = async (logItem: any) => {
    try {
      await markMedicineAsTaken(logItem);
      // No need to alert here, the UI will update optimistically
      getDailyMedicineLog();
    } catch (error) {
      console.error("Error recording dose:", error);
      Alert.alert("Error", "Failed to record dose. Please try again.");
    }
  };

  const renderMedicationItem = ({ item }: { item: any }) => (
    <MedicationItem item={item} onTakeDose={handleTakeDose} />
  );

  const renderQuickActions = () => (
    <View style={styles.quickActionsContainer}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.quickActionsGrid}>
        {QUICK_ACTIONS.map((action) => (
          <Link href={action.route} key={action.label} asChild>
            <TouchableOpacity style={styles.actionButton}>
              <LinearGradient
                colors={action.gradient}
                style={styles.actionGradient}
              >
                <View style={styles.actionContent}>
                  <View style={styles.actionIcon}>
                    <Ionicons name={action.icon} size={28} color="white" />
                  </View>
                  <Text style={styles.actionLabel}>{action.label}</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </Link>
        ))}
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="medical-outline" size={48} color="#ccc" />
      <Text style={styles.emptyStateText}>
        No medications scheduled for today
      </Text>
      <Link href="/(tabs)/(medication)/add-medication" asChild>
        <TouchableOpacity style={styles.addMedicationButton}>
          <Text style={styles.addMedicationButtonText}>Add Medication</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );

  const renderHeader = () => (
    <>
      <LinearGradient colors={["#1a8e2d", "#146922"]} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View style={styles.flex1}>
              <Text style={styles.greeting}>Daily Progress</Text>
            </View>
            <TouchableOpacity
              style={styles.notificationButton}
              onPress={() => setShowNotifications(true)}
            >
              <Ionicons name="notifications-outline" size={24} color="white" />
              {dailyDoses.length > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationCount}>
                    {dailyDoses.length}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <CircularProgress
            progress={progress}
            totalDoses={totalDoses}
            completedDoses={completedDoses}
          />
        </View>
      </LinearGradient>

      {renderQuickActions()}

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Schedule</Text>
          <Link href="/(tabs)/(medication)/add-medication" asChild>
            <TouchableOpacity>
              <Text style={styles.seeAllButton}>See All</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={dailyDoses}
        renderItem={renderMedicationItem}
        keyExtractor={(item, index) =>
          `${item.medicineId}-${item.scheduledTime}-${index}`
        }
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        refreshing={loading}
        onRefresh={getDailyMedicineLog}
      />

      <Modal
        visible={showNotifications}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowNotifications(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Notifications</Text>
              <TouchableOpacity
                onPress={() => setShowNotifications(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            {dailyDoses.map((log: any, index: number) => {
              const color = log.color || "#4CAF50";
              return (
                <View
                  key={`${log.medicineId}-${log.scheduledTime}-${index}`}
                  style={styles.notificationItem}
                >
                  <View style={styles.notificationIcon}>
                    <Ionicons name="medical" size={24} color={color} />
                  </View>
                  <View style={styles.notificationContent}>
                    <Text style={styles.notificationTitle}>
                      {log.medicineName}
                    </Text>
                    {/* <Text style={styles.notificationMessage}>
                      {log.dosage || "N/A"}
                    </Text> */}
                    <Text style={styles.notificationTime}>
                      Scheduled: {formatTime12Hour(log.scheduledTime)}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </Modal>
      {error && (
        <View style={{ padding: 16, backgroundColor: "#ffebee" }}>
          <Text style={{ color: "#c62828" }}>Error: {error}</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  listContainer: {
    flexGrow: 1,
    paddingBottom: 80,
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
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: 20,
  },
  greeting: {
    fontSize: 18,
    fontWeight: "600",
    color: "white",
    opacity: 0.9,
  },
  quickActionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 25,
    paddingTop: 20,
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 15,
  },
  actionButton: {
    width: (width - 52) / 2,
    height: 110,
    borderRadius: 16,
    overflow: "hidden",
  },
  actionGradient: {
    flex: 1,
    padding: 15,
  },
  actionContent: {
    flex: 1,
    justifyContent: "space-between",
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "white",
    marginTop: 8,
  },
  section: {
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  seeAllButton: {
    color: "#2E7D32",
    fontWeight: "600",
  },
  medicationCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  medicationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
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
    alignItems: "flex-start",
  },
  medicationName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 4,
  },
  medicationDosage: {
    fontSize: 14,
    color: "#666",
  },
  medicationStatus: {
    marginLeft: 10,
  },
  takenBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  takenText: {
    color: "#4CAF50",
    fontWeight: "600",
    fontSize: 14,
    marginLeft: 4,
  },
  takeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  takeButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  medicationDetails: {
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "flex-start",
  },
  timeInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeText: {
    marginLeft: 6,
    color: "#666",
    fontSize: 14,
    fontWeight: "500",
  },
  frequencyInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  frequencyText: {
    marginLeft: 6,
    color: "#666",
    fontSize: 14,
    fontWeight: "500",
  },
  separator: {
    height: 12,
  },
  progressContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
  },
  progressTextContainer: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  progressPercentage: {
    fontSize: 36,
    fontWeight: "bold",
    color: "white",
  },
  progressDetails: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 4,
  },
  progressSvg: {
    position: "relative",
  },
  flex1: {
    flex: 1,
  },
  notificationButton: {
    position: "relative",
    padding: 8,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 12,
    marginLeft: 8,
  },
  notificationBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#FF5252",
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#146922",
    paddingHorizontal: 4,
  },
  notificationCount: {
    color: "white",
    fontSize: 11,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  closeButton: {
    padding: 5,
  },
  notificationItem: {
    flexDirection: "row",
    padding: 15,
    borderRadius: 12,
    backgroundColor: "#f5f5f5",
    marginBottom: 10,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: "#999",
  },
  emptyState: {
    alignItems: "center",
    padding: 30,
    backgroundColor: "white",
    borderRadius: 16,
    marginHorizontal: 20,
    marginTop: 20,
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
