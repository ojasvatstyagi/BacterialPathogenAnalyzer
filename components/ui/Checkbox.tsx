//components/ui/Checkbox.tsx

import React from "react";
import { TouchableOpacity, Text, View, StyleSheet } from "react-native";
import { Check } from "lucide-react-native";
import { typography, spacing, borderRadius } from "@/constants/theme";
import { useTheme } from "@/context/ThemeContext";

interface CheckboxProps {
  label: string;
  checked: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export function Checkbox({
  label,
  checked,
  onToggle,
  disabled = false,
}: CheckboxProps) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.container, disabled && styles.disabled]}
      onPress={onToggle}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.checkbox,
          {
            borderColor: colors.border,
            backgroundColor: colors.surface,
          },
          checked && {
            backgroundColor: colors.primary,
            borderColor: colors.primary,
          },
          disabled && {
            backgroundColor: colors.disabled,
            borderColor: colors.disabled,
          },
        ]}
      >
        {checked && <Check color={colors.surface} size={18} strokeWidth={3} />}
      </View>
      <Text
        style={[
          styles.label,
          { color: colors.text },
          disabled && { color: colors.disabled },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderRadius: borderRadius.sm,
    marginRight: spacing.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    ...typography.body,
    flex: 1,
  },
  disabled: {
    opacity: 0.6,
  },
});
