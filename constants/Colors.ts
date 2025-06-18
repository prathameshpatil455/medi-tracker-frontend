const tintColorLight = "#2f95dc";
const tintColorDark = "#fff";

export const COLORS = {
  primary: "#2f95dc",
  background: "#2c2c2c",
  cardBackground: "#383838",
  inputBackground: "#2c2c2c",
  text: "#000",
  textPrimary: "#bdbdbd",
  textSecondary: "#585858",
  textDark: "#ffffff",
  placeholderText: "#999",
  border: "#585858",

  white: "#ffffff",
  black: "#000000",

  error: "#FF5252", // Original
  errorLight: "#D32F2F", // Lighter shade of error (red)

  red: "#FF5252",
  // Add more colors as needed
};

export default {
  light: {
    text: "#000",
    background: "#fff",
    tint: tintColorLight,
    tabIconDefault: "#ccc",
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: "#fff",
    background: "#000",
    tint: tintColorDark,
    tabIconDefault: "#ccc",
    tabIconSelected: tintColorDark,
  },
};
