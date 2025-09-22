import React, { useState } from "react";
import { View, Text, StyleSheet, Alert, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { colors, typography, spacing } from "@/constants/theme";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function EditProfileScreen() {
  const { user } = useAuth();
  const [fullName, setFullName] = useState(
    user?.user_metadata?.full_name || ""
  );
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleUpdateProfile = async () => {
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    setIsSaving(true);
    try {
      // Update user metadata (full name)
      const { data, error: metaError } = await supabase.auth.updateUser({
        data: { full_name: fullName },
      });

      if (metaError) {
        throw metaError;
      }

      // Update password if a new one is provided
      if (password) {
        const { error: passwordError } = await supabase.auth.updateUser({
          password: password,
        });
        if (passwordError) {
          throw passwordError;
        }
      }

      Alert.alert("Success", "Profile updated successfully.");
      router.back();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.card}>
          <Text style={styles.title}>Edit Profile</Text>
          <Input
            label="Full Name"
            value={fullName}
            onChangeText={setFullName}
            placeholder="Enter your full name"
            autoCapitalize="words"
          />
          <Input
            label="New Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Leave blank to keep current password"
            secureTextEntry
            showPasswordToggle
          />
          <Input
            label="Confirm New Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm your new password"
            secureTextEntry
            showPasswordToggle
          />
          <Button
            title="Save Changes"
            onPress={handleUpdateProfile}
            loading={isSaving}
            style={styles.button}
          />
          <Button
            title="Back to Profile"
            variant="secondary"
            onPress={() => router.back()}
            style={styles.button}
          />
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
    justifyContent: "center",
    flexGrow: 1,
  },
  card: {
    padding: spacing.lg,
  },
  title: {
    ...typography.heading2,
    color: colors.text,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  button: {
    marginTop: spacing.md,
  },
});
