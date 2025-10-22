//components/ui/TopBar.tsx

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  // Platform is no longer needed for padding select
} from "react-native";
import { ArrowLeft } from "lucide-react-native";
import { colors, typography, spacing, shadows } from "@/constants/theme";

interface TopBarProps {
  title: string;
  onBack: () => void;
  subtitle?: string;
  rightElement?: React.ReactNode;
}

export function TopBar({ title, onBack, subtitle, rightElement }: TopBarProps) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
          activeOpacity={0.7}
        >
          <View style={styles.backButtonInner}>
            <ArrowLeft size={20} color={colors.text} strokeWidth={2.5} />
          </View>
        </TouchableOpacity>

        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text style={styles.subtitle} numberOfLines={1}>
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
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    // Removed unnecessary Platform.select for paddingTop: 0
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
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  titleContainer: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: spacing.sm,
  },
  title: {
    ...typography.heading3,
    color: colors.text,
    textAlign: "center",
    fontWeight: "600",
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
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
