import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Alert } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  User,
  Mail,
  Settings,
  CircleHelp as HelpCircle,
  Shield,
  LogOut,
  FileText,
  Bell,
} from "lucide-react-native";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/context/AuthContext";
import { colors, typography, spacing } from "@/constants/theme";

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          setLoading(true);
          try {
            await signOut();
            router.replace("/(auth)/login");
          } catch (error) {
            Alert.alert("Error", "Failed to sign out. Please try again.");
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const handleExportData = () => {
    Alert.alert(
      "Export Data",
      "This feature will export your analysis history and personal data.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Export", onPress: () => console.log("Export data") },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "This action cannot be undone. All your data will be permanently deleted.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "Feature Coming Soon",
              "Account deletion will be available in a future update."
            );
          },
        },
      ]
    );
  };

  // Get user's display information
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
    return "Lab Technician";
  };

  const getUserInitials = () => {
    const firstName = user?.user_metadata?.first_name;
    const lastName = user?.user_metadata?.last_name;

    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    if (firstName) {
      return firstName.charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return "U";
  };

  const getUserRole = () => {
    return user?.user_metadata?.role || "Lab Technician";
  };

  const ProfileOption = ({
    icon: Icon,
    title,
    subtitle,
    onPress,
    variant = "default",
  }: {
    icon: any;
    title: string;
    subtitle: string;
    onPress: () => void;
    variant?: "default" | "danger";
  }) => (
    <Card
      style={{
        ...styles.optionCard,
        ...(variant === "danger" && styles.dangerCard),
      }}
    >
      <View style={styles.optionContent}>
        <Icon
          size={24}
          color={variant === "danger" ? colors.error : colors.primary}
          style={styles.optionIcon}
        />
        <View style={styles.optionText}>
          <Text
            style={[
              styles.optionTitle,
              variant === "danger" && styles.dangerText,
            ]}
          >
            {title}
          </Text>
          <Text style={styles.optionSubtitle}>{subtitle}</Text>
        </View>
      </View>
      <Button
        title={variant === "danger" ? "Delete" : "Configure"}
        onPress={onPress}
        variant={variant === "danger" ? "secondary" : "secondary"}
        size="small"
        style={variant === "danger" && { borderColor: colors.error }}
        textStyle={variant === "danger" && { color: colors.error }}
      />
    </Card>
  );

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.userCard}>
          <View style={styles.userHeader}>
            <View style={styles.userAvatar}>
              <Text style={styles.userInitials}>{getUserInitials()}</Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{getUserDisplayName()}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
              <Text style={styles.userRole}>{getUserRole()}</Text>
              <Text style={styles.userSince}>
                Member since {new Date(user.created_at).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </Card>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Settings</Text>

          <ProfileOption
            icon={Mail}
            title="Email Notifications"
            subtitle="Manage email alerts and updates"
            onPress={() =>
              Alert.alert(
                "Coming Soon",
                "Email notification settings will be available soon."
              )
            }
          />

          <ProfileOption
            icon={Bell}
            title="Push Notifications"
            subtitle="Configure app notifications"
            onPress={() =>
              Alert.alert(
                "Coming Soon",
                "Push notification settings will be available soon."
              )
            }
          />

          <ProfileOption
            icon={Shield}
            title="Privacy & Security"
            subtitle="Manage your privacy settings"
            onPress={() =>
              Alert.alert(
                "Coming Soon",
                "Privacy settings will be available soon."
              )
            }
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>

          <ProfileOption
            icon={FileText}
            title="Export Data"
            subtitle="Download your analysis history"
            onPress={handleExportData}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>

          <ProfileOption
            icon={HelpCircle}
            title="Help & Support"
            subtitle="Get help with the app"
            onPress={() =>
              Alert.alert(
                "Help & Support",
                "For support, please contact your laboratory administrator."
              )
            }
          />

          <ProfileOption
            icon={Settings}
            title="App Settings"
            subtitle="Configure app preferences"
            onPress={() =>
              Alert.alert("Coming Soon", "App settings will be available soon.")
            }
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Actions</Text>

          <Button
            title="Sign Out"
            onPress={handleSignOut}
            loading={loading}
            variant="secondary"
            style={styles.signOutButton}
          />

          <ProfileOption
            icon={User}
            title="Delete Account"
            subtitle="Permanently delete your account and data"
            onPress={handleDeleteAccount}
            variant="danger"
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Bacterial Pathogen Analyzer v1.0.0
          </Text>
          <Text style={styles.footerText}>
            Professional diagnostic tool for laboratory use
          </Text>
        </View>
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
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  userCard: {
    marginBottom: spacing.lg,
  },
  userHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  userAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  userInitials: {
    ...typography.heading3,
    color: colors.text,
    fontWeight: "700",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    ...typography.heading3,
    color: colors.text,
  },
  userEmail: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  userRole: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: "600",
    marginTop: spacing.xs,
  },
  userSince: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.heading3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  dangerCard: {
    borderColor: colors.error + "30",
    backgroundColor: colors.error + "05",
  },
  optionContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  optionIcon: {
    marginRight: spacing.md,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: "600",
  },
  dangerText: {
    color: colors.error,
  },
  optionSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  actionCard: {
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  signOutButton: {
    minWidth: 200,
    marginBottom: 16,
  },
  footer: {
    alignItems: "center",
    marginTop: spacing.xxl,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerText: {
    ...typography.caption,
    color: colors.disabled,
    textAlign: "center",
    lineHeight: 20,
  },
});
