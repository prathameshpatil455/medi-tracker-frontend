import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { LinearGradient } from "expo-linear-gradient";
import { useMedicationStore } from "../../../store/medication";
import { formatTime12Hour } from "../../../utils/time";

const { width } = Dimensions.get("window");

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const FREQUENCY_TYPES = [
  { id: "daily", label: "Daily" },
  { id: "weekly", label: "Weekly" },
];

const DURATIONS = [
  { id: "1", label: "7 days", value: 7 },
  { id: "2", label: "14 days", value: 14 },
  { id: "3", label: "30 days", value: 30 },
  { id: "4", label: "90 days", value: 90 },
];

export default function AddMedicationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const medicationId = params.id as string;
  const isEditMode = !!medicationId;

  const {
    addMedication,
    updateMedication,
    allMedications,
    fetchMedications,
    loading,
    error,
  } = useMedicationStore();
  const [form, setForm] = useState({
    name: "",
    dosage: "",
    frequencyType: "daily", // daily, weekly
    weeklyDays: [] as number[], // for weekly (0=Sun, 6=Sat)
    startDate: new Date(),
    endDate: null as Date | null,
    timesPerDay: 1,
    times: ["09:00"],
    notes: "",
    reminderEnabled: true,
    refillReminder: false,
    currentSupply: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showTimePicker, setShowTimePicker] = useState<{
    show: boolean;
    index: number;
  }>({ show: false, index: 0 });
  const [showDatePicker, setShowDatePicker] = useState<{
    show: boolean;
    type: "start" | "end";
  }>({ show: false, type: "start" });
  const [selectedDuration, setSelectedDuration] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch medications on mount
  useEffect(() => {
    fetchMedications();
  }, [fetchMedications]);

  // Load medication data for editing
  useEffect(() => {
    if (isEditMode && allMedications.length > 0) {
      const medication = allMedications.find(
        (med: any) => med._id === medicationId
      );
      if (medication) {
        // Determine frequency type based on daysOfWeek
        const isDaily =
          medication.daysOfWeek && medication.daysOfWeek.length === 7;
        const frequencyType = isDaily ? "daily" : "weekly";

        setForm({
          name: medication.name || "",
          dosage: medication.dosage || "",
          frequencyType,
          weeklyDays: medication.daysOfWeek || [],
          startDate: medication.startDate
            ? new Date(medication.startDate)
            : new Date(),
          endDate: medication.endDate ? new Date(medication.endDate) : null,
          timesPerDay: medication.frequencyPerDay || 1,
          times: medication.times || ["09:00"],
          notes: medication.notes || "",
          reminderEnabled: medication.reminderEnabled ?? true,
          refillReminder: medication.refillReminder ?? false,
          currentSupply: medication.tabletCount?.toString() || "",
        });
        setSelectedDuration(medication.duration || "");
      }
    }
  }, [isEditMode, medicationId, allMedications]);

  // Calculate duration when start and end dates change
  useEffect(() => {
    if (form.startDate && form.endDate) {
      const diffTime = Math.abs(
        form.endDate.getTime() - form.startDate.getTime()
      );
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Find the closest duration option
      const durationOption =
        DURATIONS.find((dur) => dur.value === diffDays) ||
        DURATIONS.find((dur) => dur.value > diffDays) ||
        DURATIONS[DURATIONS.length - 1];

      if (durationOption) {
        setSelectedDuration(durationOption.label);
      }
    }
  }, [form.startDate, form.endDate]);

  // Update frequency type when weekly days change
  useEffect(() => {
    if (form.weeklyDays.length === 7) {
      setForm((prev) => ({ ...prev, frequencyType: "daily" }));
    } else if (form.weeklyDays.length > 0) {
      setForm((prev) => ({ ...prev, frequencyType: "weekly" }));
    }
  }, [form.weeklyDays]);

  // Frequency UI logic
  const handleFrequencyTypeChange = (type: string) => {
    setForm((prev) => ({
      ...prev,
      frequencyType: type,
      weeklyDays: type === "daily" ? [0, 1, 2, 3, 4, 5, 6] : prev.weeklyDays,
    }));
  };

  const handleToggleWeekday = (dayIdx: number) => {
    setForm((prev) => {
      const days = prev.weeklyDays.includes(dayIdx)
        ? prev.weeklyDays.filter((d) => d !== dayIdx)
        : [...prev.weeklyDays, dayIdx];

      // Sort the days to maintain order
      const sortedDays = days.sort((a, b) => a - b);

      return { ...prev, weeklyDays: sortedDays };
    });
  };

  // Time logic
  const handleAddTime = () => {
    setForm((prev) => ({ ...prev, times: [...prev.times, "09:00"] }));
  };
  const handleRemoveTime = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      times: prev.times.filter((_, i) => i !== idx),
    }));
  };
  const handleTimeChange = (idx: number, newTime: string) => {
    setForm((prev) => ({
      ...prev,
      times: prev.times.map((t, i) => (i === idx ? newTime : t)),
    }));
  };

  // Date logic
  const handleDateChange = (type: "start" | "end", date: Date | undefined) => {
    setShowDatePicker({ show: false, type });
    if (date) {
      setForm((prev) => ({
        ...prev,
        [type === "start" ? "startDate" : "endDate"]: date,
      }));
    }
  };

  // When timesPerDay changes, update times array
  const handleTimesPerDayChange = (delta: number) => {
    setForm((prev) => {
      let n = prev.timesPerDay + delta;
      if (n < 1) n = 1;
      let times = prev.times.slice(0, n);
      while (times.length < n) times.push("09:00");
      return { ...prev, timesPerDay: n, times };
    });
  };

  // Validation
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!form.name.trim()) newErrors.name = "Medication name is required";
    if (form.times.length === 0)
      newErrors.times = "At least one time is required";
    if (!form.startDate) newErrors.startDate = "Start date is required";
    if (!selectedDuration) newErrors.duration = "Please select a duration";
    if (form.endDate && form.startDate && form.endDate < form.startDate)
      newErrors.endDate = "End date must be after start date";
    if (form.frequencyType === "weekly" && form.weeklyDays.length === 0) {
      newErrors.weeklyDays = "Select at least one day";
    }
    if (
      !form.currentSupply.trim() ||
      isNaN(Number(form.currentSupply)) ||
      Number(form.currentSupply) <= 0
    ) {
      newErrors.currentSupply = "Enter a valid supply amount";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      Alert.alert("Error", "Please fill in all required fields correctly");
      return;
    }
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const medicationData = {
        name: form.name,
        dosage: form.dosage,
        frequencyPerDay: form.timesPerDay,
        times: form.times,
        startDate: form.startDate.toISOString(),
        endDate: form.endDate ? form.endDate.toISOString() : undefined,
        daysOfWeek:
          form.frequencyType === "weekly"
            ? form.weeklyDays
            : [0, 1, 2, 3, 4, 5, 6],
        notes: form.notes,
        tabletCount: Number(form.currentSupply),
        refillReminder: form.refillReminder,
        reminderEnabled: form.reminderEnabled,
        duration: selectedDuration,
        color: "#4CAF50",
      };
      console.log(medicationData, "check the submitted values");
      if (isEditMode) {
        await updateMedication(medicationId, medicationData);
        Alert.alert("Success", "Medication updated successfully", [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]);
      } else {
        await addMedication(medicationData);
        Alert.alert("Success", "Medication added successfully", [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]);
      }
    } catch (e) {
      Alert.alert("Error", "Failed to save medication. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDurationSelect = (label: string, value: number) => {
    setSelectedDuration(label);
    const newEndDate = new Date(form.startDate);
    newEndDate.setDate(form.startDate.getDate() + value);
    setForm((prev) => ({ ...prev, endDate: newEndDate }));

    if (errors.endDate) {
      setErrors((prev) => ({ ...prev, endDate: "" }));
    }
    if (errors.duration) {
      setErrors((prev) => ({ ...prev, duration: "" }));
    }
  };

  // Render frequency options
  const renderFrequencyOptions = () => (
    <View style={styles.optionsGrid}>
      {FREQUENCY_TYPES.map((freq) => (
        <TouchableOpacity
          key={freq.id}
          style={[
            styles.optionCard,
            form.frequencyType === freq.id && styles.selectedOptionCard,
          ]}
          onPress={() => handleFrequencyTypeChange(freq.id)}
        >
          <Text
            style={[
              styles.optionLabel,
              form.frequencyType === freq.id && styles.selectedOptionLabel,
            ]}
          >
            {freq.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderDurationOptions = () => (
    <View style={styles.optionsGrid}>
      {DURATIONS.map((dur) => (
        <TouchableOpacity
          key={dur.id}
          style={[
            styles.optionCard,
            selectedDuration === dur.label && styles.selectedOptionCard,
          ]}
          onPress={() => handleDurationSelect(dur.label, dur.value)}
        >
          <Text
            style={[
              styles.optionLabel,
              selectedDuration === dur.label && styles.selectedOptionLabel,
            ]}
          >
            {dur.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  // Render extra frequency controls
  const renderFrequencyControls = () => {
    if (form.frequencyType === "weekly") {
      return (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            marginVertical: 10,
          }}
        >
          {WEEKDAYS.map((day, idx) => (
            <TouchableOpacity
              key={day}
              style={[
                styles.weekdayButton,
                form.weeklyDays.includes(idx) && styles.selectedWeekdayButton,
              ]}
              onPress={() => handleToggleWeekday(idx)}
            >
              <Text
                style={[
                  styles.weekdayText,
                  form.weeklyDays.includes(idx) && styles.selectedWeekdayText,
                ]}
              >
                {day[0]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      );
    }
    return null;
  };

  // Render time pickers
  const renderTimePickers = () => (
    <View style={styles.timesContainer}>
      <Text style={styles.timesTitle}>Medication Times</Text>
      <View
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}
      >
        <TouchableOpacity
          onPress={() => handleTimesPerDayChange(-1)}
          style={{ padding: 6 }}
          disabled={form.timesPerDay <= 1}
        >
          <Ionicons
            name="remove-circle"
            size={28}
            color={form.timesPerDay <= 1 ? "#ccc" : "#1a8e2d"}
          />
        </TouchableOpacity>
        <Text
          style={{
            marginHorizontal: 16,
            fontSize: 18,
            fontWeight: "600",
            minWidth: 30,
            textAlign: "center",
          }}
        >
          {form.timesPerDay}
        </Text>
        <TouchableOpacity
          onPress={() => handleTimesPerDayChange(1)}
          style={{ padding: 6 }}
        >
          <Ionicons name="add-circle" size={28} color="#1a8e2d" />
        </TouchableOpacity>
        <Text style={{ marginLeft: 10 }}>times per day</Text>
      </View>
      {form.times.map((time, idx) => (
        <View
          key={idx}
          style={{
            flexDirection: "column",
            alignItems: "flex-start",
            gap: 6,
            marginBottom: 10,
          }}
        >
          <Text
            style={{ marginRight: 10, fontWeight: "600", minWidth: 110 }}
          >{`Medicine time ${idx + 1}`}</Text>
          <TouchableOpacity
            style={styles.timeButton}
            onPress={() => setShowTimePicker({ show: true, index: idx })}
          >
            <View style={styles.timeIconContainer}>
              <Ionicons name="time-outline" size={20} color="#1a8e2d" />
            </View>
            <Text style={styles.timeButtonText}>{formatTime12Hour(time)}</Text>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>
        </View>
      ))}
      {errors.times && <Text style={styles.errorText}>{errors.times}</Text>}
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
          <Text style={styles.headerTitle}>
            {isEditMode ? "Edit Medication" : "New Medication"}
          </Text>
        </View>

        <ScrollView
          style={styles.formContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.formContentContainer}
        >
          {/* Basic Information */}
          <View style={styles.section}>
            <Text style={styles.fieldLabel}>Medication Name *</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.mainInput, errors.name && styles.inputError]}
                placeholder="Enter medication name"
                placeholderTextColor="#999"
                value={form.name}
                onChangeText={(text) => {
                  setForm({ ...form, name: text });
                  if (errors.name) {
                    setErrors({ ...errors, name: "" });
                  }
                }}
              />
              {errors.name && (
                <Text style={styles.errorText}>{errors.name}</Text>
              )}
            </View>

            <Text style={styles.fieldLabel}>Dosage (Optional)</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.mainInput, errors.dosage && styles.inputError]}
                placeholder="e.g., 500mg, 1 tablet"
                placeholderTextColor="#999"
                value={form.dosage}
                onChangeText={(text) => {
                  setForm({ ...form, dosage: text });
                  if (errors.dosage) {
                    setErrors({ ...errors, dosage: "" });
                  }
                }}
              />
              {errors.dosage && (
                <Text style={styles.errorText}>{errors.dosage}</Text>
              )}
            </View>
          </View>

          {/* Frequency */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>How often?</Text>
            {renderFrequencyOptions()}
            {renderFrequencyControls()}
          </View>

          {/* Duration */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>For how long?</Text>
            {renderDurationOptions()}
            {errors.duration && (
              <Text style={styles.errorText}>{errors.duration}</Text>
            )}
          </View>

          {/* Dates */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker({ show: true, type: "start" })}
            >
              <View style={styles.dateIconContainer}>
                <Ionicons name="calendar" size={20} color="#1a8e2d" />
              </View>
              <Text style={styles.dateButtonText}>
                Starts {form.startDate.toLocaleDateString()}
              </Text>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.dateButton, { opacity: 0.7 }]}
              onPress={() => {}}
              disabled
            >
              <View style={styles.dateIconContainer}>
                <Ionicons name="calendar" size={20} color="#1a8e2d" />
              </View>
              <Text style={styles.dateButtonText}>
                Ends{" "}
                {form.endDate
                  ? form.endDate.toLocaleDateString()
                  : "Select a duration"}
              </Text>
            </TouchableOpacity>
            {errors.startDate && (
              <Text style={styles.errorText}>{errors.startDate}</Text>
            )}
            {errors.endDate && (
              <Text style={styles.errorText}>{errors.endDate}</Text>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.fieldLabel}>Current Supply *</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={[
                  styles.mainInput,
                  errors.currentSupply && styles.inputError,
                ]}
                placeholder="e.g., 30 pills, 60 tablets"
                placeholderTextColor="#999"
                value={form.currentSupply}
                onChangeText={(text) => {
                  setForm({ ...form, currentSupply: text });
                  if (errors.currentSupply) {
                    setErrors({ ...errors, currentSupply: "" });
                  }
                }}
                keyboardType="numeric"
              />
              {errors.currentSupply && (
                <Text style={styles.errorText}>{errors.currentSupply}</Text>
              )}
            </View>
          </View>

          {/* Time Pickers */}
          {renderTimePickers()}

          {/* Reminders */}
          <View style={styles.section}>
            <View style={styles.card}>
              <View style={styles.switchRow}>
                <View style={styles.switchLabelContainer}>
                  <View style={styles.iconContainer}>
                    <Ionicons name="notifications" size={20} color="#1a8e2d" />
                  </View>
                  <View style={styles.switchTextContainer}>
                    <Text style={styles.switchLabel}>Reminders</Text>
                    <Text style={styles.switchSubLabel}>
                      Get notified when it's time to take your medication
                    </Text>
                  </View>
                </View>
                <Switch
                  value={form.reminderEnabled}
                  onValueChange={(value) =>
                    setForm({ ...form, reminderEnabled: value })
                  }
                  trackColor={{ false: "#ddd", true: "#1a8e2d" }}
                  thumbColor="white"
                />
              </View>
            </View>
          </View>

          {/* Refill Tracking */}
          <View style={styles.section}>
            <View style={styles.card}>
              <View style={styles.switchRow}>
                <View style={styles.switchLabelContainer}>
                  <View style={styles.iconContainer}>
                    <Ionicons name="reload" size={20} color="#1a8e2d" />
                  </View>
                  <View style={styles.switchTextContainer}>
                    <Text style={styles.switchLabel}>Refill Tracking</Text>
                    <Text style={styles.switchSubLabel}>
                      Get notified when you need to refill
                    </Text>
                  </View>
                </View>
                <Switch
                  value={form.refillReminder}
                  onValueChange={(value) => {
                    setForm({ ...form, refillReminder: value });
                  }}
                  trackColor={{ false: "#ddd", true: "#1a8e2d" }}
                  thumbColor="white"
                />
              </View>
            </View>
          </View>

          {/* Notes */}
          <View style={styles.section}>
            <Text style={styles.fieldLabel}>Notes (Optional)</Text>
            <View style={styles.textAreaContainer}>
              <TextInput
                style={styles.textArea}
                placeholder="Add notes or special instructions..."
                placeholderTextColor="#999"
                value={form.notes}
                onChangeText={(text) => setForm({ ...form, notes: text })}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => router.back()}
              disabled={isSubmitting}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.saveButton,
                isSubmitting && styles.saveButtonDisabled,
              ]}
              onPress={handleSave}
              disabled={isSubmitting}
            >
              <LinearGradient
                colors={["#1a8e2d", "#146922"]}
                style={styles.saveButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.saveButtonText}>
                  {isSubmitting
                    ? isEditMode
                      ? "Updating..."
                      : "Adding..."
                    : isEditMode
                    ? "Update Medication"
                    : "Add Medication"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
      {/* DateTimePickers */}
      {showDatePicker.show && (
        <DateTimePicker
          value={
            form[showDatePicker.type === "start" ? "startDate" : "endDate"] ||
            new Date()
          }
          mode="date"
          onChange={(event: any, date?: Date) =>
            handleDateChange(showDatePicker.type, date)
          }
        />
      )}
      {showTimePicker.show && (
        <DateTimePicker
          value={(() => {
            const [hours, minutes] = form.times[showTimePicker.index]
              .split(":")
              .map(Number);
            const date = new Date();
            date.setHours(hours, minutes, 0, 0);
            return date;
          })()}
          mode="time"
          onChange={(event: any, date?: Date) => {
            setShowTimePicker({ show: false, index: 0 });
            if (date) {
              const newTime = date.toLocaleTimeString("default", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              });
              handleTimeChange(showTimePicker.index, newTime);
            }
          }}
        />
      )}
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
  formContainer: {
    flex: 1,
  },
  formContentContainer: {
    padding: 20,
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 8,
    marginTop: 10,
  },
  mainInput: {
    fontSize: 20,
    color: "#333",
    padding: 15,
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -5,
  },
  optionCard: {
    width: (width - 60) / 2,
    backgroundColor: "white",
    borderRadius: 16,
    padding: 15,
    margin: 5,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  selectedOptionCard: {
    backgroundColor: "#1a8e2d",
    borderColor: "#1a8e2d",
  },
  optionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  selectedOptionIcon: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
  selectedOptionLabel: {
    color: "white",
  },
  durationNumber: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1a8e2d",
    marginBottom: 5,
  },
  selectedDurationNumber: {
    color: "white",
  },
  inputContainer: {
    backgroundColor: "white",
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 15,
    marginTop: 15,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  dateIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  dateButtonText: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  switchLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  switchTextContainer: {
    flex: 1,
    paddingRight: 20,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  switchSubLabel: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
  inputRow: {
    flexDirection: "row",
    marginTop: 15,
    gap: 10,
  },
  flex1: {
    flex: 1,
  },
  input: {
    padding: 15,
    fontSize: 16,
    color: "#333",
  },
  textAreaContainer: {
    backgroundColor: "white",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  textArea: {
    height: 100,
    padding: 15,
    fontSize: 16,
    color: "#333",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 0,
    marginTop: 20,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  cancelButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
  },
  inputError: {
    borderColor: "#FF5252",
  },
  errorText: {
    color: "#FF5252",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 12,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButton: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
  },
  saveButtonGradient: {
    paddingVertical: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
  timesContainer: {
    marginTop: 20,
  },
  timesTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },
  timeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  timeIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  timeButtonText: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  weekdayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    margin: 5,
  },
  selectedWeekdayButton: {
    backgroundColor: "#1a8e2d",
  },
  weekdayText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  selectedWeekdayText: {
    color: "white",
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 8,
  },
});
