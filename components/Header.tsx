import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

interface HeaderProps {
  title: string;
  showBack?: boolean;
  onBackPress?: () => void;
  rightComponent?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({
  title,
  showBack = false,
  onBackPress,
  rightComponent,
}) => {
  const { colors } = useTheme();
  const router = useRouter();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  return (
    <View style={[styles.header, { backgroundColor: colors.background }]}>
      <View style={styles.leftContainer}>
        {showBack && (
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <Ionicons
              name="chevron-back"
              size={24}
              color={colors.textPrimary}
            />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.titleContainer}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          {title}
        </Text>
      </View>

      <View style={styles.rightContainer}>{rightComponent}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  leftContainer: {
    flex: 1,
    alignItems: "flex-start",
  },
  titleContainer: {
    flex: 2,
    alignItems: "center",
  },
  rightContainer: {
    flex: 1,
    alignItems: "flex-end",
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
});

export default Header;
