
/**
 * Results Screen - Integrated with Real ML Model
 * Shows prediction results from the ML API
 */

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  Pressable,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import {
  predictBacterium,
  checkMLApiHealth,
  PredictionResponse,
} from "@/lib/mlService";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";
import { colors, spacing } from "@/constants/theme";

export default function ResultsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const params = useLocalSearchParams();

  // Parse parameters from previous screens
  const characteristics = JSON.parse(
    (params.characteristics as string) || "[]"
  ) as string[];
  const imageUri = params.imageUri as string;
  const colonyAge = params.colonyAge as string;

  // Try multiple ways to get the agar/cultureMedium
  let cultureMedium =
    (params.cultureMedium as string) ||
    (params.medium as string) ||
    "Ashdown Agar";

  // State
  const [loading, setLoading] = useState(true);
  const [apiHealthy, setApiHealthy] = useState(false);
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Check API health and run prediction on mount
  useEffect(() => {
    performAnalysis();
  }, []);

  const performAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if ML API is available
      console.log("Checking ML API health...");

      const healthStatus = await checkMLApiHealth();
      setApiHealthy(healthStatus.healthy);

      if (!healthStatus.healthy) {
        console.warn("[Health Check Failed]", healthStatus.message);
        throw new Error(
          healthStatus.message ||
          "ML API is not available. Please ensure the backend server is running."
        );
      }

      // Prepare request
      const request = {
        imageUri,
        agar: cultureMedium,
        colonyAge,
        characteristics,
      };

      console.log("Sending prediction request...");
      const result = await predictBacterium(request);

      setPrediction(result);
      console.log("Prediction received:", result);
    } catch (err) {
      console.error("Analysis failed:", err);
      setError(err instanceof Error ? err.message : "Analysis failed");

      Alert.alert(
        "Analysis Failed",
        err instanceof Error
          ? err.message
          : "An error occurred during analysis",
        [
          { text: "Retry", onPress: performAnalysis },
          { text: "Go Back", onPress: () => router.back() },
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const saveToHistory = async () => {
    if (!prediction || !user) return;

    try {
      setSaving(true);

      // Save analysis to database
      const { error: insertError } = await supabase.from("analyses").insert({
        user_id: user.id,
        characteristics,
        culture_medium: cultureMedium,
        colony_age: colonyAge,
        image_url: imageUri,
        result: prediction.result,
        confidence: prediction.confidence / 100, // Store as decimal
      });

      if (insertError) {
        console.error("Insert error:", insertError);
        throw insertError;
      }

      Alert.alert("Success", "Analysis saved to history", [
        {
          text: "View History",
          onPress: () => router.push("/(tabs)/history"),
        },
        {
          text: "New Analysis",
          onPress: () => router.push("/(tabs)/analyze"),
        },
      ]);
    } catch (err) {
      console.error("Error saving analysis:", err);
      Alert.alert(
        "Error",
        err instanceof Error ? err.message : "Failed to save analysis"
      );
    } finally {
      setSaving(false);
    }
  };

  const sendToLab = () => {
    Alert.alert(
      "Send to Laboratory",
      "This feature will be available soon. It will allow you to send the analysis to a laboratory for confirmation.",
      [{ text: "OK" }]
    );
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Analyzing bacterial sample...</Text>
        <Text style={[styles.loadingSubtext, { color: colors.textSecondary }]}>
          Using AI-powered detection model
        </Text>
      </View>
    );
  }

  if (error || !prediction) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: colors.background }]}>
        <Feather name="alert-circle" size={64} color={colors.error} />
        <Text style={[styles.errorText, { color: colors.error }]}>Analysis Failed</Text>
        <Text style={[styles.errorSubtext, { color: colors.textSecondary }]}>{error || "Unknown error"}</Text>
        <Pressable style={[styles.retryButton, { backgroundColor: colors.primary }]} onPress={performAnalysis}>
          <Text style={styles.retryButtonText}>Retry Analysis</Text>
        </Pressable>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={[styles.backButtonText, { color: colors.primary }]}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const isBpseudomallei = prediction.is_bpseudo;
  const confidenceColor =
    prediction.confidence >= 90
      ? colors.success
      : prediction.confidence >= 70
        ? colors.warning
        : colors.error;

  const confidenceLevel =
    prediction.confidence >= 90
      ? "Very High"
      : prediction.confidence >= 70
        ? "Moderate"
        : prediction.confidence >= 50
          ? "Low"
          : "Very Low";

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
      {/* Result Header Card */}
      <View
        style={[
          styles.resultHeaderCard,
          {
            backgroundColor: isBpseudomallei ? colors.error + "20" : colors.success + "20",
            borderColor: isBpseudomallei ? colors.error : colors.success,
          },
        ]}
      >
        <View style={styles.resultIconContainer}>
          <Feather
            name={isBpseudomallei ? "alert-triangle" : "check-circle"}
            size={56}
            color={isBpseudomallei ? colors.error : colors.success}
            strokeWidth={1.5}
          />
        </View>

        <Text style={[styles.resultTitle, { color: colors.text }]}>{prediction.result}</Text>

        <View style={styles.confidenceSection}>
          <Text style={[styles.confidenceLabel, { color: colors.textSecondary }]}>Confidence Score</Text>
          <Text style={[styles.confidenceValue, { color: confidenceColor }]}>
            {prediction.confidence.toFixed(1)}%
          </Text>
          <Text style={[styles.confidenceLevelText, { color: colors.textSecondary }]}>{confidenceLevel}</Text>
        </View>
      </View>

      {/* Captured Image */}
      {imageUri && (
        <View style={styles.imageSection}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Captured Sample</Text>
          <Image source={{ uri: imageUri }} style={[styles.image, { backgroundColor: colors.surface }]} />
        </View>
      )}

      {/* Analysis Details Card */}
      <View style={[styles.detailsCard, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Analysis Details</Text>

        <View style={styles.detailRow}>
          <View style={[styles.detailIcon, { backgroundColor: colors.primary + "15" }]}>
            <Feather name="droplet" size={18} color={colors.primary} />
          </View>
          <View style={styles.detailContent}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Culture Medium</Text>
            <Text style={[styles.detailValue, { color: colors.textSecondary }]}>{prediction.metadata.agar}</Text>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <View style={styles.detailRow}>
          <View style={[styles.detailIcon, { backgroundColor: colors.primary + "15" }]}>
            <Feather name="clock" size={18} color={colors.primary} />
          </View>
          <View style={styles.detailContent}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Colony Age</Text>
            <Text style={[styles.detailValue, { color: colors.textSecondary }]}>
              {prediction.metadata.colony_age}
            </Text>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <View style={styles.detailRow}>
          <View style={[styles.detailIcon, { backgroundColor: colors.primary + "15" }]}>
            <Feather name="zap" size={18} color={colors.primary} />
          </View>
          <View style={styles.detailContent}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Time Elapsed</Text>
            <Text style={[styles.detailValue, { color: colors.textSecondary }]}>
              {prediction.metadata.time_hours} hours
            </Text>
          </View>
        </View>

        {prediction.metadata.characteristics.length > 0 && (
          <>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.detailRow}>
              <View style={[styles.detailIcon, { backgroundColor: colors.primary + "15" }]}>
                <Feather name="list" size={18} color={colors.primary} />
              </View>
              <View style={styles.detailContent}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Characteristics</Text>
                <View style={styles.characteristicsList}>
                  {prediction.metadata.characteristics.map((char, index) => (
                    <View key={index} style={[styles.characteristicBadge, { backgroundColor: colors.primary + "15" }]}>
                      <Text style={[styles.characteristicText, { color: colors.primary }]}>{char}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </>
        )}
      </View>

      {/* Interpretation Card */}
      <View style={[styles.interpretationCard, { backgroundColor: colors.surface, borderLeftColor: colors.primary }]}>
        <View style={styles.interpretationHeader}>
          <Feather name="info" size={20} color={colors.primary} />
          <Text style={[styles.interpretationTitle, { color: colors.textSecondary }]}>Interpretation</Text>
        </View>
        <Text style={[styles.interpretationText, { color: colors.textSecondary }]}>
          {prediction.interpretation}
        </Text>
      </View>

      {/* Recommendations Card */}
      <View style={[styles.recommendationsCard, { backgroundColor: colors.surface }]}>
        <View style={styles.recommendationsHeader}>
          <Feather name="check-square" size={20} color={colors.primary} />
          <Text style={[styles.recommendationsTitle, { color: colors.textSecondary }]}>Recommendations</Text>
        </View>
        <View style={styles.recommendationsList}>
          {prediction.recommendations.map((rec, index) => (
            <View key={index} style={styles.recommendationItem}>
              <View style={[styles.recommendationDot, { backgroundColor: colors.primary }]} />
              <Text style={[styles.recommendationText, { color: colors.textSecondary }]}>{rec}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtonsSection}>
        <Pressable
          style={[styles.actionButton, styles.primaryActionButton, { backgroundColor: colors.primary }]}
          onPress={saveToHistory}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Feather name="save" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Save to History</Text>
            </>
          )}
        </Pressable>

        <Pressable
          style={[styles.actionButton, styles.secondaryActionButton, { backgroundColor: colors.surface, borderColor: colors.primary }]}
          onPress={sendToLab}
        >
          <Feather name="send" size={20} color={colors.primary} />
          <Text style={[styles.secondaryActionButtonText, { color: colors.primary }]}>Send to Lab</Text>
        </Pressable>

        <Pressable
          style={[
            styles.actionButton,
            styles.outlineActionButton,
            { backgroundColor: colors.surface, borderColor: colors.border }
          ]}
          onPress={() => router.push("/(tabs)/analyze")}
        >
          <Feather name="plus" size={20} color={colors.primary} />
          <Text style={[styles.secondaryActionButtonText, { color: colors.primary }]}>New Analysis</Text>
        </Pressable>
      </View>

      {/* API Status */}
      <View style={styles.apiStatusSection}>
        <View
          style={[
            styles.statusIndicator,
            { backgroundColor: apiHealthy ? colors.success : colors.error },
          ]}
        />
        <Text style={[styles.apiStatusText, { color: colors.textSecondary }]}>
          {apiHealthy ? "ML API Connected" : "ML API Disconnected"}
        </Text>
      </View>

      <View style={{ height: 20 }} />
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: "600",
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  errorText: {
    marginTop: 16,
    fontSize: 24,
    fontWeight: "bold",
  },
  errorSubtext: {
    marginTop: 8,
    fontSize: 14,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 24,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  backButton: {
    marginTop: 12,
    paddingVertical: 12,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  resultHeaderCard: {
    margin: 16,
    marginBottom: 12,
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 2,
  },
  resultIconContainer: {
    marginBottom: 12,
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 16,
  },
  confidenceSection: {
    alignItems: "center",
    width: "100%",
  },
  confidenceLabel: {
    fontSize: 12,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  confidenceValue: {
    fontSize: 48,
    fontWeight: "900",
    marginVertical: 4,
  },
  confidenceLevelText: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 4,
  },
  imageSection: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },
  image: {
    width: "100%",
    height: 280,
    borderRadius: 12,
  },
  detailsCard: {
    margin: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 8,
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: "500",
  },
  divider: {
    height: 1,
    marginVertical: 8,
  },
  characteristicsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
    gap: 6,
  },
  characteristicBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  characteristicText: {
    fontSize: 12,
    fontWeight: "600",
  },
  interpretationCard: {
    margin: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  interpretationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  interpretationTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8,
  },
  interpretationText: {
    fontSize: 14,
    lineHeight: 22,
  },
  recommendationsCard: {
    margin: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  recommendationsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  recommendationsTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8,
  },
  recommendationsList: {
    gap: 10,
  },
  recommendationItem: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  recommendationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
    marginRight: 12,
  },
  recommendationText: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  actionButtonsSection: {
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 10,
    gap: 10,
  },
  primaryActionButton: {
    // Background dynamic
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryActionButton: {
    borderWidth: 2,
  },
  secondaryActionButtonText: {
    fontSize: 16,
    fontWeight: "700",
  },
  outlineActionButton: {
    borderWidth: 1,
  },
  apiStatusSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    gap: 8,
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  apiStatusText: {
    fontSize: 12,
    fontWeight: "600",
  },
});

