
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
import { useTheme } from "@/context/ThemeContext";
import { typography, spacing } from "@/constants/theme";

const AnalysisStep = ({
  icon: Icon,
  title,
  description,
  stepNumber,
  isLast,
}: {
  icon: any;
  title: string;
  description: string;
  stepNumber: number;
  isLast: boolean;
}) => {
  const { colors } = useTheme();

  return (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        {/* Vertical Line Connector */}
        {!isLast && (
          <View style={[styles.stepLine, { backgroundColor: colors.border }]} />
        )}

        <View
          style={[
            styles.stepIconContainer,
            { backgroundColor: colors.primary + "15" },
          ]}
        >
          <Icon size={24} color={colors.primary} />
        </View>
        <View style={[styles.stepNumber, { backgroundColor: colors.primary, borderColor: colors.surface }]}>
          <Text style={[styles.stepNumberText, { color: colors.surface }]}>
            {stepNumber}
          </Text>
        </View>
      </View>
      <View style={styles.stepContent}>
        <Text style={[styles.stepTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
          {description}
        </Text>
      </View>
    </View>
  );
};

export default function AnalyzeScreen() {
  const { colors, shadows } = useTheme();

  const handleStartAnalysis = () => {
    router.push("/analyze/characteristics");
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} bounces={true}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            Bacterial Analysis
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Professional diagnostic workflow for Burkholderia pseudomallei
            identification
          </Text>
        </View>

        <Card
          style={[
            styles.heroCard,
            {
              backgroundColor: colors.primary + "08",
              borderColor: colors.primary + "20",
            },
          ]}
        >
          <View
            style={[
              styles.heroIcon,
              { backgroundColor: colors.primary + "15" },
            ]}
          >
            <Microscope size={48} color={colors.primary} />
          </View>
          <Text style={[styles.heroTitle, { color: colors.text }]}>
            Start New Analysis
          </Text>
          <Text style={[styles.heroDescription, { color: colors.textSecondary }]}>
            Follow our guided 5-step process to analyze bacterial samples with
            confidence
          </Text>
          <Button
            title="Begin Analysis"
            onPress={handleStartAnalysis}
            style={styles.startButton}
          />
        </Card>

        <Card style={[styles.processCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.processTitle, { color: colors.text }]}>
            Analysis Process
          </Text>
          <Text style={[styles.processDescription, { color: colors.textSecondary }]}>
            Our streamlined workflow ensures accurate and reliable results
          </Text>

          <View style={styles.stepsContainer}>
            <AnalysisStep
              icon={Microscope}
              title="Select Characteristics"
              description="Identify key bacterial characteristics from your microscopic observations"
              stepNumber={1}
              isLast={false}
            />

            <AnalysisStep
              icon={FlaskConical}
              title="Choose Culture Medium"
              description="Select the appropriate culture medium used for your sample"
              stepNumber={2}
              isLast={false}
            />

            <AnalysisStep
              icon={Camera}
              title="Capture Image"
              description="Take a high-quality photo of your bacterial colonies"
              stepNumber={3}
              isLast={false}
            />

            <AnalysisStep
              icon={Clock}
              title="Specify Colony Age"
              description="Select the age of your bacterial colonies for accurate analysis"
              stepNumber={4}
              isLast={false}
            />

            <AnalysisStep
              icon={BarChart3}
              title="Get Results"
              description="Receive AI-powered analysis with confidence scores"
              stepNumber={5}
              isLast={true}
            />
          </View>
        </Card>
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
  header: {
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.heading1,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    textAlign: "center",
    lineHeight: 24,
    maxWidth: 320,
  },
  heroCard: {
    alignItems: "center",
    marginBottom: spacing.lg,
    borderWidth: 1,
  },
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  heroTitle: {
    ...typography.heading2,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  heroDescription: {
    ...typography.body,
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
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  processDescription: {
    ...typography.body,
    textAlign: "center",
    marginBottom: spacing.xl,
  },
  stepsContainer: {},
  stepContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: spacing.lg,
  },
  stepHeader: {
    alignItems: "center",
    marginRight: spacing.md,
    position: "relative",
    paddingBottom: 20,
    minHeight: 120,
  },
  // Vertical Line Style
  stepLine: {
    position: "absolute",
    top: 50,
    bottom: 0,
    width: 2,
    left: 23,
    zIndex: 0,
  },
  stepIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  stepNumber: {
    position: "absolute",
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
    borderWidth: 2,
  },
  stepNumberText: {
    ...typography.caption,
    fontWeight: "700",
    fontSize: 12,
  },
  stepContent: {
    flex: 1,
    paddingTop: spacing.xs,
  },
  stepTitle: {
    ...typography.heading3,
    marginBottom: spacing.xs,
  },
  stepDescription: {
    ...typography.body,
    lineHeight: 22,
  },
});
