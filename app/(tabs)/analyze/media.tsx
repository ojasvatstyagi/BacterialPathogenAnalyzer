import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlaskConical } from "lucide-react-native";
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

  const characteristics = params.characteristics
    ? JSON.parse(params.characteristics as string)
    : [];

  const toggleMedium = (medium: string) => {
    setSelectedMedium((prev) => (prev === medium ? "" : medium));
  };

  const canProceed = selectedMedium !== "";

  const handleNext = () => {
    if (canProceed) {
      router.push({
        pathname: "/(tabs)/analyze/capture",
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
        subtitle="Step 2 of 3"
        onBack={handleBack}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.instructionCard}>
          <View style={styles.instructionHeader}>
            <View style={styles.iconContainer}>
              <FlaskConical size={32} color={colors.primary} />
            </View>
            <Text style={styles.instructionTitle}>Select Culture Medium</Text>
          </View>
          <Text style={styles.instructionText}>
            Choose the culture medium used for your bacterial sample. Select
            only one medium that best matches your culture conditions.
          </Text>
        </Card>

        <Card style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Selected Characteristics</Text>
          <View style={styles.characteristicsList}>
            {characteristics.map((characteristic: string, index: number) => (
              <View key={index} style={styles.characteristicItem}>
                <View style={styles.checkmark} />
                <Text style={styles.characteristicText}>{characteristic}</Text>
              </View>
            ))}
          </View>
        </Card>

        <Card style={styles.mediaCard}>
          <Text style={styles.sectionTitle}>Available Culture Media</Text>

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
                Selected: {selectedMedium}
              </Text>
            </View>
          )}
        </Card>

        {!canProceed && (
          <Card variant="outlined" style={styles.warningCard}>
            <Text style={styles.warningText}>
              Please select one culture medium to proceed with image capture and
              analysis.
            </Text>
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
    backgroundColor: colors.primary + "08",
    borderWidth: 1,
    borderColor: colors.primary + "20",
  },
  summaryTitle: {
    ...typography.heading3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  characteristicsList: {
    gap: spacing.xs,
  },
  characteristicItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkmark: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
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
    marginBottom: spacing.lg,
  },
  checkboxContainer: {
    marginBottom: spacing.md,
  },
  selectedInfo: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.success + "10",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.success + "30",
  },
  selectedText: {
    ...typography.body,
    color: colors.success,
    fontWeight: "600",
    textAlign: "center",
  },
  warningCard: {
    marginBottom: spacing.lg,
    backgroundColor: colors.warning + "10",
    borderColor: colors.warning,
  },
  warningText: {
    ...typography.body,
    color: colors.text,
    textAlign: "center",
    lineHeight: 22,
  },
  nextButton: {
    marginTop: spacing.md,
  },
});
