export const colors = {
  primary: "#B6E92D", // Lime
  background: "#F2F2F2", // White smoke
  surface: "#FFFFFF", // Pure white for cards
  text: "#030402", // Black
  textSecondary: "#0D0D0D", // Night
  accent: "#000100", // Black-2
  error: "#FF6B6B",
  success: "#51CF66",
  warning: "#FFD43B",
  border: "#E0E0E0",
  disabled: "#9E9E9E",
};

export const gradients = {
  primary: ["#B6E92D", "#F2F2F2", "#030402", "#0D0D0D", "#000100"],
  secondary: ["#F2F2F2", "#B6E92D"],
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

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

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 999,
};

export const shadows = {
  sm: {
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
};
