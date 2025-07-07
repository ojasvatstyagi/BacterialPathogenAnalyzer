import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, FlaskConical } from "lucide-react-native";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
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
      <View style={styles.header}>
        <Button
          title=""
          onPress={handleBack}
          variant="outline"
          style={styles.backButton}
        />
        <Text style={styles.headerTitle}>Culture Medium</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.instructionCard}>
          <View style={styles.instructionHeader}>
            <FlaskConical size={32} color={colors.primary} />
            <Text style={styles.instructionTitle}>Select Culture Medium</Text>
          </View>
          <Text style={styles.instructionText}>
            Choose the culture medium used for your bacterial sample. Select
            only one medium that best matches your culture conditions.
          </Text>
        </Card>

        <Card style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Selected Characteristics</Text>
          {characteristics.map((characteristic: string, index: number) => (
            <Text key={index} style={styles.summaryItem}>
              • {characteristic}
            </Text>
          ))}
        </Card>

        <Card style={styles.mediaCard}>
          <Text style={styles.sectionTitle}>Available Culture Media</Text>

          {CULTURE_MEDIA.map((medium) => (
            <Checkbox
              key={medium}
              label={medium}
              checked={selectedMedium === medium}
              onToggle={() => toggleMedium(medium)}
            />
          ))}

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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    padding: 0,
  },
  headerTitle: {
    ...typography.heading3,
    color: colors.text,
  },
  headerSpacer: {
    width: 40,
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
  instructionTitle: {
    ...typography.heading2,
    color: colors.text,
    textAlign: "center",
    marginTop: spacing.sm,
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
  },
  summaryTitle: {
    ...typography.heading3,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  summaryItem: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  mediaCard: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.heading3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  selectedInfo: {
    marginTop: spacing.md,
    padding: spacing.sm,
    backgroundColor: colors.success + "10",
    borderRadius: 8,
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
