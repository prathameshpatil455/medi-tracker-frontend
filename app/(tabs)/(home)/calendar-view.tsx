import React, { useState, useCallback, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useMedicationStore } from "../../../store/medication";
import { useMedicineLogStore } from "../../../store/medicineLog";
import { useFocusEffect } from "@react-navigation/native";
import { formatTime12Hour } from "@/utils/time";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getDaysInMonth(year: number, month: number) {
  const days = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  return { days, firstDay };
}

function toLocalYMD(dateStr: string | Date) {
  const d = new Date(dateStr);
  // 'en-CA' gives YYYY-MM-DD
  return d.toLocaleDateString("en-CA");
}

export default function CalendarScreen() {
  const router = useRouter();
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarYear, setCalendarYear] = useState(today.getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(today.getMonth());
  const { monthlyLogs, getMonthlyMedicineLogs, loading, error } =
    useMedicineLogStore();

  console.log(monthlyLogs, "montly logs");

  // Fetch monthly logs on mount and when month/year changes
  useEffect(() => {
    getMonthlyMedicineLogs(calendarYear, calendarMonth + 1);
  }, [calendarYear, calendarMonth, getMonthlyMedicineLogs]);

  // When month changes, reset selectedDate to first of month if not in current month
  useEffect(() => {
    if (
      selectedDate.getFullYear() !== calendarYear ||
      selectedDate.getMonth() !== calendarMonth
    ) {
      setSelectedDate(new Date(calendarYear, calendarMonth, 1));
    }
  }, [calendarYear, calendarMonth]);

  const logStatusByDate = useMemo(() => {
    const statusMap: { [key: string]: { allTaken: boolean } } = {};
    if (!Array.isArray(monthlyLogs)) return statusMap;

    const logsByDate = monthlyLogs.reduce((acc, log) => {
      const ymd = toLocalYMD(log.date);
      if (!acc[ymd]) {
        acc[ymd] = [];
      }
      acc[ymd].push(log);
      return acc;
    }, {} as { [key: string]: any[] });

    for (const date in logsByDate) {
      const logs = logsByDate[date];
      if (logs.length > 0) {
        const allTaken = logs.every((log) => log.taken);
        statusMap[date] = { allTaken };
      }
    }
    return statusMap;
  }, [monthlyLogs]);

  // Calendar grid
  const { days, firstDay } = getDaysInMonth(calendarYear, calendarMonth);
  const weeks: (Date | null)[][] = [];
  let week: (Date | null)[] = [];
  // Fill initial empty days
  for (let i = 0; i < firstDay; i++) week.push(null);
  for (let day = 1; day <= days; day++) {
    week.push(new Date(calendarYear, calendarMonth, day));
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  if (week.length > 0) {
    while (week.length < 7) week.push(null);
    weeks.push(week);
  }

  // Filter logs for selected day
  const selectedYMD = toLocalYMD(selectedDate);
  const logsForDay = (Array.isArray(monthlyLogs) ? monthlyLogs : []).filter(
    (log: any) => log.date === selectedYMD
  );

  // Render calendar grid
  const renderCalendar = () => (
    <View>
      <View style={styles.weekdayHeader}>
        {WEEKDAYS.map((day) => (
          <Text key={day} style={styles.weekdayText}>
            {day}
          </Text>
        ))}
      </View>
      {weeks.map((week, i) => (
        <View key={i} style={styles.calendarWeek}>
          {week.map((date, j) => {
            const isToday =
              date && date.toDateString() === today.toDateString();
            const isSelected =
              date && date.toDateString() === selectedDate.toDateString();

            const ymd = date ? toLocalYMD(date) : null;
            const logStatus = ymd ? logStatusByDate[ymd] : null;
            const isPast = date && date < today;

            let statusTextStyle = {};
            if (logStatus && isPast && !isSelected && !isToday) {
              statusTextStyle = {
                color: logStatus.allTaken
                  ? "#4CAF50" // Green
                  : "#F44336", // Red
                fontWeight: "600",
              };
            }

            return (
              <TouchableOpacity
                key={j}
                style={[
                  styles.calendarDay,
                  isToday && styles.today,
                  isSelected && styles.selectedDay,
                ]}
                disabled={!date}
                onPress={() => date && setSelectedDate(date)}
              >
                <Text
                  style={[
                    styles.dayText,
                    statusTextStyle, // Apply status text style
                    isToday && styles.todayText,
                    isSelected && styles.selectedDayText,
                  ]}
                >
                  {date ? date.getDate() : ""}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );

  // Render logs for selected day
  const renderLogsForDate = () => (
    <View>
      {loading ? (
        <View style={{ paddingVertical: 30, alignItems: "center" }}>
          <ActivityIndicator size="large" color="#1a8e2d" />
        </View>
      ) : logsForDay.length === 0 ? (
        <Text style={{ color: "#666", textAlign: "center", marginTop: 20 }}>
          No medications scheduled for this day
        </Text>
      ) : (
        logsForDay.map((log) => (
          <View key={log.id} style={styles.medicationCard}>
            <View
              style={[styles.medicationColor, { backgroundColor: log.color }]}
            />
            <View style={styles.medicationInfo}>
              <Text style={styles.medicationName}>{log.medicineName}</Text>
              {/* <Text style={styles.medicationDosage}>{log.dosage}</Text> */}
              <Text style={styles.medicationTime}>
                Scheduled: {formatTime12Hour(log?.scheduledTime || "")}
              </Text>
            </View>
            <View style={styles.takenBadge}>
              <Ionicons
                name={log.taken ? "checkmark-circle" : "ellipse-outline"}
                size={20}
                color={log.taken ? "#4CAF50" : "#FF9800"}
              />
              <Text style={styles.takenText}>
                {log.taken ? "Taken" : "Not taken"}
              </Text>
            </View>
          </View>
        ))
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#1a8e2d", "#146922"]}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      />
      <View style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Calendar</Text>
        </View>
        <ScrollView
          showsVerticalScrollIndicator={false}
          // contentContainerStyle={{ paddingBottom: 40 }}
        >
          <View style={styles.calendarContainer}>
            <View style={styles.monthHeader}>
              <TouchableOpacity
                onPress={() => {
                  if (calendarMonth === 0) {
                    setCalendarYear(calendarYear - 1);
                    setCalendarMonth(11);
                  } else {
                    setCalendarMonth(calendarMonth - 1);
                  }
                }}
              >
                <Ionicons name="chevron-back" size={24} color="#333" />
              </TouchableOpacity>
              <Text style={styles.monthText}>
                {new Date(calendarYear, calendarMonth).toLocaleString(
                  "default",
                  {
                    month: "long",
                    year: "numeric",
                  }
                )}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  if (calendarMonth === 11) {
                    setCalendarYear(calendarYear + 1);
                    setCalendarMonth(0);
                  } else {
                    setCalendarMonth(calendarMonth + 1);
                  }
                }}
              >
                <Ionicons name="chevron-forward" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            {renderCalendar()}
          </View>
          <View style={styles.scheduleContainer}>
            <Text style={styles.scheduleTitle}>
              {selectedDate.toLocaleDateString("default", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </Text>
            {renderLogsForDate()}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  headerGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: Platform.OS === "ios" ? 140 : 120,
  },
  content: {
    flex: 1,
    paddingTop: Platform.OS === "ios" ? 50 : 30,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 25,
    zIndex: 1,
  },
  backButton: {
    padding: 8,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "white",
    marginLeft: 15,
  },
  calendarContainer: {
    backgroundColor: "white",
    borderRadius: 16,
    margin: 20,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  monthHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  monthText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  weekdayHeader: {
    flexDirection: "row",
    marginBottom: 10,
  },
  weekdayText: {
    flex: 1,
    textAlign: "center",
    color: "#666",
    fontWeight: "500",
  },
  calendarWeek: {
    flexDirection: "row",
    marginBottom: 5,
  },
  calendarDay: {
    flex: 1,
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
  dayText: {
    fontSize: 16,
    color: "#333",
  },
  today: {
    backgroundColor: "#1a8e2d15",
  },
  todayText: {
    color: "#1a8e2d",
    fontWeight: "600",
  },
  selectedDay: {
    backgroundColor: "#1a8e2d33",
  },
  selectedDayText: {
    color: "#1a8e2d",
    fontWeight: "bold",
  },
  scheduleContainer: {
    flex: 1,
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 50,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  scheduleTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginBottom: 15,
  },
  medicationCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  medicationColor: {
    width: 12,
    height: 40,
    borderRadius: 6,
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
    marginBottom: 2,
  },
  medicationTime: {
    fontSize: 14,
    color: "#666",
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
});
