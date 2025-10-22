// constants/theme.ts

// Define light and dark specific colors for dynamic switching
const colorPaletteLight = {
  primary: "#B6E92D", // Lime
  background: "#F2F2F2", // White smoke
  surface: "#FFFFFF", // Pure white for cards/elements
  text: "#030402", // Black
  textSecondary: "#4F4F4F", // Darker gray for better contrast
  accent: "#000100", // Black-2
  border: "#E0E0E0",
  disabled: "#9E9E9E",
};

const colorPaletteDark = {
  primary: "#B6E92D", // Primary color remains high-contrast
  background: "#121212", // Deep dark background
  surface: "#1E1E1E", // Slightly lighter dark for cards/elements
  text: "#FFFFFF", // White text
  textSecondary: "#A0A0A0", // Light gray secondary text
  accent: "#FFFFFF", // White accent in dark mode
  border: "#3A3A3A",
  disabled: "#6A6A6A",
};

// Colors that remain constant (status colors)
const statusColors = {
  error: "#FF6B6B",
  success: "#51CF66",
  warning: "#FFD43B",
};

/**
 * Dynamic color getter based on theme
 * @param isDark - boolean indicating if dark mode is active
 */
export const createColors = (isDark: boolean) => ({
  ...(isDark ? colorPaletteDark : colorPaletteLight),
  ...statusColors,
});

// Default export for convenience (Light theme colors)
export const colors = createColors(false);

//---------------------------------------------------------
// Gradients
//---------------------------------------------------------

export const gradients = {
  // Corrected primary gradient to be a standard two-stop blend
  primary: [colorPaletteLight.primary, colorPaletteLight.surface],
  secondary: [colorPaletteLight.surface, colorPaletteLight.primary],
};

//---------------------------------------------------------
// Layout and Sizing
//---------------------------------------------------------

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 999,
};

//---------------------------------------------------------
// Typography
//---------------------------------------------------------

export const typography = {
  heading1: {
    fontSize: 32,
    fontWeight: "700" as const,
    lineHeight: 40,
    fontFamily: "Inter-Bold",
  },
  heading2: {
    fontSize: 24,
    fontWeight: "600" as const,
    lineHeight: 32,
    fontFamily: "Inter-SemiBold",
  },
  heading3: {
    fontSize: 20,
    fontWeight: "600" as const,
    lineHeight: 28,
    fontFamily: "Inter-SemiBold",
  },
  body: {
    fontSize: 16,
    fontWeight: "400" as const,
    lineHeight: 24,
    fontFamily: "Inter-Regular",
  },
  caption: {
    fontSize: 14,
    fontWeight: "400" as const,
    lineHeight: 20,
    fontFamily: "Inter-Regular",
  },
  button: {
    fontSize: 16,
    fontWeight: "600" as const,
    lineHeight: 24,
    fontFamily: "Inter-SemiBold",
  },
};

//---------------------------------------------------------
// Shadows (Dynamic to support light/dark backgrounds)
//---------------------------------------------------------

/**
 * Dynamic shadow styles based on theme
 * @param isDark - boolean indicating if dark mode is active
 */
export const createShadows = (isDark: boolean) => {
  const shadowColor = isDark
    ? "rgba(255, 255, 255, 0.1)" // Lighter shadow for dark background
    : "rgba(0, 0, 0, 0.15)"; // Darker shadow for light background

  return {
    sm: {
      shadowColor,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: isDark ? 0.3 : 0.1, // Increased opacity for subtle dark mode effect
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.4 : 0.15,
      shadowRadius: 4,
      elevation: 4,
    },
    lg: {
      shadowColor,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0.5 : 0.2,
      shadowRadius: 8,
      elevation: 8,
    },
  };
};

// Default export for convenience (Light theme shadows)
export const shadows = createShadows(false);
