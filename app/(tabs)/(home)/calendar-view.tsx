import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

// Sample calendar data
const SAMPLE_CALENDAR_DATA = [
  {
    date: "2024-02-01",
    day: "Thu",
    dayNumber: "1",
    medications: [
      { name: "Aspirin", time: "08:00", taken: true },
      { name: "Vitamin D", time: "09:00", taken: true },
      { name: "Aspirin", time: "20:00", taken: false },
    ],
  },
  {
    date: "2024-02-02",
    day: "Fri",
    dayNumber: "2",
    medications: [
      { name: "Aspirin", time: "08:00", taken: false },
      { name: "Vitamin D", time: "09:00", taken: false },
      { name: "Metformin", time: "14:00", taken: false },
      { name: "Aspirin", time: "20:00", taken: false },
    ],
  },
  {
    date: "2024-02-03",
    day: "Sat",
    dayNumber: "3",
    medications: [
      { name: "Aspirin", time: "08:00", taken: false },
      { name: "Vitamin D", time: "09:00", taken: false },
      { name: "Metformin", time: "14:00", taken: false },
      { name: "Aspirin", time: "20:00", taken: false },
    ],
  },
];

export default function CalendarViewScreen() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState("2024-02-02");
  const [calendarData] = useState(SAMPLE_CALENDAR_DATA);

  const selectedDayData = calendarData.find((day) => day.date === selectedDate);

  const handleTakeDose = (medication: any) => {
    // In a real app, you'd update the medication status
    console.log(`Marked ${medication.name} as taken`);
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
          <Text style={styles.headerTitle}>Calendar View</Text>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Calendar Grid */}
        <View style={styles.calendarSection}>
          <Text style={styles.sectionTitle}>February 2024</Text>
          <View style={styles.calendarGrid}>
            {calendarData.map((day) => (
              <TouchableOpacity
                key={day.date}
                style={[
                  styles.calendarDay,
                  selectedDate === day.date && styles.selectedDay,
                ]}
                onPress={() => setSelectedDate(day.date)}
              >
                <Text
                  style={[
                    styles.dayLabel,
                    selectedDate === day.date && styles.selectedDayText,
                  ]}
                >
                  {day.day}
                </Text>
                <Text
                  style={[
                    styles.dayNumber,
                    selectedDate === day.date && styles.selectedDayText,
                  ]}
                >
                  {day.dayNumber}
                </Text>
                <View style={styles.medicationDots}>
                  {day.medications.map((med, index) => (
                    <View
                      key={index}
                      style={[
                        styles.dot,
                        med.taken ? styles.takenDot : styles.pendingDot,
                      ]}
                    />
                  ))}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Selected Day Details */}
        {selectedDayData && (
          <View style={styles.dayDetailsSection}>
            <Text style={styles.dayDetailsTitle}>
              {selectedDayData.day}, February {selectedDayData.dayNumber}
            </Text>
            {selectedDayData.medications.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="calendar-outline" size={48} color="#ccc" />
                <Text style={styles.emptyStateText}>
                  No medications scheduled for this day
                </Text>
              </View>
            ) : (
              selectedDayData.medications.map((medication, index) => (
                <View key={index} style={styles.medicationItem}>
                  <View style={styles.medicationInfo}>
                    <Text style={styles.medicationName}>{medication.name}</Text>
                    <Text style={styles.medicationTime}>{medication.time}</Text>
                  </View>
                  <View style={styles.medicationStatus}>
                    {medication.taken ? (
                      <View style={styles.takenBadge}>
                        <Ionicons
                          name="checkmark-circle"
                          size={20}
                          color="#4CAF50"
                        />
                        <Text style={styles.takenText}>Taken</Text>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={styles.takeButton}
                        onPress={() => handleTakeDose(medication)}
                      >
                        <Text style={styles.takeButtonText}>Take</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))
            )}
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
  calendarSection: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 15,
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  calendarDay: {
    width: (350 - 32) / 7,
    aspectRatio: 1,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedDay: {
    backgroundColor: "#1a8e2d",
  },
  dayLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
    marginBottom: 2,
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  selectedDayText: {
    color: "white",
  },
  medicationDots: {
    flexDirection: "row",
    gap: 2,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  takenDot: {
    backgroundColor: "#4CAF50",
  },
  pendingDot: {
    backgroundColor: "#FF9800",
  },
  dayDetailsSection: {
    paddingHorizontal: 20,
  },
  dayDetailsTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 15,
  },
  medicationItem: {
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
  medicationInfo: {
    flex: 1,
  },
  medicationName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  medicationTime: {
    fontSize: 14,
    color: "#666",
  },
  medicationStatus: {
    marginLeft: 15,
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
    backgroundColor: "#1a8e2d",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  takeButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  emptyState: {
    alignItems: "center",
    padding: 30,
    backgroundColor: "white",
    borderRadius: 16,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#666",
    marginTop: 10,
  },
});
