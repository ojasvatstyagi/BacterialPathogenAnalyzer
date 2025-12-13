//components/ui/Input.tsx

import React, { forwardRef } from "react";
import {
  TextInput,
  Text,
  View,
  StyleSheet,
  TextInputProps,
  StyleProp,
  ViewStyle,
  TouchableOpacity,
  NativeSyntheticEvent,
  TextInputFocusEventData,
} from "react-native";
import { Eye, EyeOff } from "lucide-react-native";
import { typography, spacing, borderRadius } from "@/constants/theme";
import { useTheme } from "@/context/ThemeContext";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
  showPasswordToggle?: boolean;
}

// 1. Wrap the component with forwardRef
// The generic types are <RefType, PropsType>
export const Input = forwardRef<any, InputProps>(function Input(
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
  }: InputProps,
  ref
) {
  const { colors } = useTheme();
  const [isFocused, setIsFocused] = React.useState(false);
  // Initialize isPasswordVisible based on whether secureTextEntry is true
  const [isPasswordVisible, setIsPasswordVisible] = React.useState(false);

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
      {label && <Text style={[styles.label, { color: colors.text }]}>{label}</Text>}
      <View style={styles.inputContainer}>
        <TextInput
          // 3. Attach the 'ref' to the native <TextInput> component
          ref={ref}
          style={[
            styles.input,
            {
              borderColor: colors.border,
              backgroundColor: colors.surface,
              color: colors.text,
            },
            isFocused && { borderColor: colors.primary, borderWidth: 2 },
            error && { borderColor: colors.error },
            showPasswordToggle && styles.inputWithToggle,
            style,
          ]}
          onFocus={handleFocus} // Use wrapped handler
          onBlur={handleBlur} // Use wrapped handler
          placeholderTextColor={colors.textSecondary}
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
      {error && <Text style={[styles.error, { color: colors.error }]}>{error}</Text>}
    </View>
  );
});
// Give the component a display name for better debugging
Input.displayName = "Input";

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.caption,
    marginBottom: spacing.xs,
    fontWeight: "600",
  },
  inputContainer: {
    position: "relative",
  },
  input: {
    ...typography.body,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 48,
  },
  inputWithToggle: {
    paddingRight: 48,
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
    marginTop: spacing.xs,
  },
});
