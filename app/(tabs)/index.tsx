import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Alert } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Activity,
  ChartBar as BarChart,
  Clock,
  TrendingUp,
} from "lucide-react-native";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { colors, typography, spacing } from "@/constants/theme";

interface AnalysisStats {
  total: number;
  thisWeek: number;
  positive: number;
  negative: number;
}

export default function HomeScreen() {
  const { user, signOut } = useAuth();
  const [stats, setStats] = useState<AnalysisStats>({
    total: 0,
    thisWeek: 0,
    positive: 0,
    negative: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.replace("/(auth)/login");
      return;
    }
    loadStats();
  }, [user]);

  const loadStats = async () => {
    try {
      const { data: analyses, error } = await supabase
        .from("analyses")
        .select("*")
        .eq("user_id", user?.id);

      if (error) throw error;

      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const total = analyses?.length || 0;
      const thisWeek =
        analyses?.filter((analysis) => new Date(analysis.created_at) > weekAgo)
          .length || 0;
      const positive =
        analyses?.filter((analysis) => analysis.result?.includes("Probably"))
          .length || 0;
      const negative = total - positive;

      setStats({ total, thisWeek, positive, negative });
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartAnalysis = () => {
    router.push("/analyze");
  };

  const handleSignOut = async () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await signOut();
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  // Get user's display name
  const getUserDisplayName = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name;
    }
    if (user?.user_metadata?.first_name) {
      const lastName = user.user_metadata.last_name
        ? ` ${user.user_metadata.last_name}`
        : "";
      return `${user.user_metadata.first_name}${lastName}`;
    }
    // Fallback to email username if no name is available
    return user?.email?.split("@")[0] || "User";
  };

  const getUserRole = () => {
    return user?.user_metadata?.role || "Lab Technician";
  };

  if (!user) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <Text style={styles.welcome}>Welcome back,</Text>
            <Text style={styles.userName}>{getUserDisplayName()}</Text>
            <Text style={styles.userRole}>{getUserRole()}</Text>
          </View>
          <Button
            title="Sign Out"
            onPress={handleSignOut}
            variant="secondary"
            size="small"
          />
        </View>

        <Card style={styles.heroCard}>
          <Text style={styles.heroTitle}>Bacterial Pathogen Analyzer</Text>
          <Text style={styles.heroSubtitle}>
            Professional diagnostic tool for Burkholderia pseudomallei
            identification
          </Text>
          <Button
            title="Start New Analysis"
            onPress={handleStartAnalysis}
            style={styles.startButton}
          />
        </Card>

        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <View style={styles.statHeader}>
              <BarChart size={24} color={colors.primary} />
              <Text style={styles.statNumber}>{stats.total}</Text>
            </View>
            <Text style={styles.statLabel}>Total Analyses</Text>
          </Card>

          <Card style={styles.statCard}>
            <View style={styles.statHeader}>
              <Clock size={24} color={colors.primary} />
              <Text style={styles.statNumber}>{stats.thisWeek}</Text>
            </View>
            <Text style={styles.statLabel}>This Week</Text>
          </Card>

          <Card style={styles.statCard}>
            <View style={styles.statHeader}>
              <TrendingUp size={24} color={colors.primary} />
              <Text style={styles.statNumber}>{stats.positive}</Text>
            </View>
            <Text style={styles.statLabel}>Positive Results</Text>
          </Card>

          <Card style={styles.statCard}>
            <View style={styles.statHeader}>
              <Activity size={24} color={colors.primary} />
              <Text style={styles.statNumber}>{stats.negative}</Text>
            </View>
            <Text style={styles.statLabel}>Negative Results</Text>
          </Card>
        </View>

        <Card style={styles.infoCard}>
          <Text style={styles.infoTitle}>About Burkholderia pseudomallei</Text>
          <Text style={styles.infoText}>
            This app helps identify Burkholderia pseudomallei, the causative
            agent of melioidosis. Key characteristics include gram-negative
            bacilli with bipolar appearance and oxidase-positive reactions.
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.lg,
  },
  userInfo: {
    flex: 1,
  },
  welcome: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  userName: {
    ...typography.heading2,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  userRole: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: "600",
  },
  heroCard: {
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  heroTitle: {
    ...typography.heading2,
    color: colors.text,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  heroSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  startButton: {
    minWidth: 200,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    minWidth: 150,
    alignItems: "center",
  },
  statHeader: {
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  statNumber: {
    ...typography.heading2,
    color: colors.text,
    marginTop: spacing.xs,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: "center",
  },
  infoCard: {
    marginTop: spacing.md,
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
