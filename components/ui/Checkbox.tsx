//components/ui/Checkbox.tsx

import React from "react";
import { TouchableOpacity, Text, View, StyleSheet } from "react-native";
import { Check } from "lucide-react-native";
import { colors, typography, spacing, borderRadius } from "@/constants/theme";

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
          checked && styles.checkboxChecked,
          disabled && styles.checkboxDisabled,
        ]}
      >
        {/* Fix: Changed check icon color to colors.surface (white) for better contrast on colors.primary (lime) */}
        {checked && <Check color={colors.surface} size={18} strokeWidth={3} />}
      </View>
      <Text style={[styles.label, disabled && styles.labelDisabled]}>
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
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    marginRight: spacing.sm,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxDisabled: {
    backgroundColor: colors.disabled,
    borderColor: colors.disabled,
  },
  label: {
    ...typography.body,
    color: colors.text,
    flex: 1,
  },
  labelDisabled: {
    color: colors.disabled,
  },
  disabled: {
    opacity: 0.6,
  },
});
