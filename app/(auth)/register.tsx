import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { Link, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/context/AuthContext";
import { colors, typography, spacing } from "@/constants/theme";

export default function RegisterScreen() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const { signUp } = useAuth();

  const validateForm = () => {
    const newErrors: {
      firstName?: string;
      lastName?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};

    if (!firstName.trim()) {
      newErrors.firstName = "First name is required";
    } else if (firstName.trim().length < 2) {
      newErrors.firstName = "First name must be at least 2 characters";
    }

    if (!lastName.trim()) {
      newErrors.lastName = "Last name is required";
    } else if (lastName.trim().length < 2) {
      newErrors.lastName = "Last name must be at least 2 characters";
    }

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

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`;
      const { error } = await signUp(email, password, {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        full_name: fullName,
      });

      if (error) {
        Alert.alert(
          "Registration failed",
          error.message || "Could not register"
        );
      } else {
        Alert.alert(
          "Account Created",
          "Please check your email and click the verification link to activate your account."
        );
        router.replace("/(auth)/login");
      }
    } catch (err: any) {
      Alert.alert("Sign Up Error", err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>
              Join the professional network for bacterial pathogen analysis
            </Text>
          </View>
          <ScrollView
            style={styles.formScrollContainer}
            contentContainerStyle={styles.formContent}
          >
            <Card>
              <Text style={styles.cardTitle}>Sign Up</Text>
              <View style={styles.nameRow}>
                <Input
                  label="First Name"
                  value={firstName}
                  onChangeText={setFirstName}
                  autoCapitalize="words"
                  autoComplete="given-name"
                  error={errors.firstName}
                  placeholder="First name"
                  containerStyle={styles.nameInput}
                />
                <Input
                  label="Last Name"
                  value={lastName}
                  onChangeText={setLastName}
                  autoCapitalize="words"
                  autoComplete="family-name"
                  error={errors.lastName}
                  placeholder="Last name"
                  containerStyle={styles.nameInput}
                />
              </View>
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
                autoComplete="new-password"
                error={errors.password}
                placeholder="Create a password"
              />
              <Input
                label="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                showPasswordToggle
                autoComplete="new-password"
                error={errors.confirmPassword}
                placeholder="Confirm your password"
              />
              <Button
                title={loading ? "Creating..." : "Sign Up"}
                onPress={handleSignUp}
                disabled={loading}
              />
              <View style={styles.footer}>
                <Text style={styles.footerText}>
                  Already have an account?{" "}
                  <Link href="/(auth)/login" style={styles.link}>
                    Sign in
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
  nameRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  nameInput: {
    flex: 1,
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
