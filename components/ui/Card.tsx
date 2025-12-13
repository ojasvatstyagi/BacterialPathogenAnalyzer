import React from "react";
import { View, StyleSheet, StyleProp, ViewStyle } from "react-native";
import { colors, spacing, borderRadius } from "@/constants/theme";
import { useTheme } from "@/context/ThemeContext";

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: "default" | "outlined";
}

export function Card({ children, style, variant = "default" }: CardProps) {
  const { colors, shadows } = useTheme();

  const cardStyle: StyleProp<ViewStyle> = [
    {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
    },
    variant === "default" && shadows.md,
    variant === "outlined" && {
      borderWidth: 1,
      borderColor: colors.border,
    },
    style,
  ];

  return <View style={cardStyle}>{children}</View>;
}

const styles = StyleSheet.create({});
