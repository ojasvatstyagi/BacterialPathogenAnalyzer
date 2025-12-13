
import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Microscope, AlertTriangle } from "lucide-react-native";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { TopBar } from "@/components/ui/TopBar";
import { useTheme } from "@/context/ThemeContext";
import { typography, spacing } from "@/constants/theme";

interface AnalysisData {
  characteristics: string[];
  medium?: string;
  imageUri?: string;
}

const REQUIRED_CHARACTERISTICS = ["Gram Negative bacilli", "Oxidase positive"];

const OPTIONAL_CHARACTERISTICS = ["Bipolar appearance"];

export default function CharacteristicsScreen() {
  const { colors } = useTheme();
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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar
        title="Bacterial Characteristics"
        subtitle="Step 1 of 4"
        onBack={handleBack}
      />

      <ScrollView contentContainerStyle={styles.content} bounces={true}>
        <Card style={styles.instructionCard}>
          <View style={styles.instructionHeader}>
            <View style={[styles.iconContainer, { backgroundColor: colors.primary + "15" }]}>
              <Microscope size={32} color={colors.primary} />
            </View>
            <Text style={[styles.instructionTitle, { color: colors.text }]}>
              Select Bacterial Characteristics
            </Text>
          </View>
          <Text style={[styles.instructionText, { color: colors.textSecondary }]}>
            Please select the characteristics that match your bacterial sample.
            Required characteristics must be present to proceed.
          </Text>
        </Card>

        <Card style={styles.characteristicsCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Required Characteristics</Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
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

          <Text style={[styles.sectionTitle, { color: colors.text }]}>Optional Characteristics</Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
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

          <View style={[styles.progress, { borderTopColor: colors.border }]}>
            <Text style={[styles.progressText, { color: colors.textSecondary }]}>
              Required: {selectedRequiredCount} of{" "}
              {REQUIRED_CHARACTERISTICS.length} selected
            </Text>
            <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: colors.primary,
                    width: `${(selectedRequiredCount /
                      REQUIRED_CHARACTERISTICS.length) *
                      100
                      }%`,
                  },
                ]}
              />
            </View>
            {selectedOptionalCount > 0 && (
              <Text style={[styles.optionalText, { color: colors.primary }]}>
                Optional: {selectedOptionalCount} selected
              </Text>
            )}
          </View>
        </Card>

        {!canProceed && (
          <Card
            variant="outlined"
            style={[
              styles.warningCard,
              {
                backgroundColor: colors.error + "10",
                borderColor: colors.error
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
  characteristicsCard: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.heading3,
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
  sectionSubtitle: {
    ...typography.caption,
    marginBottom: spacing.md,
  },
  checkboxContainer: {
    marginBottom: spacing.lg,
    marginTop: spacing.sm,
  },
  progress: {
    marginTop: spacing.md,
    borderTopWidth: 1,
    paddingTop: spacing.md,
  },
  progressText: {
    ...typography.caption,
    textAlign: "center",
    marginBottom: spacing.sm,
    fontWeight: "600",
  },
  optionalText: {
    ...typography.caption,
    textAlign: "center",
    marginTop: spacing.xs,
    fontWeight: "600",
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
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

