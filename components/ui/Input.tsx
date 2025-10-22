//components/ui/Input.tsx

import React, { useState, forwardRef } from "react";
import {
  TextInput,
  Text,
  View,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  TouchableOpacity,
  NativeSyntheticEvent,
  TextInputFocusEventData,
} from "react-native";
import { Eye, EyeOff } from "lucide-react-native";
import { colors, typography, spacing, borderRadius } from "@/constants/theme";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  showPasswordToggle?: boolean;
}

// 1. Wrap the component with forwardRef
// The generic types are <RefType, PropsType>
export const Input = forwardRef<TextInput, InputProps>(
  (
    {
      label,
      error,
      containerStyle,
      style,
      showPasswordToggle = false,
      secureTextEntry,
      onFocus,
      onBlur,
      ...props
    },
    ref // 2. Accept the 'ref' passed from the parent
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    // Initialize isPasswordVisible based on whether secureTextEntry is true
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const togglePasswordVisibility = () => {
      setIsPasswordVisible(!isPasswordVisible);
    };

    // Determine the final value for secureTextEntry
    const actualSecureTextEntry = showPasswordToggle
      ? !isPasswordVisible // If toggle is shown, use its state
      : secureTextEntry; // Otherwise, use the standard prop

    // Wrap the internal focus/blur handlers to allow external handlers to still work
    const handleFocus = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
      setIsFocused(true);
      if (onFocus) {
        onFocus(e);
      }
    };

    const handleBlur = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
      setIsFocused(false);
      if (onBlur) {
        onBlur(e);
      }
    };

    return (
      <View style={[styles.container, containerStyle]}>
        {label && <Text style={styles.label}>{label}</Text>}
        <View style={styles.inputContainer}>
          <TextInput
            // 3. Attach the 'ref' to the native <TextInput> component
            ref={ref}
            style={[
              styles.input,
              isFocused && styles.inputFocused,
              error && styles.inputError,
              showPasswordToggle && styles.inputWithToggle,
              style,
            ]}
            onFocus={handleFocus} // Use wrapped handler
            onBlur={handleBlur} // Use wrapped handler
            placeholderTextColor={colors.disabled}
            secureTextEntry={actualSecureTextEntry}
            {...props}
          />
          {showPasswordToggle && (
            <TouchableOpacity
              style={styles.toggleButton}
              onPress={togglePasswordVisibility}
              activeOpacity={0.7}
            >
              {isPasswordVisible ? (
                <EyeOff size={20} color={colors.textSecondary} />
              ) : (
                <Eye size={20} color={colors.textSecondary} />
              )}
            </TouchableOpacity>
          )}
        </View>
        {error && <Text style={styles.error}>{error}</Text>}
      </View>
    );
  }
);
// Give the component a display name for better debugging
Input.displayName = "Input";

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.caption,
    color: colors.text,
    marginBottom: spacing.xs,
    fontWeight: "600",
  },
  inputContainer: {
    position: "relative",
  },
  input: {
    ...typography.body,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    color: colors.text,
    minHeight: 48,
  },
  inputWithToggle: {
    paddingRight: 48,
  },
  inputFocused: {
    borderColor: colors.primary,
    borderWidth: 2, // Increased border width for focus ring
  },
  inputError: {
    borderColor: colors.error,
  },
  toggleButton: {
    position: "absolute",
    right: spacing.sm,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    width: 40,
    // Note: '100%' for height inside a View with 'relative' position is fine
    height: "100%",
  },
  error: {
    ...typography.caption,
    color: colors.error,
    marginTop: spacing.xs,
  },
});
