/**
 * Results Screen - Integrated with Real ML Model
 * Shows prediction results from the ML API with Auto-Save and Premium UI
 */

import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  Pressable,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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

export default function ResultsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const params = useLocalSearchParams();

  // Parse parameters
  const characteristics = JSON.parse((params.characteristics as string) || "[]") as string[];
  const imageUri = params.imageUri as string;
  const colonyAge = params.colonyAge as string;
  const cultureMedium = (params.cultureMedium as string) || (params.medium as string) || "Ashdown Agar";

  // State
  const [loading, setLoading] = useState(true);
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    performAnalysis();
  }, []);

  useEffect(() => {
    if (!loading && prediction) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    }
  }, [loading, prediction]);

  const performAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);

      const healthy = await checkMLApiHealth();
      if (!healthy) throw new Error("Could not connect to analysis servers.");

      const result = await predictBacterium({
        imageUri,
        agar: cultureMedium,
        colonyAge,
        characteristics,
      });

      setPrediction(result);
      if (user) await autoSaveToHistory(result);

    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  const autoSaveToHistory = async (result: PredictionResponse) => {
    try {
      const { error: insertError } = await supabase.from("analyses").insert({
        user_id: user?.id,
        characteristics,
        culture_medium: cultureMedium,
        colony_age: colonyAge,
        image_url: imageUri,
        result: result.result,
        confidence: result.confidence / 100,
      });

      if (insertError) throw insertError;
      setIsSaved(true);
    } catch (err) {
      console.error("Auto-save failed:", err);
    }
  };

  const getStatusMeta = (score: number) => {
    if (score >= 90) return { label: "Very High Confidence", color: colors.success };
    if (score >= 70) return { label: "High Confidence", color: colors.success };
    if (score >= 50) return { label: "Moderate Confidence", color: colors.warning };
    return { label: "Low Confidence", color: colors.error };
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>Analyzing Sample...</Text>
        <Text style={[styles.loadingSubtext, { color: colors.textSecondary }]}>
          Running deep learning classification models
        </Text>
      </SafeAreaView>
    );
  }

  if (error || !prediction) {
    return (
      <SafeAreaView style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <View style={[styles.errorCircle, { backgroundColor: colors.error + '15' }]}>
          <Feather name="alert-circle" size={40} color={colors.error} />
        </View>
        <Text style={[styles.errorTitle, { color: colors.text }]}>Analysis Error</Text>
        <Text style={[styles.errorText, { color: colors.textSecondary }]}>{error}</Text>
        <Pressable style={[styles.primaryButton, { width: '100%', backgroundColor: colors.primary }]} onPress={performAnalysis}>
          <Text style={styles.buttonText}>Retry Analysis</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const statusMeta = getStatusMeta(prediction.confidence);
  const isBpseudo = prediction.is_bpseudo;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim, paddingBottom: 40 }}>

          {/* Save Badge */}
          {isSaved && (
            <View style={styles.saveBadgeContainer}>
              <View style={[styles.statusBadge, { backgroundColor: colors.success + '10' }]}>
                <Feather name="shield" size={12} color={colors.success} />
                <Text style={[styles.savedText, { color: colors.success }]}>Secured in History</Text>
              </View>
            </View>
          )}

          {/* Main Result Card */}
          <View style={[styles.resultCard, { backgroundColor: colors.surface, borderTopColor: isBpseudo ? colors.error : colors.success }]}>
            <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>DETECTION RESULT</Text>
            <Text style={[styles.resultTitle, { color: colors.text }]}>{prediction.result}</Text>

            <View style={styles.confidenceContainer}>
              <View style={styles.confidenceRow}>
                <Text style={[styles.confidenceValue, { color: statusMeta.color }]}>{prediction.confidence.toFixed(1)}%</Text>
                <Text style={[styles.confidenceLevel, { color: colors.textSecondary }]}>{statusMeta.label}</Text>
              </View>
              <View style={[styles.progressBarBg, { backgroundColor: colors.border }]}>
                <View style={[styles.progressBarFill, { width: `${prediction.confidence}%`, backgroundColor: statusMeta.color }]} />
              </View>
            </View>
          </View>

          {/* Details Section */}
          <View style={styles.detailsGrid}>
            <View style={[styles.detailItem, { backgroundColor: colors.surface }]}>
              <Feather name="disc" size={16} color={colors.primary} />
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Medium</Text>
              <Text style={[styles.detailValue, { color: colors.text }]} numberOfLines={1}>{prediction.metadata.agar}</Text>
            </View>
            <View style={[styles.detailItem, { backgroundColor: colors.surface }]}>
              <Feather name="clock" size={16} color={colors.primary} />
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Colony Age</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>{prediction.metadata.colony_age}</Text>
            </View>
          </View>

          {/* Image Card */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Analysis Sample</Text>
          </View>
          <View style={[styles.imageCard, { backgroundColor: colors.surface }]}>
            <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
          </View>

          {/* Insights */}
          <View style={[styles.infoCard, { backgroundColor: colors.surface, borderLeftColor: colors.primary }]}>
            <View style={styles.cardHeader}>
              <Feather name="message-square" size={18} color={colors.primary} />
              <Text style={[styles.cardTitle, { color: colors.text }]}>Clinical Interpretation</Text>
            </View>
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>{prediction.interpretation}</Text>
          </View>

          {/* Recommendations */}
          <View style={[styles.infoCard, { backgroundColor: colors.surface }]}>
            <View style={styles.cardHeader}>
              <Feather name="activity" size={18} color={colors.primary} />
              <Text style={[styles.cardTitle, { color: colors.text }]}>Next Steps</Text>
            </View>
            {prediction.recommendations.map((rec, i) => (
              <View key={i} style={styles.listRow}>
                <View style={[styles.dot, { backgroundColor: colors.primary }]} />
                <Text style={[styles.infoText, { color: colors.textSecondary, flex: 1 }]}>{rec}</Text>
              </View>
            ))}
          </View>

          {/* Footer Actions */}
          <View style={styles.footer}>
            <Pressable style={[styles.primaryButton, { backgroundColor: colors.primary }]} onPress={() => router.push("/(tabs)/analyze")}>
              <Feather name="plus" size={20} color="#FFF" />
              <Text style={styles.buttonText}>New Analysis</Text>
            </Pressable>
            <Pressable style={[styles.secondaryButton, { borderColor: colors.border }]} onPress={() => router.push("/(tabs)/history")}>
              <Text style={[styles.secondaryButtonText, { color: colors.text }]}>View All History</Text>
            </Pressable>
          </View>

        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1 },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 30 },
  loadingText: { marginTop: 20, fontSize: 18, fontWeight: "700" },
  loadingSubtext: { marginTop: 8, fontSize: 14, textAlign: 'center', opacity: 0.7 },
  saveBadgeContainer: { alignItems: 'center', marginTop: 10 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, gap: 6 },
  savedText: { fontSize: 12, fontWeight: "700" },
  resultCard: { margin: 16, padding: 24, borderRadius: 20, borderTopWidth: 6, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8 },
  resultLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 1, marginBottom: 8 },
  resultTitle: { fontSize: 28, fontWeight: '800', marginBottom: 20 },
  confidenceContainer: { width: '100%' },
  confidenceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 8 },
  confidenceValue: { fontSize: 24, fontWeight: '900' },
  confidenceLevel: { fontSize: 13, fontWeight: '600' },
  progressBarBg: { height: 8, borderRadius: 4, width: '100%', overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 4 },
  detailsGrid: { flexDirection: 'row', paddingHorizontal: 16, gap: 12, marginBottom: 24 },
  detailItem: { flex: 1, padding: 16, borderRadius: 16, gap: 4 },
  detailLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  detailValue: { fontSize: 14, fontWeight: '700' },
  sectionHeader: { paddingHorizontal: 20, marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700' },
  imageCard: { marginHorizontal: 16, borderRadius: 20, overflow: 'hidden', width: "100%", height: 280, marginBottom: 24 },
  image: { width: '100%', height: '100%' },
  infoCard: { marginHorizontal: 16, marginBottom: 16, padding: 20, borderRadius: 20, borderLeftWidth: 0 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  infoText: { fontSize: 14, lineHeight: 22 },
  listRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 },
  dot: { width: 6, height: 6, borderRadius: 3, marginTop: 8 },
  footer: { paddingHorizontal: 16, gap: 12, marginTop: 12 },
  primaryButton: { height: 56, borderRadius: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  secondaryButton: { height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  secondaryButtonText: { fontSize: 16, fontWeight: '600' },
  errorCircle: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  errorTitle: { fontSize: 20, fontWeight: '800', marginBottom: 10 },
  errorText: { textAlign: 'center', marginBottom: 30, lineHeight: 20 }
});