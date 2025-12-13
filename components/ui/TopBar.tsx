
//components/ui/TopBar.tsx

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { ArrowLeft } from "lucide-react-native";
import { typography, spacing, shadows } from "@/constants/theme";
import { useTheme } from "@/context/ThemeContext";

interface TopBarProps {
  title: string;
  onBack: () => void;
  subtitle?: string;
  rightElement?: React.ReactNode;
}

export function TopBar({ title, onBack, subtitle, rightElement }: TopBarProps) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderBottomColor: colors.border,
        },
      ]}
    >
      <View style={styles.content}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.backButtonInner,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
              },
            ]}
          >
            <ArrowLeft size={20} color={colors.text} strokeWidth={2.5} />
          </View>
        </TouchableOpacity>

        <View style={styles.titleContainer}>
          <Text
            style={[styles.title, { color: colors.text }]}
            numberOfLines={1}
          >
            {title}
          </Text>
          {subtitle && (
            <Text
              style={[styles.subtitle, { color: colors.textSecondary }]}
              numberOfLines={1}
            >
              {subtitle}
            </Text>
          )}
        </View>

        <View style={styles.rightContainer}>
          {rightElement || <View style={styles.placeholder} />}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: 64,
  },
  backButton: {
    marginRight: spacing.md,
  },
  backButtonInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    ...shadows.sm,
  },
  titleContainer: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: spacing.sm,
  },
  title: {
    ...typography.heading3,
    textAlign: "center",
    fontWeight: "600",
  },
  subtitle: {
    ...typography.caption,
    textAlign: "center",
    marginTop: 2,
  },
  rightContainer: {
    width: 40,
    alignItems: "flex-end",
  },
  placeholder: {
    width: 40,
    height: 40,
  },
});
