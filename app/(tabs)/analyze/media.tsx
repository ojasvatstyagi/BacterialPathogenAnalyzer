import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlaskConical, AlertTriangle } from "lucide-react-native";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { TopBar } from "@/components/ui/TopBar";
import { colors, typography, spacing } from "@/constants/theme";

const CULTURE_MEDIA = [
  "Blood Agar",
  "MacConkey Agar",
  "Nutrient Agar",
  "Ashdown Agar",
];

export default function MediaScreen() {
  const params = useLocalSearchParams();
  const [selectedMedium, setSelectedMedium] = useState<string>("");

  // Safely parse characteristics
  const characteristics = params.characteristics
    ? JSON.parse(params.characteristics as string)
    : [];

  // Logic to handle single-selection (toggle on/off)
  const toggleMedium = (medium: string) => {
    setSelectedMedium((prev) => (prev === medium ? "" : medium));
  };

  const canProceed = selectedMedium !== "";

  const handleNext = () => {
    if (canProceed) {
      router.push({
        pathname: "/analyze/capture",
        params: {
          characteristics: JSON.stringify(characteristics),
          medium: selectedMedium,
        },
      });
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <TopBar
        title="Culture Medium"
        subtitle="Step 2 of 4"
        onBack={handleBack}
      />

      <ScrollView contentContainerStyle={styles.content} bounces={true}>
        <Card style={styles.instructionCard}>
          <View style={styles.instructionHeader}>
            <View style={styles.iconContainer}>
              <FlaskConical size={32} color={colors.primary} />
            </View>
            <Text style={styles.instructionTitle}>Select Culture Medium</Text>
          </View>
          <Text style={styles.instructionText}>
            Choose the **one** culture medium used for your bacterial sample.
            This information is critical for AI image analysis.
          </Text>
        </Card>

        <Card style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Selected Characteristics</Text>
          <View style={styles.characteristicsList}>
            {characteristics.map((characteristic: string, index: number) => (
              <View key={index} style={styles.characteristicItem}>
                <FlaskConical
                  size={14}
                  color={colors.primary}
                  style={styles.characteristicIcon}
                />
                <Text style={styles.characteristicText}>{characteristic}</Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Selection Card */}
        <Card style={styles.mediaCard}>
          <Text style={styles.sectionTitle}>Available Culture Media</Text>
          <Text style={styles.sectionSubtitle}>
            Please select one of the following media:
          </Text>

          <View style={styles.checkboxContainer}>
            {CULTURE_MEDIA.map((medium) => (
              <Checkbox
                key={medium}
                label={medium}
                checked={selectedMedium === medium}
                onToggle={() => toggleMedium(medium)}
              />
            ))}
          </View>

          {selectedMedium && (
            <View style={styles.selectedInfo}>
              <Text style={styles.selectedText}>
                Medium Selected: {selectedMedium}
              </Text>
            </View>
          )}
        </Card>

        {!canProceed && (
          <Card variant="outlined" style={styles.warningCard}>
            <View style={styles.warningContent}>
              <AlertTriangle
                size={20}
                color={colors.error}
                style={styles.warningIcon}
              />
              <Text style={styles.warningText}>
                Please select one culture medium to proceed with image capture
                and analysis.
              </Text>
            </View>
          </Card>
        )}

        <Button
          title="Next: Capture Image"
          onPress={handleNext}
          disabled={!canProceed}
          style={styles.nextButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  instructionCard: {
    marginBottom: spacing.lg,
    alignItems: "center",
  },
  instructionHeader: {
    alignItems: "center",
    marginBottom: spacing.md,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary + "15",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  instructionTitle: {
    ...typography.heading2,
    color: colors.text,
    textAlign: "center",
  },
  instructionText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
  },
  summaryCard: {
    marginBottom: spacing.lg,
    backgroundColor: colors.primary + "10",
    borderWidth: 1,
    borderColor: colors.primary + "30",
  },
  summaryTitle: {
    ...typography.heading3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  characteristicsList: {
    gap: spacing.sm, // Slightly increased gap
  },
  characteristicItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.xs,
  },
  characteristicIcon: {
    marginRight: spacing.sm,
  },
  characteristicText: {
    ...typography.body,
    color: colors.text,
    fontWeight: "500",
  },
  mediaCard: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.heading3,
    color: colors.text,
    marginBottom: spacing.xs, // Reduced margin
    marginTop: spacing.xs,
  },
  sectionSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    fontWeight: "600",
  },
  checkboxContainer: {
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  selectedInfo: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.primary + "10", // Changed to primary success
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary + "30",
  },
  selectedText: {
    ...typography.body,
    color: colors.primary, // Changed to primary color
    fontWeight: "600",
    textAlign: "center",
  },
  warningCard: {
    marginBottom: spacing.lg,
    backgroundColor: colors.error + "10",
    borderColor: colors.error,
  },
  warningContent: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  warningIcon: {
    marginRight: spacing.sm,
    marginTop: 2,
  },
  warningText: {
    ...typography.body,
    color: colors.error,
    flex: 1,
    lineHeight: 22,
  },
  nextButton: {
    marginBottom: spacing.lg,
  },
});
