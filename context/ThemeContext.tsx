import { COLORS } from "@/constants/Colors";
import React, { createContext, useContext } from "react";

interface ThemeContextType {
  colors: {
    primary: string;
    primaryLight: string;
    textPrimary: string;
    textSecondary: string;
    textDark: string;
    placeholderText: string;
    background: string;
    cardBackground: string;
    inputBackground: string;
    border: string;
    white: string;
    black: string;
    error: string;
    errorLight: string;
    red: string;
  };
}

const ThemeContext = createContext<ThemeContextType>({
  colors: {
    primary: COLORS.primary,
    primaryLight: COLORS.primaryLight,
    textPrimary: COLORS.textPrimary,
    textSecondary: COLORS.textSecondary,
    textDark: COLORS.textDark,
    placeholderText: COLORS.placeholderText,
    background: COLORS.background,
    cardBackground: COLORS.cardBackground,
    inputBackground: COLORS.inputBackground,
    border: COLORS.border,
    white: COLORS.white,
    black: COLORS.black,
    error: COLORS.error,
    errorLight: COLORS.errorLight,
    red: COLORS.red,
  },
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <ThemeContext.Provider
      value={{
        colors: {
          primary: COLORS.primary,
          primaryLight: COLORS.primaryLight,
          textPrimary: COLORS.textPrimary,
          textSecondary: COLORS.textSecondary,
          textDark: COLORS.textDark,
          placeholderText: COLORS.placeholderText,
          background: COLORS.background,
          cardBackground: COLORS.cardBackground,
          inputBackground: COLORS.inputBackground,
          border: COLORS.border,
          white: COLORS.white,
          black: COLORS.black,
          error: COLORS.error,
          errorLight: COLORS.errorLight,
        },
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
