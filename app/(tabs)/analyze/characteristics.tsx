import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Microscope, AlertTriangle } from "lucide-react-native"; // Added AlertTriangle for warning card
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { TopBar } from "@/components/ui/TopBar";
import { colors, typography, spacing } from "@/constants/theme";

interface AnalysisData {
  characteristics: string[];
  medium?: string;
  imageUri?: string;
}

const REQUIRED_CHARACTERISTICS = ["Gram Negative bacilli", "Oxidase positive"];

const OPTIONAL_CHARACTERISTICS = ["Bipolar appearance"];

export default function CharacteristicsScreen() {
  const [selectedCharacteristics, setSelectedCharacteristics] = useState<
    string[]
  >([]);

  const toggleCharacteristic = (characteristic: string) => {
    setSelectedCharacteristics((prev) =>
      prev.includes(characteristic)
        ? prev.filter((c) => c !== characteristic)
        : [...prev, characteristic]
    );
  };

  const requiredSelected = REQUIRED_CHARACTERISTICS.every((char) =>
    selectedCharacteristics.includes(char)
  );

  const canProceed = requiredSelected;

  const handleNext = () => {
    if (canProceed) {
      // Note: Passing the data as JSON string in URL params is the correct way for Expo Router
      router.push({
        pathname: "/analyze/media",
        params: {
          characteristics: JSON.stringify(selectedCharacteristics),
        },
      });
    }
  };

  const handleBack = () => {
    router.back();
  };

  const selectedRequiredCount = REQUIRED_CHARACTERISTICS.filter((char) =>
    selectedCharacteristics.includes(char)
  ).length;

  const selectedOptionalCount = OPTIONAL_CHARACTERISTICS.filter((char) =>
    selectedCharacteristics.includes(char)
  ).length;

  return (
    <SafeAreaView style={styles.container}>
      <TopBar
        title="Bacterial Characteristics"
        subtitle="Step 1 of 4"
        onBack={handleBack}
      />

      <ScrollView contentContainerStyle={styles.content} bounces={true}>
        <Card style={styles.instructionCard}>
          <View style={styles.instructionHeader}>
            <View style={styles.iconContainer}>
              <Microscope size={32} color={colors.primary} />
            </View>
            <Text style={styles.instructionTitle}>
              Select Bacterial Characteristics
            </Text>
          </View>
          <Text style={styles.instructionText}>
            Please select the characteristics that match your bacterial sample.
            Required characteristics must be present to proceed.
          </Text>
        </Card>

        <Card style={styles.characteristicsCard}>
          <Text style={styles.sectionTitle}>Required Characteristics</Text>
          <Text style={styles.sectionSubtitle}>
            Both characteristics must be selected to proceed
          </Text>

          <View style={styles.checkboxContainer}>
            {REQUIRED_CHARACTERISTICS.map((characteristic) => (
              <Checkbox
                key={characteristic}
                label={characteristic}
                checked={selectedCharacteristics.includes(characteristic)}
                onToggle={() => toggleCharacteristic(characteristic)}
              />
            ))}
          </View>

          <Text style={styles.sectionTitle}>Optional Characteristics</Text>
          <Text style={styles.sectionSubtitle}>
            Select if observed in your sample
          </Text>

          <View style={styles.checkboxContainer}>
            {OPTIONAL_CHARACTERISTICS.map((characteristic) => (
              <Checkbox
                key={characteristic}
                label={characteristic}
                checked={selectedCharacteristics.includes(characteristic)}
                onToggle={() => toggleCharacteristic(characteristic)}
              />
            ))}
          </View>

          <View style={styles.progress}>
            <Text style={styles.progressText}>
              Required: {selectedRequiredCount} of{" "}
              {REQUIRED_CHARACTERISTICS.length} selected
            </Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${
                      (selectedRequiredCount /
                        REQUIRED_CHARACTERISTICS.length) *
                      100
                    }%`,
                  },
                ]}
              />
            </View>
            {selectedOptionalCount > 0 && (
              <Text style={styles.optionalText}>
                Optional: {selectedOptionalCount} selected
              </Text>
            )}
          </View>
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
                Both required characteristics must be selected to proceed.
                Optional characteristics can enhance analysis accuracy but are
                not mandatory.
              </Text>
            </View>
          </Card>
        )}

        <Button
          title="Next: Select Culture Medium"
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
  characteristicsCard: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.heading3,
    color: colors.text,
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
  sectionSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  checkboxContainer: {
    marginBottom: spacing.lg,
    marginTop: spacing.sm,
  },
  progress: {
    marginTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  progressText: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: spacing.sm,
    fontWeight: "600",
  },
  optionalText: {
    ...typography.caption,
    color: colors.primary,
    textAlign: "center",
    marginTop: spacing.xs,
    fontWeight: "600",
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: 3,
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
