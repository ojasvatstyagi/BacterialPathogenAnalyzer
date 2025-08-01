import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Image, Alert } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  CircleCheck as CheckCircle,
  Circle as XCircle,
  Share,
  Save,
  SendHorizontal as SendHorizonal,
} from "lucide-react-native";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { TopBar } from "@/components/ui/TopBar";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { colors, typography, spacing } from "@/constants/theme";

interface AnalysisResult {
  result: string;
  confidence: number;
}

const COLONY_AGES = [
  { value: "24h", label: "24 hours" },
  { value: "48h", label: "48 hours" },
  { value: "72h", label: "72 hours" },
  { value: "96h", label: "96 hours" },
];

export default function ResultsScreen() {
  const params = useLocalSearchParams();
  const { user } = useAuth();
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);

  const characteristics = params.characteristics
    ? JSON.parse(params.characteristics as string)
    : [];
  const medium = params.medium as string;
  const imageUri = params.imageUri as string;
  const colonyAge = params.colonyAge as string;

  useEffect(() => {
    analyzeImage();
  }, []);

  const analyzeImage = async () => {
    setLoading(true);
    try {
      // Mock API call - in production, this would call your backend
      const mockResults = [
        { result: "Probably Burkholderia pseudomallei", confidence: 0.9 },
        { result: "Not Burkholderia pseudomallei", confidence: 0.85 },
      ];

      // Randomly select a result for demonstration
      const selectedResult =
        mockResults[Math.floor(Math.random() * mockResults.length)];

      // Add some randomness to confidence
      const confidence =
        selectedResult.confidence + (Math.random() * 0.1 - 0.05);

      setAnalysisResult({
        ...selectedResult,
        confidence: Math.min(0.95, Math.max(0.8, confidence)),
      });
    } catch (error) {
      Alert.alert("Error", "Failed to analyze image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const saveReport = async () => {
    if (!analysisResult || !user) return;

    setSaving(true);
    try {
      const { error } = await supabase.from("analyses").insert({
        user_id: user.id,
        characteristics,
        culture_medium: medium,
        image_url: imageUri, // In production, upload to Supabase Storage first
        result: analysisResult.result,
        confidence: analysisResult.confidence,
        colony_age: colonyAge,
      });

      if (error) throw error;

      Alert.alert(
        "Report Saved",
        "Your analysis report has been saved successfully.",
        [
          {
            text: "View History",
            onPress: () => router.push("/(tabs)/history"),
          },
          {
            text: "New Analysis",
            onPress: () => router.push("/(tabs)/analyze/characteristics"),
          },
        ]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to save report. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const sendToLab = async () => {
    if (!analysisResult) return;

    setSending(true);
    try {
      // Mock API call to send report to lab
      const reportData = {
        characteristics,
        medium,
        colonyAge,
        result: analysisResult.result,
        confidence: analysisResult.confidence,
        timestamp: new Date().toISOString(),
        userId: user?.id,
      };

      // In production, this would call your /api/send-report endpoint
      console.log("Sending report to lab:", reportData);

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      Alert.alert(
        "Report Sent",
        "Your analysis report has been sent to the laboratory for review.",
        [{ text: "OK" }]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to send report to lab. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const handleNewAnalysis = () => {
    router.push("/(tabs)/analyze/characteristics");
  };

  const handleHome = () => {
    router.push("/(tabs)");
  };

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <TopBar title="Analyzing..." onBack={handleBack} />
        <View style={styles.loadingContainer}>
          <View style={styles.loadingContent}>
            <View style={styles.loadingIcon}>
              <Text style={styles.loadingEmoji}>🔬</Text>
            </View>
            <Text style={styles.loadingText}>Analyzing image...</Text>
            <Text style={styles.loadingSubtext}>
              Processing bacterial characteristics and colony morphology
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (!analysisResult) {
    return (
      <SafeAreaView style={styles.container}>
        <TopBar title="Analysis Failed" onBack={handleBack} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to analyze image</Text>
          <Button title="Try Again" onPress={analyzeImage} />
        </View>
      </SafeAreaView>
    );
  }

  const isPositive = analysisResult.result.includes("Probably");
  const confidencePercentage = Math.round(analysisResult.confidence * 100);
  const colonyAgeLabel =
    COLONY_AGES.find((age) => age.value === colonyAge)?.label || colonyAge;

  return (
    <SafeAreaView style={styles.container}>
      <TopBar title="Analysis Results" onBack={handleBack} />

      <ScrollView contentContainerStyle={styles.content}>
        <Card
          style={{
            ...styles.resultCard,
            ...(isPositive ? styles.positiveCard : styles.negativeCard),
          }}
        >
          <View style={styles.resultHeader}>
            <View style={styles.resultIconContainer}>
              {isPositive ? (
                <CheckCircle size={48} color={colors.error} />
              ) : (
                <XCircle size={48} color={colors.success} />
              )}
            </View>
            <Text style={styles.resultTitle}>Analysis Complete</Text>
          </View>

          <Text
            style={[
              styles.resultText,
              isPositive ? styles.positiveText : styles.negativeText,
            ]}
          >
            {analysisResult.result}
          </Text>

          <View style={styles.confidenceContainer}>
            <Text style={styles.confidenceLabel}>Confidence Level</Text>
            <Text style={styles.confidenceValue}>{confidencePercentage}%</Text>
            <View style={styles.confidenceBar}>
              <View
                style={[
                  styles.confidenceFill,
                  { width: `${confidencePercentage}%` },
                  isPositive ? styles.positiveBar : styles.negativeBar,
                ]}
              />
            </View>
          </View>
        </Card>

        <Card style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Analysis Summary</Text>

          <View style={styles.summarySection}>
            <Text style={styles.summaryLabel}>Bacterial Characteristics:</Text>
            <View style={styles.characteristicsList}>
              {characteristics.map((characteristic: string, index: number) => (
                <View key={index} style={styles.characteristicItem}>
                  <View style={styles.checkmark} />
                  <Text style={styles.characteristicText}>
                    {characteristic}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.summarySection}>
            <Text style={styles.summaryLabel}>Culture Medium:</Text>
            <Text style={styles.summaryValue}>{medium}</Text>
          </View>

          <View style={styles.summarySection}>
            <Text style={styles.summaryLabel}>Colony Age:</Text>
            <Text style={styles.summaryValue}>{colonyAgeLabel}</Text>
          </View>

          <View style={styles.summarySection}>
            <Text style={styles.summaryLabel}>Sample Image:</Text>
            <Image source={{ uri: imageUri }} style={styles.thumbnailImage} />
          </View>
        </Card>

        <Card style={styles.actionsCard}>
          <Text style={styles.actionsTitle}>Next Steps</Text>

          <View style={styles.actionButtons}>
            <Button
              title="Save Report"
              onPress={saveReport}
              loading={saving}
              style={styles.actionButton}
            />

            <Button
              title="Send to Lab"
              onPress={sendToLab}
              loading={sending}
              variant="secondary"
              style={styles.actionButton}
            />
          </View>

          <View style={styles.navigationButtons}>
            <Button
              title="New Analysis"
              onPress={handleNewAnalysis}
              variant="secondary"
              style={styles.navButton}
            />

            <Button
              title="Home"
              onPress={handleHome}
              style={styles.navButton}
            />
          </View>
        </Card>

        {isPositive && (
          <Card variant="outlined" style={styles.warningCard}>
            <Text style={styles.warningTitle}>Important Notice</Text>
            <Text style={styles.warningText}>
              A positive result indicates potential presence of Burkholderia
              pseudomallei. Please consult with laboratory personnel for
              confirmation and appropriate clinical action.
            </Text>
          </Card>
        )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  loadingContent: {
    alignItems: "center",
  },
  loadingIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary + "15",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  loadingEmoji: {
    fontSize: 32,
  },
  loadingText: {
    ...typography.heading2,
    color: colors.text,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  loadingSubtext: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  errorText: {
    ...typography.heading2,
    color: colors.error,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  resultCard: {
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  positiveCard: {
    backgroundColor: colors.error + "10",
    borderColor: colors.error,
    borderWidth: 1,
  },
  negativeCard: {
    backgroundColor: colors.success + "10",
    borderColor: colors.success,
    borderWidth: 1,
  },
  resultHeader: {
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  resultIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  resultTitle: {
    ...typography.heading2,
    color: colors.text,
    textAlign: "center",
  },
  resultText: {
    ...typography.heading3,
    textAlign: "center",
    marginBottom: spacing.lg,
    fontWeight: "700",
  },
  positiveText: {
    color: colors.error,
  },
  negativeText: {
    color: colors.success,
  },
  confidenceContainer: {
    width: "100%",
    alignItems: "center",
  },
  confidenceLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  confidenceValue: {
    ...typography.heading3,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  confidenceBar: {
    width: "100%",
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: "hidden",
  },
  confidenceFill: {
    height: "100%",
    borderRadius: 4,
  },
  positiveBar: {
    backgroundColor: colors.error,
  },
  negativeBar: {
    backgroundColor: colors.success,
  },
  summaryCard: {
    marginBottom: spacing.lg,
  },
  summaryTitle: {
    ...typography.heading3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  summarySection: {
    marginBottom: spacing.md,
  },
  summaryLabel: {
    ...typography.body,
    color: colors.text,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  characteristicsList: {
    gap: spacing.xs,
  },
  characteristicItem: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: spacing.sm,
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
    color: colors.textSecondary,
  },
  summaryValue: {
    ...typography.body,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
  thumbnailImage: {
    width: 100,
    height: 100,
    borderRadius: spacing.sm,
    marginTop: spacing.xs,
    marginLeft: spacing.sm,
  },
  actionsCard: {
    marginBottom: spacing.lg,
  },
  actionsTitle: {
    ...typography.heading3,
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: "center",
  },
  actionButtons: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  actionButton: {
    flex: 1,
  },
  navigationButtons: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  navButton: {
    flex: 1,
  },
  warningCard: {
    backgroundColor: colors.warning + "10",
    borderColor: colors.warning,
  },
  warningTitle: {
    ...typography.heading3,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  warningText: {
    ...typography.body,
    color: colors.text,
    lineHeight: 22,
  },
});
