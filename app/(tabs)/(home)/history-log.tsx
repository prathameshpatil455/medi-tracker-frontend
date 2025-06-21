import { useEffect, useState } from "react";
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
import { useMedicineLogStore, MedicineLog } from "../../../store/medicineLog";
import { Medication } from "../../../store/medication";

function toLocalYMD(dateStr: string | Date) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-CA");
}

function getMonthDays(year: number, month: number) {
  const days = new Date(year, month + 1, 0).getDate();
  return days;
}

function formatDateWithSuffix(dateStr: string) {
  const date = new Date(dateStr);
  const day = date.getDate();
  const year = date.getFullYear();
  const month = date.toLocaleString("default", { month: "long" });
  let suffix = "th";
  if (day % 10 === 1 && day !== 11) suffix = "st";
  else if (day % 10 === 2 && day !== 12) suffix = "nd";
  else if (day % 10 === 3 && day !== 13) suffix = "rd";
  return `${month} ${day}${suffix}, ${year}`;
}

interface EnrichedMedicineLog {
  id: string;
  date: string;
  taken: boolean;
  skipped: boolean;
  timeTaken?: string;
  medication: Medication;
}

export default function HistoryLogScreen() {
  const router = useRouter();
  const today = new Date();
  const [selectedFilter, setSelectedFilter] = useState("all");

  const { logs, getMonthlyMedicineLogs, loading, error } =
    useMedicineLogStore();

  console.log(logs, "medicine month logs");

  // Fetch this month's logs on mount
  useEffect(() => {
    getMonthlyMedicineLogs(today.getFullYear(), today.getMonth() + 1);
  }, [getMonthlyMedicineLogs]);

  // Group logs by date, only including today and past days
  const todayYMD = toLocalYMD(today);

  // Safely transform and filter logs
  const pastAndPresentLogs = (Array.isArray(logs) ? logs : [])
    .map((log: MedicineLog) => {
      // Assuming the log from the backend might contain the full medication object
      const enrichedLog = log as any;
      return {
        ...log,
        skipped: enrichedLog.skipped || false,
        medication: enrichedLog.medication || ({} as Medication),
      };
    })
    .filter((log) => toLocalYMD(log.date) <= todayYMD);

  const logsByDate = pastAndPresentLogs.reduce((acc, log) => {
    const ymd = toLocalYMD(log.date);
    if (!acc[ymd]) {
      acc[ymd] = [];
    }
    acc[ymd].push(log);
    return acc;
  }, {} as Record<string, typeof pastAndPresentLogs>);

  // Prepare data for UI
  const historyData = Object.keys(logsByDate)
    .sort((a, b) => b.localeCompare(a)) // Most recent first
    .map((ymd) => {
      const dateObj = new Date(`${ymd}T00:00:00`); // Use ISO format to avoid timezone issues
      let dayLabel = dateObj.toLocaleDateString("default", { weekday: "long" });
      if (ymd === todayYMD) {
        dayLabel = "Today";
      } else if (
        ymd ===
        toLocalYMD(
          new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1)
        )
      ) {
        dayLabel = "Yesterday";
      }

      return {
        date: ymd,
        day: dayLabel,
        entries: logsByDate[ymd].map((log) => {
          let status = "missed";
          if (log.taken) status = "taken";
          else if (log.skipped) status = "skipped";

          return {
            id: log.id,
            medication: log.medication.name,
            time: log.medication.times?.join(", ") || "N/A",
            status,
            timestamp: log.timeTaken
              ? new Date(log.timeTaken).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : null,
            color: log.medication.color,
          };
        }),
      };
    })
    .filter((day) => day.entries.length > 0);

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
              (entry: any) => entry.status === selectedFilter
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
                <Text style={styles.dayTitle}>
                  {formatDateWithSuffix(day.date)}
                </Text>
                {day.entries.map((entry: any) => (
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
