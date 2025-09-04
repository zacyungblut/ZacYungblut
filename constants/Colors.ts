// renamed file to Colors.ts
export const colors = {
  // Primary colors
  // primary: "#1a2151",
  hero: "#121212",
  heroSecondary: "white",
  offBlack: "#121212",
  primary: "#000000",
  primaryLight: "#2a3161",
  primaryDark: "#0a1041",
  white: "#FFFFFF",
  red: "red",
  blue: "blue",
  signup: "#34c6ff", // Slightly brighter vibrant blue for signup button

  // Secondary colors
  secondary: "#ff6b00",
  secondaryLight: "#ff8533",
  secondaryDark: "#cc5500",

  success: "#111111",
  waiting: "#444",

  // Background colors
  background: {
    primary: "#FFFFFF",
    secondary: "#f7f7f7",
    tertiary: "#f7f7f7",
    quaternary: "#f1f1f1",
    dark: "#121212",
    darkSecondary: "#1E1E1E",
    transparent: "transparent",
    red: "red", // for debugging
    green: "green", // for debugging
    blue: "blue", // for debugging
    gradient: "#7d839e", // Add this for the old gradient color
    black: "#000000",
    gray: "white",
    nightSky: "black",
    nightSkySecondary: "#030b29",
    nightSkyTertiary: "#182047",
    bottomBarNotificationBadgePrimary: "#ff6b00",
    bottomBarNotificationBadgeSecondary: "#ff8533",
    warningLight: "rgba(184, 134, 11, 0.1)", // Light warning background with darker yellow
  },

  // Text colors
  text: {
    primary: "#000000",
    secondary: "#333333",
    tertiary: "#666666",
    quaternary: "#999999",
    light: "#E0E0E0",
    white: "#FFFFFF",
    placeholder: "#CCCCCC",
  },

  icon: {
    focused: "black",
    unfocused: "#222222",
  },

  // Border colors
  border: {
    light: "#f0f0f0",
    medium: "#e0e0e0",
    dark: "#9b9b9b",
    placeholder: "#CCCCCC",
    focus: "#F0F0F5",
  },

  // Status colors
  status: {
    success: "#28a745",
    error: "#dc3545",
    warning: "#B8860B", // Darker yellow/gold color for better contrast
    info: "#17a2b8",
    unread: "#0095f6",
  },

  // Card and surface colors
  surface: {
    white: "#FFFFFF",
    light: "#F8F9FA",
    medium: "#F0F0F0",
    overlay: "rgba(0, 0, 0, 0.5)",
    overlayLight: "rgba(0, 0, 0, 0.2)",
    overlaySuperLight: "rgba(0, 0, 0, 0.05)",
    overlayDark: "rgba(0, 0, 0, 0.8)",
  },

  // Interactive colors
  interactive: {
    pressed: "rgba(0, 0, 0, 0)",
    disabled: "rgba(0, 0, 0, 0)",
    highlight: "rgba(255, 223, 186, 0.2)",
  },

  // Message indicator colors for friend group logic
  sender: "#4A90E2",
  receiver: "#FF4444",

  // Gradient colors
  gradient: {
    gold: "#FFD700",
    goldLight: "#66BB6A", // Material green 400 - light green for gradient
    goldMedium: "#4CAF50", // Material green 500 - medium green for gradient
    goldDark: "#B8860B", // Darker metallic gold
    goldDeep: "#388E3C", // Material green 700 - deep green for gradient
    goldShadow: "#1B5E20", // Material green 900 - dark green shadow
    premiumStart: "rgba(18, 18, 18, 0.85)",
    premiumEnd: "rgba(18, 18, 18, 0.95)",
  },
  accent: {
    primary: "#ff6b00",
  },

  // Shadow colors
  shadow: {
    light: "rgba(0, 0, 0, 0.1)",
    medium: "rgba(0, 0, 0, 0.2)",
    dark: "rgba(0, 0, 0, 0.3)",
    none: "rgba(0, 0, 0, 0)",
  },

  // Add new colors for alignment with old message bubble
  accentBlue: "#007AFF", // Used for blue accents in messages
  accentRed: "#FF3B30", // Used for red accents in messages
  lightGray: "#fcfcfc", // Used for light backgrounds
  borderLight: "#E5E5EA", // Used for borders

  score: "#00E676",

  // Fire/Token colors - darker orange theme
  fire: {
    primary: "#BF360C", // Much darker orange for better contrast on white
    secondary: "#FF8A65", // Lighter orange for backgrounds
    background: "rgba(191, 54, 12, 0.15)", // Background with transparency
    border: "rgba(191, 54, 12, 0.3)", // Border with transparency
  },
} as const;
