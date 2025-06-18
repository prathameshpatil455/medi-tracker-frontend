import Header from "@/components/Header";
import { useTheme } from "@/context/ThemeContext";
import { useAuthStore } from "@/store/auth";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const ProfileScreen = () => {
  const { colors } = useTheme();
  const { logout, user, updateUsername } = useAuthStore();
  const router = useRouter();
  const [imageError, setImageError] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(user?.name || "");

  const handleLogout = async () => {
    try {
      // Set auth values to null instead of calling API
      logout();
      router.replace("/(auth)");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const handleUpdateUsername = async () => {
    if (!newName.trim()) {
      Alert.alert("Error", "Name cannot be empty");
      return;
    }

    const success = await updateUsername(newName.trim());
    if (success) {
      setIsEditing(false);
    }
  };

  const profileSections = [
    {
      title: "Account",
      items: [
        {
          id: "personal",
          title: "Personal Information",
          icon: (
            <Ionicons name="person" size={20} color={colors.textSecondary} />
          ),
          action: () => console.log("Personal Information"),
        },
        {
          id: "payment",
          title: "Payment Methods",
          icon: <Ionicons name="card" size={20} color={colors.textSecondary} />,
          action: () => console.log("Payment Methods"),
        },
        {
          id: "security",
          title: "Security",
          icon: (
            <Ionicons name="shield" size={20} color={colors.textSecondary} />
          ),
          action: () => console.log("Security"),
        },
      ],
    },
    {
      title: "Preferences",
      items: [
        {
          id: "notifications",
          title: "Notifications",
          icon: (
            <Ionicons
              name="notifications"
              size={20}
              color={colors.textSecondary}
            />
          ),
          action: () => console.log("Notifications"),
        },
        {
          id: "appearance",
          title: "Appearance",
          icon: <Ionicons name="moon" size={20} color={colors.textSecondary} />,
          action: () => console.log("Appearance"),
        },
      ],
    },
    {
      title: "Support",
      items: [
        {
          id: "help",
          title: "Help Center",
          icon: (
            <Ionicons
              name="help-circle"
              size={20}
              color={colors.textSecondary}
            />
          ),
          action: () => console.log("Help Center"),
        },
        {
          id: "settings",
          title: "App Settings",
          icon: (
            <Ionicons name="settings" size={20} color={colors.textSecondary} />
          ),
          action: () => console.log("App Settings"),
        },
      ],
    },
  ];

  console.log(user?.userImage);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Profile" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Card */}
        <View
          style={[
            styles.profileCard,
            { backgroundColor: colors.cardBackground },
          ]}
        >
          <View style={styles.profileInfo}>
            <View style={styles.imageContainer}>
              {!imageError && user?.userImage ? (
                <Image
                  source={{ uri: user.userImage }}
                  style={styles.profileImage}
                  onError={() => setImageError(true)}
                />
              ) : (
                <View
                  style={[
                    styles.initialsContainer,
                    { backgroundColor: colors.primary },
                  ]}
                >
                  <Text style={styles.initialsText}>
                    {getInitials(user?.name || "User")}
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.profileDetails}>
              <View style={styles.nameContainer}>
                <Text
                  style={[styles.profileName, { color: colors.textPrimary }]}
                >
                  {user?.name}
                </Text>
                <TouchableOpacity
                  onPress={() => setIsEditing(true)}
                  style={[
                    styles.editButton,
                    { backgroundColor: colors.primary },
                  ]}
                >
                  <Text
                    style={[styles.editButtonText, { color: colors.white }]}
                  >
                    Edit
                  </Text>
                </TouchableOpacity>
              </View>
              <Text
                style={[styles.profileEmail, { color: colors.textPrimary }]}
              >
                {user?.email}
              </Text>
            </View>
          </View>
        </View>

        {/* Profile Sections */}
        {profileSections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              {section.title}
            </Text>
            <View
              style={[
                styles.sectionContent,
                { backgroundColor: colors.cardBackground },
              ]}
            >
              {section.items.map((item, index) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.sectionItem,
                    index === section.items.length - 1 &&
                      styles.sectionItemLast,
                  ]}
                  onPress={item.action}
                >
                  <View style={styles.sectionItemLeft}>
                    {item.icon}
                    <Text
                      style={[
                        styles.sectionItemText,
                        { color: colors.textPrimary },
                      ]}
                    >
                      {item.title}
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Logout Button */}
        <TouchableOpacity
          style={[
            styles.logoutButton,
            { backgroundColor: colors.cardBackground },
          ]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out" size={20} color={colors.error} />
          <Text style={[styles.logoutText, { color: colors.error }]}>
            Log Out
          </Text>
        </TouchableOpacity>

        {/* App Version */}
        <Text style={[styles.versionText, { color: colors.textSecondary }]}>
          App Version 1.0.0
        </Text>
      </ScrollView>

      <Modal
        visible={isEditing}
        transparent
        animationType="fade"
        onRequestClose={() => setIsEditing(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: colors.background },
            ]}
          >
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
              Edit Username
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  color: colors.textPrimary,
                  borderColor: colors.border,
                  backgroundColor: colors.cardBackground,
                },
              ]}
              value={newName}
              onChangeText={setNewName}
              placeholder="Enter new username"
              placeholderTextColor={colors.textSecondary}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.error }]}
                onPress={() => {
                  setIsEditing(false);
                  setNewName("");
                }}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  { backgroundColor: colors.primary },
                ]}
                onPress={handleUpdateUsername}
              >
                <Text style={styles.modalButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  profileInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  imageContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: "hidden",
    marginRight: 16,
  },
  profileImage: {
    width: "100%",
    height: "100%",
  },
  profileDetails: {
    flex: 1,
  },
  nameContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "bold",
    textTransform: "capitalize",
  },
  profileEmail: {
    fontSize: 14,
    marginTop: 6,
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 16,
    marginTop: 16,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  versionText: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    padding: 20,
    borderRadius: 12,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  modalButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  sectionContent: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  sectionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  sectionItemLast: {
    borderBottomWidth: 0,
  },
  sectionItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionItemText: {
    fontSize: 16,
    marginLeft: 12,
  },
  initialsContainer: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  initialsText: {
    fontSize: 40,
    color: "white",
    fontWeight: "bold",
  },
});

export default ProfileScreen;
