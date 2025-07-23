import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Microscope,
  FlaskConical,
  Camera,
  Clock,
  ChartBar as BarChart3,
} from "lucide-react-native";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { colors, typography, spacing } from "@/constants/theme";

export default function AnalyzeScreen() {
  const handleStartAnalysis = () => {
    router.push("/(tabs)/analyze/characteristics");
  };

  const AnalysisStep = ({
    icon: Icon,
    title,
    description,
    stepNumber,
  }: {
    icon: any;
    title: string;
    description: string;
    stepNumber: number;
  }) => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <View style={styles.stepIconContainer}>
          <Icon size={24} color={colors.primary} />
        </View>
        <View style={styles.stepNumber}>
          <Text style={styles.stepNumberText}>{stepNumber}</Text>
        </View>
      </View>
      <View style={styles.stepContent}>
        <Text style={styles.stepTitle}>{title}</Text>
        <Text style={styles.stepDescription}>{description}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Bacterial Analysis</Text>
          <Text style={styles.subtitle}>
            Professional diagnostic workflow for Burkholderia pseudomallei
            identification
          </Text>
        </View>

        <Card style={styles.heroCard}>
          <View style={styles.heroIcon}>
            <Microscope size={48} color={colors.primary} />
          </View>
          <Text style={styles.heroTitle}>Start New Analysis</Text>
          <Text style={styles.heroDescription}>
            Follow our guided 4-step process to analyze bacterial samples with
            confidence
          </Text>
          <Button
            title="Begin Analysis"
            onPress={handleStartAnalysis}
            style={styles.startButton}
          />
        </Card>

        <Card style={styles.processCard}>
          <Text style={styles.processTitle}>Analysis Process</Text>
          <Text style={styles.processDescription}>
            Our streamlined workflow ensures accurate and reliable results
          </Text>

          <View style={styles.stepsContainer}>
            <AnalysisStep
              icon={Microscope}
              title="Select Characteristics"
              description="Identify key bacterial characteristics from your microscopic observations"
              stepNumber={1}
            />

            <AnalysisStep
              icon={FlaskConical}
              title="Choose Culture Medium"
              description="Select the appropriate culture medium used for your sample"
              stepNumber={2}
            />

            <AnalysisStep
              icon={Camera}
              title="Capture Image"
              description="Take a high-quality photo of your bacterial colonies"
              stepNumber={3}
            />

            <AnalysisStep
              icon={Clock}
              title="Specify Colony Age"
              description="Select the age of your bacterial colonies for accurate analysis"
              stepNumber={4}
            />

            <AnalysisStep
              icon={BarChart3}
              title="Get Results"
              description="Receive AI-powered analysis with confidence scores"
              stepNumber={5}
            />
          </View>
        </Card>

        <Card style={styles.infoCard}>
          <Text style={styles.infoTitle}>About the Analysis</Text>
          <Text style={styles.infoText}>
            This tool uses advanced machine learning algorithms to identify
            Burkholderia pseudomallei, the causative agent of melioidosis. The
            analysis considers morphological characteristics, culture medium,
            colony age, and colony appearance to provide accurate diagnostic
            support.
          </Text>
        </Card>
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
  header: {
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.heading1,
    color: colors.text,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
    maxWidth: 320,
  },
  heroCard: {
    alignItems: "center",
    marginBottom: spacing.lg,
    backgroundColor: colors.primary + "08",
    borderWidth: 1,
    borderColor: colors.primary + "20",
  },
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary + "15",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  heroTitle: {
    ...typography.heading2,
    color: colors.text,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  heroDescription: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: spacing.lg,
    lineHeight: 24,
  },
  startButton: {
    minWidth: 200,
  },
  processCard: {
    marginBottom: spacing.lg,
  },
  processTitle: {
    ...typography.heading2,
    color: colors.text,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  processDescription: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: spacing.xl,
  },
  stepsContainer: {
    gap: spacing.lg,
  },
  stepContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  stepHeader: {
    alignItems: "center",
    marginRight: spacing.md,
    position: "relative",
  },
  stepIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary + "15",
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumber: {
    position: "absolute",
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumberText: {
    ...typography.caption,
    color: colors.text,
    fontWeight: "700",
    fontSize: 12,
  },
  stepContent: {
    flex: 1,
    paddingTop: spacing.xs,
  },
  stepTitle: {
    ...typography.heading3,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  stepDescription: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  infoCard: {
    backgroundColor: colors.surface,
  },
  infoTitle: {
    ...typography.heading3,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  infoText: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 24,
  },
});
