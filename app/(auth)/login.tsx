import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import { Link, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/context/AuthContext";
import { colors, typography, spacing } from "@/constants/theme";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );

  const { signIn, signInWithGoogle } = useAuth();

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async () => {
    if (!validateForm()) return;

    setEmailLoading(true);
    try {
      const { error } = await signIn(email, password);
      if (error) {
        Alert.alert("Login Failed", error.message);
      } else {
        router.replace("/(tabs)");
      }
    } catch (error) {
      Alert.alert("Error", "An unexpected error occurred");
    } finally {
      setEmailLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (Platform.OS === "web") {
      Alert.alert(
        "Note",
        "Google sign-in functionality requires native platforms or proper OAuth configuration."
      );
      return;
    }

    setGoogleLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        Alert.alert("Google Sign-in Failed", error.message);
      } else {
        router.replace("/(tabs)");
      }
    } catch (error) {
      Alert.alert("Error", "An unexpected error occurred");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Bacterial Pathogen Analyzer</Text>
          <Text style={styles.subtitle}>
            Professional diagnostic tool for Burkholderia pseudomallei
            identification
          </Text>
        </View>

        <Card>
          <Text style={styles.cardTitle}>Sign In</Text>

          <Input
            label="Email Address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            error={errors.email}
            placeholder="Enter your email"
          />

          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            showPasswordToggle
            autoComplete="password"
            error={errors.password}
            placeholder="Enter your password"
          />

          <Button
            title="Sign In"
            onPress={handleSignIn}
            loading={emailLoading}
            style={styles.signInButton}
          />

          <Button
            title="Sign in with Google"
            onPress={handleGoogleSignIn}
            variant="secondary"
            loading={googleLoading}
            style={styles.googleButton}
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Don't have an account?{" "}
              <Link href="/(auth)/register" style={styles.link}>
                Sign up
              </Link>
            </Text>
          </View>
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: spacing.lg,
  },
  header: {
    alignItems: "center",
    marginBottom: spacing.xxl,
  },
  title: {
    ...typography.heading1,
    color: colors.text,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: "center",
    maxWidth: 300,
  },
  cardTitle: {
    ...typography.heading2,
    color: colors.text,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  signInButton: {
    marginTop: spacing.md,
  },
  googleButton: {
    marginTop: spacing.sm,
  },
  footer: {
    alignItems: "center",
    marginTop: spacing.lg,
  },
  footerText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  link: {
    color: colors.primary,
    fontWeight: "600",
  },
});
