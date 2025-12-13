
import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlaskConical, AlertTriangle } from "lucide-react-native";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { TopBar } from "@/components/ui/TopBar";
import { useTheme } from "@/context/ThemeContext";
import { typography, spacing } from "@/constants/theme";

const CULTURE_MEDIA = [
  "Blood Agar",
  "MacConkey Agar",
  "Nutrient Agar",
  "Ashdown Agar",
];

export default function MediaScreen() {
  const { colors } = useTheme();
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
        pathname: "/analyze/capture",
        params: {
          characteristics: JSON.stringify(characteristics),
          cultureMedium: selectedMedium,
        },
      });
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar
        title="Culture Medium"
        subtitle="Step 2 of 4"
        onBack={handleBack}
      />

      <ScrollView contentContainerStyle={styles.content} bounces={true}>
        <Card style={styles.instructionCard}>
          <View style={styles.instructionHeader}>
            <View style={[styles.iconContainer, { backgroundColor: colors.primary + "15" }]}>
              <FlaskConical size={32} color={colors.primary} />
            </View>
            <Text style={[styles.instructionTitle, { color: colors.text }]}>Select Culture Medium</Text>
          </View>
          <Text style={[styles.instructionText, { color: colors.textSecondary }]}>
            Choose the one culture medium used for your bacterial sample. This
            information is critical for AI image analysis.
          </Text>
        </Card>

        <Card style={[styles.summaryCard, { backgroundColor: colors.primary + "10", borderColor: colors.primary + "30" }]}>
          <Text style={[styles.summaryTitle, { color: colors.text }]}>Selected Characteristics</Text>
          <View style={styles.characteristicsList}>
            {characteristics.map((characteristic: string, index: number) => (
              <View key={index} style={styles.characteristicItem}>
                <FlaskConical
                  size={14}
                  color={colors.primary}
                  style={styles.characteristicIcon}
                />
                <Text style={[styles.characteristicText, { color: colors.text }]}>{characteristic}</Text>
              </View>
            ))}
          </View>
        </Card>

        <Card style={styles.mediaCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Available Culture Media</Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
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
            <View style={[styles.selectedInfo, { backgroundColor: colors.primary + "10", borderColor: colors.primary + "30" }]}>
              <Text style={[styles.selectedText, { color: colors.primary }]}>
                Medium Selected: {selectedMedium}
              </Text>
            </View>
          )}
        </Card>

        {!canProceed && (
          <Card
            variant="outlined"
            style={[
              styles.warningCard,
              {
                backgroundColor: colors.error + "10",
                borderColor: colors.error,
              }
            ]}
          >
            <View style={styles.warningContent}>
              <AlertTriangle
                size={20}
                color={colors.error}
                style={styles.warningIcon}
              />
              <Text style={[styles.warningText, { color: colors.error }]}>
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
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  instructionTitle: {
    ...typography.heading2,
    textAlign: "center",
  },
  instructionText: {
    ...typography.body,
    textAlign: "center",
    lineHeight: 24,
  },
  summaryCard: {
    marginBottom: spacing.lg,
    borderWidth: 1,
  },
  summaryTitle: {
    ...typography.heading3,
    marginBottom: spacing.md,
  },
  characteristicsList: {
    gap: spacing.sm,
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
    fontWeight: "500",
  },
  mediaCard: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.heading3,
    marginBottom: spacing.xs,
    marginTop: spacing.xs,
  },
  sectionSubtitle: {
    ...typography.caption,
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
    borderRadius: 8,
    borderWidth: 1,
  },
  selectedText: {
    ...typography.body,
    fontWeight: "600",
    textAlign: "center",
  },
  warningCard: {
    marginBottom: spacing.lg,
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
    flex: 1,
    lineHeight: 22,
  },
  nextButton: {
    marginBottom: spacing.lg,
  },
});

