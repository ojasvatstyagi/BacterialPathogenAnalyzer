
import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
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
import { useTheme } from "@/context/ThemeContext";
import { supabase } from "@/lib/supabase";
import { typography, spacing } from "@/constants/theme";

interface AnalysisStats {
  total: number;
  thisWeek: number;
  positive: number;
  negative: number;
}

const StatCard = ({
  icon: Icon,
  title,
  value,
  color,
}: {
  icon: any;
  title: string;
  value: number;
  color: string;
}) => {
  const { colors } = useTheme();
  return (
    <Card style={styles.statCard}>
      <View style={styles.statHeader}>
        <Icon size={24} color={color} />
        <Text style={[styles.statNumber, { color: colors.text }]}>{value}</Text>
      </View>
      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{title}</Text>
    </Card>
  );
};

export default function HomeScreen() {
  const { user, signOut } = useAuth();
  const { colors } = useTheme();
  const [stats, setStats] = useState<AnalysisStats>({
    total: 0,
    thisWeek: 0,
    positive: 0,
    negative: 0,
  });
  const [loading, setLoading] = useState(true);

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
    return user?.email?.split("@")[0] || "User";
  };

  const getUserRole = () => {
    return user?.user_metadata?.role || "Lab Technician";
  };

  const loadStats = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data: analyses, error } = await supabase
        .from("analyses")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;

      const analysesArray = analyses || [];
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const total = analysesArray.length;

      const thisWeek =
        analysesArray.filter(
          (analysis) => new Date(analysis.created_at) > weekAgo
        ).length || 0;

      const positive =
        analysesArray.filter((analysis) =>
          analysis.result?.includes("Probably") ||
          analysis.result?.includes("Possibly")
        ).length || 0;

      const negative = total - positive;

      setStats({ total, thisWeek, positive, negative });
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      if (user) {
        loadStats();
      } else {
        router.replace("/(auth)/login");
      }
      return () => {
        setLoading(true);
      };
    }, [user, loadStats])
  );

  const handleStartAnalysis = () => {
    router.push("/analyze/");
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

  if (!user || loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <Text style={[styles.welcome, { color: colors.textSecondary }]}>Welcome back,</Text>
            <Text style={[styles.userName, { color: colors.text }]}>{getUserDisplayName()}</Text>
            <Text style={[styles.userRole, { color: colors.primary }]}>{getUserRole()}</Text>
          </View>
          <Button
            title="Sign Out"
            onPress={handleSignOut}
            variant="secondary"
            size="small"
          />
        </View>

        {/* Hero Card */}
        <Card style={styles.heroCard}>
          <Text style={[styles.heroTitle, { color: colors.text }]}>Bacterial Pathogen Analyzer</Text>
          <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>
            Professional diagnostic tool for Burkholderia pseudomallei
            identification
          </Text>
          <Button
            title="Start New Analysis"
            onPress={handleStartAnalysis}
            style={styles.startButton}
          />
        </Card>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard
            icon={BarChart}
            title="Total Analyses"
            value={stats.total}
            color={colors.primary}
          />
          <StatCard
            icon={Clock}
            title="This Week"
            value={stats.thisWeek}
            color={colors.primary}
          />
          <StatCard
            icon={TrendingUp}
            title="Positive Results"
            value={stats.positive}
            color={colors.error}
          />
          <StatCard
            icon={Activity}
            title="Negative Results"
            value={stats.negative}
            color={colors.success}
          />
        </View>

        {/* Info Card */}
        <Card style={styles.infoCard}>
          <Text style={[styles.infoTitle, { color: colors.text }]}>About Burkholderia pseudomallei</Text>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    ...typography.body,
    marginTop: spacing.md,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
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
    marginBottom: spacing.xs,
  },
  userName: {
    ...typography.heading2,
    marginBottom: spacing.xs,
  },
  userRole: {
    ...typography.caption,
    fontWeight: "600",
  },
  heroCard: {
    alignItems: "center",
    marginBottom: spacing.lg,
    padding: spacing.xl,
  },
  heroTitle: {
    ...typography.heading2,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  heroSubtitle: {
    ...typography.body,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  startButton: {
    minWidth: 200,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statCard: {
    width: "48.5%",
    alignItems: "center",
    padding: spacing.md,
  },
  statHeader: {
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  statNumber: {
    ...typography.heading2,
    marginTop: spacing.xs,
  },
  statLabel: {
    ...typography.caption,
    textAlign: "center",
    minHeight: typography.caption.lineHeight * 2,
  },
  infoCard: {
    marginTop: spacing.md,
  },
  infoTitle: {
    ...typography.heading3,
    marginBottom: spacing.sm,
  },
  infoText: {
    ...typography.body,
    lineHeight: 24,
  },
});
