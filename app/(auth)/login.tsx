//app/(auth)/login.tsx

import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  TextInput, // Added for useRef typing
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
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );
  const [formError, setFormError] = useState<string | null>(null);

  // Refs for keyboard focus management
  const passwordRef = useRef<TextInput>(null); // Ref for password input

  const { signIn } = useAuth();

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
    if (!validateForm()) {
      setFormError(null); // Clear form error if field errors exist
      return;
    }

    setFormError(null);
    setLoading(true);
    try {
      const { error } = await signIn(email, password);
      if (error) {
        setFormError(error.message);
      } else {
        router.replace("/(tabs)");
      }
    } catch (error) {
      setFormError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        // Using "height" for smoother Android behavior
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Bacterial Pathogen Analyzer</Text>
            <Text style={styles.subtitle}>
              Professional diagnostic tool for Burkholderia pseudomallei
              identification
            </Text>
          </View>
          <ScrollView
            style={styles.formScrollContainer}
            contentContainerStyle={styles.formContent}
            keyboardShouldPersistTaps="handled" // Ensures keyboard doesn't dismiss easily
          >
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
                // Focus management
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
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
                // Focus management
                ref={passwordRef}
                returnKeyType="go"
                onSubmitEditing={handleSignIn}
              />
              <Button
                title="Sign In"
                onPress={handleSignIn}
                loading={loading}
                style={styles.signInButton}
              />
              {/* Smoother Error Handling: Display form error here */}
              {formError && <Text style={styles.errorText}>{formError}</Text>}
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
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
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
  formScrollContainer: {
    flexGrow: 0,
    flexShrink: 1,
  },
  formContent: {
    justifyContent: "center",
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
  errorText: {
    ...typography.body,
    color: colors.error,
    textAlign: "center",
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
});
