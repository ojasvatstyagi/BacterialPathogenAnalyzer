
//components/ui/Button.tsx

import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  StyleProp,
  ViewStyle,
  TextStyle,
  View,
} from "react-native";
import { typography, borderRadius, shadows } from "@/constants/theme";
import { useTheme } from "@/context/ThemeContext";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline";
  size?: "small" | "medium" | "large";
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export function Button({
  title,
  onPress,
  variant = "primary",
  size = "medium",
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
}: ButtonProps) {
  const { colors } = useTheme();

  // Dynamic styles based on theme
  const getVariantStyle = () => {
    switch (variant) {
      case "primary":
        return { backgroundColor: colors.primary, borderWidth: 0 };
      case "secondary":
        return {
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
        };
      case "outline":
        return {
          backgroundColor: "transparent",
          borderWidth: 1,
          borderColor: colors.border,
          shadowOpacity: 0,
          elevation: 0,
        };
      default:
        return {};
    }
  };

  const getTextStyle = () => {
    if (disabled) return { color: colors.textSecondary };
    switch (variant) {
      case "primary":
        return { color: colors.text, fontWeight: "600" };
      case "secondary":
        return { color: colors.text, fontWeight: "500" };
      case "outline":
        return { color: colors.textSecondary, fontWeight: "500" };
      default:
        return { color: colors.text };
    }
  };

  const buttonStyle = [
    styles.base,
    getVariantStyle(),
    styles[size],
    disabled && {
      backgroundColor: colors.disabled,
      borderColor: colors.disabled,
      opacity: 0.6,
    },
    style,
  ] as StyleProp<ViewStyle>;

  const textStyles = [
    styles.text,
    getTextStyle(),
    styles[`${size}Text`],
    disabled && { color: colors.textSecondary },
    textStyle,
  ] as StyleProp<TextStyle>;

  const indicatorColor =
    variant === "primary" ? colors.surface : colors.primary;

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={indicatorColor} size="small" />
      ) : (
        <>
          {icon && <View style={{ marginRight: 8 }}>{icon}</View>}
          <Text style={textStyles}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    ...shadows.sm,
  },
  small: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 36,
  },
  medium: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    minHeight: 48,
  },
  large: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    minHeight: 56,
  },
  text: {
    ...typography.button,
    textAlign: "center",
  },
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },
});
