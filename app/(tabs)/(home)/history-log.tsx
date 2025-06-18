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

// Sample history data
const SAMPLE_HISTORY_DATA = [
  {
    date: "2024-02-02",
    day: "Today",
    entries: [
      {
        id: "1",
        medication: "Aspirin",
        time: "08:00",
        status: "taken",
        timestamp: "08:05",
        color: "#4CAF50",
      },
      {
        id: "2",
        medication: "Vitamin D",
        time: "09:00",
        status: "taken",
        timestamp: "09:02",
        color: "#2196F3",
      },
      {
        id: "3",
        medication: "Metformin",
        time: "14:00",
        status: "missed",
        timestamp: null,
        color: "#FF9800",
      },
    ],
  },
  {
    date: "2024-02-01",
    day: "Yesterday",
    entries: [
      {
        id: "4",
        medication: "Aspirin",
        time: "08:00",
        status: "taken",
        timestamp: "08:03",
        color: "#4CAF50",
      },
      {
        id: "5",
        medication: "Vitamin D",
        time: "09:00",
        status: "taken",
        timestamp: "09:15",
        color: "#2196F3",
      },
      {
        id: "6",
        medication: "Aspirin",
        time: "20:00",
        status: "taken",
        timestamp: "20:30",
        color: "#4CAF50",
      },
    ],
  },
  {
    date: "2024-01-31",
    day: "2 days ago",
    entries: [
      {
        id: "7",
        medication: "Aspirin",
        time: "08:00",
        status: "missed",
        timestamp: null,
        color: "#4CAF50",
      },
      {
        id: "8",
        medication: "Vitamin D",
        time: "09:00",
        status: "taken",
        timestamp: "09:00",
        color: "#2196F3",
      },
    ],
  },
];

export default function HistoryLogScreen() {
  const router = useRouter();
  const [historyData] = useState(SAMPLE_HISTORY_DATA);
  const [selectedFilter, setSelectedFilter] = useState("all");

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "taken":
        return "checkmark-circle";
      case "missed":
        return "close-circle";
      case "skipped":
        return "remove-circle";
      default:
        return "help-circle";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "taken":
        return "#4CAF50";
      case "missed":
        return "#F44336";
      case "skipped":
        return "#FF9800";
      default:
        return "#999";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "taken":
        return "Taken";
      case "missed":
        return "Missed";
      case "skipped":
        return "Skipped";
      default:
        return "Unknown";
    }
  };

  const filteredData =
    selectedFilter === "all"
      ? historyData
      : historyData
          .map((day) => ({
            ...day,
            entries: day.entries.filter(
              (entry) => entry.status === selectedFilter
            ),
          }))
          .filter((day) => day.entries.length > 0);

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
          <Text style={styles.headerTitle}>History Log</Text>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Filter Buttons */}
        <View style={styles.filterSection}>
          <Text style={styles.sectionTitle}>Filter by Status</Text>
          <View style={styles.filterButtons}>
            <TouchableOpacity
              style={[
                styles.filterButton,
                selectedFilter === "all" && styles.activeFilterButton,
              ]}
              onPress={() => setSelectedFilter("all")}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  selectedFilter === "all" && styles.activeFilterButtonText,
                ]}
              >
                All
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterButton,
                selectedFilter === "taken" && styles.activeFilterButton,
              ]}
              onPress={() => setSelectedFilter("taken")}
            >
              <Ionicons
                name="checkmark-circle"
                size={16}
                color={selectedFilter === "taken" ? "white" : "#4CAF50"}
              />
              <Text
                style={[
                  styles.filterButtonText,
                  selectedFilter === "taken" && styles.activeFilterButtonText,
                ]}
              >
                Taken
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterButton,
                selectedFilter === "missed" && styles.activeFilterButton,
              ]}
              onPress={() => setSelectedFilter("missed")}
            >
              <Ionicons
                name="close-circle"
                size={16}
                color={selectedFilter === "missed" ? "white" : "#F44336"}
              />
              <Text
                style={[
                  styles.filterButtonText,
                  selectedFilter === "missed" && styles.activeFilterButtonText,
                ]}
              >
                Missed
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* History Entries */}
        <View style={styles.historySection}>
          {filteredData.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="time-outline" size={48} color="#ccc" />
              <Text style={styles.emptyStateText}>
                No history entries found
              </Text>
            </View>
          ) : (
            filteredData.map((day) => (
              <View key={day.date} style={styles.daySection}>
                <Text style={styles.dayTitle}>{day.day}</Text>
                {day.entries.map((entry) => (
                  <View key={entry.id} style={styles.historyItem}>
                    <View
                      style={[
                        styles.medicationBadge,
                        { backgroundColor: `${entry.color}15` },
                      ]}
                    >
                      <Ionicons name="medical" size={20} color={entry.color} />
                    </View>
                    <View style={styles.entryInfo}>
                      <Text style={styles.medicationName}>
                        {entry.medication}
                      </Text>
                      <Text style={styles.entryTime}>
                        Scheduled: {entry.time}
                        {entry.timestamp && ` • Taken: ${entry.timestamp}`}
                      </Text>
                    </View>
                    <View style={styles.statusContainer}>
                      <Ionicons
                        name={getStatusIcon(entry.status)}
                        size={20}
                        color={getStatusColor(entry.status)}
                      />
                      <Text
                        style={[
                          styles.statusText,
                          { color: getStatusColor(entry.status) },
                        ]}
                      >
                        {getStatusText(entry.status)}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            ))
          )}
        </View>
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
  filterSection: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 15,
  },
  filterButtons: {
    flexDirection: "row",
    gap: 8,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  activeFilterButton: {
    backgroundColor: "#1a8e2d",
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  activeFilterButtonText: {
    color: "white",
  },
  historySection: {
    paddingHorizontal: 20,
  },
  daySection: {
    marginBottom: 25,
  },
  dayTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 12,
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  medicationBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  entryInfo: {
    flex: 1,
  },
  medicationName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  entryTime: {
    fontSize: 14,
    color: "#666",
  },
  statusContainer: {
    alignItems: "center",
    marginLeft: 15,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
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
