import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Microscope } from "lucide-react-native";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { colors, typography, spacing } from "@/constants/theme";

interface AnalysisData {
  characteristics: string[];
  medium?: string;
  imageUri?: string;
}

const CHARACTERISTICS = [
  "Gram Negative bacilli",
  "Bipolar appearance",
  "Oxidase positive",
];

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

  const canProceed = selectedCharacteristics.length === CHARACTERISTICS.length;

  const handleNext = () => {
    if (canProceed) {
      // Store data in navigation params or global state
      router.push({
        pathname: "/(tabs)/analyze/media",
        params: {
          characteristics: JSON.stringify(selectedCharacteristics),
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
        <Text style={styles.headerTitle}>Bacterial Characteristics</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.instructionCard}>
          <View style={styles.instructionHeader}>
            <Microscope size={32} color={colors.primary} />
            <Text style={styles.instructionTitle}>
              Select Bacterial Characteristics
            </Text>
          </View>
          <Text style={styles.instructionText}>
            Please select all characteristics that match your bacterial sample.
            All three characteristics must be present to proceed with image
            capture.
          </Text>
        </Card>

        <Card style={styles.characteristicsCard}>
          <Text style={styles.sectionTitle}>Observable Characteristics</Text>

          {CHARACTERISTICS.map((characteristic) => (
            <Checkbox
              key={characteristic}
              label={characteristic}
              checked={selectedCharacteristics.includes(characteristic)}
              onToggle={() => toggleCharacteristic(characteristic)}
            />
          ))}

          <View style={styles.progress}>
            <Text style={styles.progressText}>
              {selectedCharacteristics.length} of {CHARACTERISTICS.length}{" "}
              selected
            </Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${
                      (selectedCharacteristics.length /
                        CHARACTERISTICS.length) *
                      100
                    }%`,
                  },
                ]}
              />
            </View>
          </View>
        </Card>

        {!canProceed && (
          <Card variant="outlined" style={styles.warningCard}>
            <Text style={styles.warningText}>
              All three characteristics must be selected to proceed. This
              ensures accurate analysis of potential Burkholderia pseudomallei
              samples.
            </Text>
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
  characteristicsCard: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.heading3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  progress: {
    marginTop: spacing.lg,
  },
  progressText: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: spacing.xs,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: 2,
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
