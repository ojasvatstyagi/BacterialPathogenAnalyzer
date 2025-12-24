
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Linking,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  User,
  Mail,
  Circle as HelpCircle,
  FileText,
  Bell,
  LogOut,
  Moon,
  Shield,
  Trash2,
} from "lucide-react-native";
import * as LocalAuthentication from "expo-local-authentication";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { colors as defaultColors, spacing, typography } from "@/constants/theme";
import { supabase } from "@/lib/supabase";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { ProfileOption } from "@/components/ProfileOption";
import { SectionHeader } from "@/components/SectionHeader";

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { isDark, toggleTheme, colors } = useTheme();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Persistence states (mocked for now, would be in context or async storage in real app)
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);

  // Check initial biometric state
  React.useEffect(() => {
    checkBiometricStatus();
  }, []);

  const checkBiometricStatus = async () => {
    try {
      const stored = await AsyncStorage.getItem("biometric_enabled");
      setIsBiometricEnabled(stored === "true");
    } catch (e) {
      console.error(e);
    }
  };

  const toggleBiometric = async (value: boolean) => {
    try {
      if (value) {
        // Turning on
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();

        if (!hasHardware || !isEnrolled) {
          Alert.alert("Not Available", "Biometric authentication is not available on this device.");
          return;
        }

        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: "Authenticate to enable biometrics",
        });

        if (result.success) {
          setIsBiometricEnabled(true);
          await AsyncStorage.setItem("biometric_enabled", "true");
        }
      } else {
        // Turning off
        setIsBiometricEnabled(false);
        await AsyncStorage.setItem("biometric_enabled", "false");
      }
    } catch (e) {
      Alert.alert("Error", "Failed to toggle biometrics");
    }
  };

  const handleSignOut = async () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          setIsSigningOut(true);
          try {
            await signOut();
            router.replace("/(auth)/login");
          } catch (error) {
            Alert.alert("Error", "Failed to sign out. Please try again.");
          } finally {
            setIsSigningOut(false);
          }
        },
      },
    ]);
  };

  const handleExportData = async () => {
    try {
      setIsExporting(true);
      // Fetch analysis data from Supabase
      const { data: analysisData, error } = await supabase
        .from("analyses")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error("Failed to fetch analysis data: " + error.message);
      }

      // Generate text content for the file
      let fileContent = `Analysis Data Export\n\n`;
      fileContent += `User: ${user?.email}\n`;
      fileContent += `Export Date: ${new Date().toLocaleDateString()}\n\n`;

      if (analysisData?.length === 0) {
        fileContent += "No analysis data found.";
      } else {
        analysisData?.forEach((item, index) => {
          fileContent += `--- Analysis #${index + 1} ---\n`;
          fileContent += `Created At: ${new Date(
            item.created_at
          ).toLocaleString()}\n`;
          fileContent += `Culture Medium: ${item.culture_medium || "N/A"}\n`;
          fileContent += `Result: ${item.result || "N/A"}\n`;
          fileContent += `\n`;
        });
      }

      const fileUri = `${FileSystem.documentDirectory}analysis_data.txt`;
      await FileSystem.writeAsStringAsync(fileUri, fileContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      // Share the file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: "text/plain",
          dialogTitle: "Share Analysis Data",
        });
      } else {
        Alert.alert("Error", "Sharing is not available on this device");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to export data. Please try again.");
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      "Delete Account",
      "This action cannot be undone. All your data will be permanently deleted.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setIsDeleting(true);
            try {
              const { error } = await supabase.rpc("delete_user");
              if (error) {
                throw error;
              }
              Alert.alert("Success", "Your account has been deleted.");
              await signOut();
              router.replace("/(auth)/login");
            } catch (error) {
              Alert.alert(
                "Error",
                "Failed to delete account. Please try again."
              );
            } finally {
              setIsDeleting(false);
            }
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
    const emailInitial = user?.email?.charAt(0).toUpperCase() || "U";

    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name.charAt(0).toUpperCase();
    }
    return emailInitial;
  };

  const getUserRole = () => {
    return user?.user_metadata?.role || "Lab Technician";
  };

  if (!user) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={[styles.userCard, { backgroundColor: colors.surface }]}>
          <View style={styles.userHeader}>
            <View style={[styles.userAvatar, { backgroundColor: colors.primary }]}>
              <Text style={styles.userInitials}>{getUserInitials()}</Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={[styles.userName, { color: colors.text }]}>{getUserDisplayName()}</Text>
              <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{user.email}</Text>
              <Text style={[styles.userRole, { color: colors.primary }]}>{getUserRole()}</Text>
            </View>
          </View>
        </Card>

        <View style={styles.section}>
          <SectionHeader title="Appearance" />
          <ProfileOption
            icon={Moon}
            title="Dark Mode"
            subtitle="Switch between light and dark themes"
            variant="switch"
            value={isDark}
            onValueChange={toggleTheme}
          />
        </View>

        <View style={styles.section}>
          <SectionHeader title="Account Settings" />

          <ProfileOption
            icon={User}
            title="Edit Profile"
            subtitle="Update your name and password"
            buttonTitle="Edit"
            onPress={() => router.push("/(tabs)/profile/edit-profile")}
          />

          <Text> Comming soon.....</Text>
          <ProfileOption
            icon={Mail}
            title="Email Notifications"
            subtitle="Manage email alerts and updates"
            variant="switch"
            value={emailNotifs}
            onValueChange={setEmailNotifs}
          />

          <ProfileOption
            icon={Bell}
            title="Push Notifications"
            subtitle="Configure app notifications"
            variant="switch"
            value={pushNotifs}
            onValueChange={setPushNotifs}
          />
        </View>

        <View style={styles.section}>
          <SectionHeader title="Security" />
          <ProfileOption
            icon={Shield}
            title="Biometric Login"
            subtitle="Enable FaceID / TouchID"
            variant="switch"
            value={isBiometricEnabled}
            onValueChange={toggleBiometric}
          />
        </View>

        <View style={styles.section}>
          <SectionHeader title="Data Management" />

          <ProfileOption
            icon={FileText}
            title="Export Data"
            buttonTitle="Export"
            subtitle="Download your analysis history"
            onPress={handleExportData}
            loading={isExporting}
          />

          <ProfileOption
            icon={HelpCircle}
            title="Help & Support"
            buttonTitle="Mail Us"
            subtitle="Get help with the app"
            onPress={() => Linking.openURL("mailto:ojastyagi753@gmail.com")}
          />
        </View>

        <View style={styles.section}>
          <SectionHeader title="Account Actions" />

          <Button
            title="Sign Out"
            onPress={handleSignOut}
            loading={isSigningOut}
            variant="secondary"
            style={styles.signOutButton}
            icon={<LogOut size={20} color={colors.text} />}
          />

          <ProfileOption
            icon={Trash2}
            title="Delete Account"
            subtitle="Permanently delete your account"
            onPress={handleDeleteAccount}
            variant="danger"
            loading={isDeleting}
          />
        </View>

        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          <Text style={[styles.footerText, { color: colors.disabled }]}>
            Bacterial Pathogen Analyzer v1.0.0
          </Text>
        </View>
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    ...typography.body,
  },
  userCard: {
    marginBottom: spacing.lg,
  },
  userHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.xs,
  },
  userAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  userInitials: {
    ...typography.heading3,
    color: "#000", // Initials should probably be dark on the lime background? Or white? "text" usually.
    fontWeight: "700",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    ...typography.heading3,
  },
  userEmail: {
    ...typography.body,
    marginTop: spacing.xs,
  },
  userRole: {
    ...typography.caption,
    fontWeight: "600",
    marginTop: spacing.xs,
  },
  section: {
    marginBottom: spacing.lg,
  },
  signOutButton: {
    marginBottom: 16,
    width: "100%",
  },
  footer: {
    alignItems: "center",
    marginTop: spacing.xxl,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
  },
  footerText: {
    ...typography.caption,
    textAlign: "center",
    lineHeight: 20,
  },
});
