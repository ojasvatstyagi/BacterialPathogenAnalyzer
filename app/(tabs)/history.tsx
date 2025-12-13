
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Calendar, ListFilter as Filter, Search } from "lucide-react-native";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { supabase } from "@/lib/supabase";
import { typography, spacing } from "@/constants/theme";

interface Analysis {
  id: string;
  characteristics: string[];
  culture_medium: string;
  image_url: string | null;
  result: string | null;
  confidence: number | null;
  colony_age: string;
  created_at: string;
}

export default function HistoryScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<"all" | "positive" | "negative">("all");

  useEffect(() => {
    if (user) {
      loadAnalyses();
    }
  }, [user, filter]);

  const loadAnalyses = async () => {
    try {
      let query = supabase
        .from("analyses")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (filter === "positive") {
        query = query.ilike("result", "%Probably%");
      } else if (filter === "negative") {
        query = query.not("result", "ilike", "%Probably%");
      }

      const { data, error } = await query;

      if (error) throw error;

      setAnalyses(data || []);
    } catch (error) {
      console.error("Error loading analyses:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadAnalyses();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getResultColor = (result: string | null) => {
    if (!result) return colors.textSecondary;
    return result.includes("Probably") ? colors.error : colors.success;
  };

  const getFilteredCount = () => {
    switch (filter) {
      case "positive":
        return analyses.filter((a) => a.result?.includes("Probably")).length;
      case "negative":
        return analyses.filter(
          (a) => a.result && !a.result.includes("Probably")
        ).length;
      default:
        return analyses.length;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading analysis history...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Analysis History</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
          {getFilteredCount()} {filter === "all" ? "total" : filter} analyses
        </Text>
      </View>

      <View style={[styles.filterContainer, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filterButtons}>
            <Button
              title="All"
              onPress={() => setFilter("all")}
              variant={filter === "all" ? "primary" : "secondary"}
              size="small"
              style={styles.filterButton}
            />
            <Button
              title="Positive"
              onPress={() => setFilter("positive")}
              variant={filter === "positive" ? "primary" : "secondary"}
              size="small"
              style={styles.filterButton}
            />
            <Button
              title="Negative"
              onPress={() => setFilter("negative")}
              variant={filter === "negative" ? "primary" : "secondary"}
              size="small"
              style={styles.filterButton}
            />
          </View>
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {analyses.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Calendar
              size={48}
              color={colors.disabled}
              style={styles.emptyIcon}
            />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No Analyses Found</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {filter === "all"
                ? "Start your first bacterial analysis to see results here."
                : `No ${filter} results found. Try changing your filter.`}
            </Text>
          </Card>
        ) : (
          analyses.map((analysis) => (
            <TouchableOpacity key={analysis.id} activeOpacity={0.7}>
              <Card style={styles.analysisCard}>
                <View style={styles.analysisHeader}>
                  <View style={styles.analysisInfo}>
                    <Text style={[styles.analysisDate, { color: colors.text }]}>
                      {formatDate(analysis.created_at)}
                    </Text>
                    <Text style={[styles.analysisMedium, { color: colors.textSecondary }]}>
                      {analysis.culture_medium}
                    </Text>
                    <Text style={[styles.analysisMedium, { color: colors.textSecondary }]}>
                      Colony Age: {analysis.colony_age}
                    </Text>
                  </View>
                  {analysis.image_url && (
                    <Image
                      source={{ uri: analysis.image_url }}
                      style={[styles.analysisImage, { borderColor: colors.border }]}
                    />
                  )}
                </View>

                <View style={styles.characteristicsList}>
                  {analysis.characteristics.map((characteristic, index) => (
                    <Text key={index} style={[styles.characteristicItem, { color: colors.textSecondary }]}>
                      • {characteristic}
                    </Text>
                  ))}
                </View>

                {analysis.result && (
                  <View style={[styles.resultContainer, { borderTopColor: colors.border }]}>
                    <Text
                      style={[
                        styles.resultText,
                        { color: getResultColor(analysis.result) },
                      ]}
                    >
                      {analysis.result}
                    </Text>
                    {analysis.confidence && (
                      <Text style={[styles.confidenceText, { color: colors.textSecondary }]}>
                        {Math.round(analysis.confidence * 100)}% confidence
                      </Text>
                    )}
                  </View>
                )}
              </Card>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  headerTitle: {
    ...typography.heading2,
  },
  headerSubtitle: {
    ...typography.caption,
    marginTop: spacing.xs,
  },
  filterContainer: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  filterButtons: {
    flexDirection: "row",
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  filterButton: {
    paddingHorizontal: spacing.md,
  },
  content: {
    padding: spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    ...typography.body,
  },
  emptyCard: {
    alignItems: "center",
    paddingVertical: spacing.xxl,
  },
  emptyIcon: {
    marginBottom: spacing.md,
  },
  emptyTitle: {
    ...typography.heading3,
    marginBottom: spacing.sm,
  },
  emptyText: {
    ...typography.body,
    textAlign: "center",
    lineHeight: 24,
  },
  analysisCard: {
    marginBottom: spacing.md,
  },
  analysisHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.sm,
  },
  analysisInfo: {
    flex: 1,
  },
  analysisDate: {
    ...typography.body,
    fontWeight: "600",
  },
  analysisMedium: {
    ...typography.caption,
    marginTop: spacing.xs,
  },
  analysisImage: {
    width: 100,
    height: 100,
    borderRadius: spacing.sm,
    marginLeft: spacing.md,
    borderWidth: 1,
  },
  characteristicsList: {
    marginBottom: spacing.sm,
  },
  characteristicItem: {
    ...typography.caption,
    marginBottom: 2,
  },
  resultContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: spacing.sm,
    borderTopWidth: 1,
  },
  resultText: {
    ...typography.body,
    fontWeight: "600",
    flex: 1,
  },
  confidenceText: {
    ...typography.caption,
  },
});
