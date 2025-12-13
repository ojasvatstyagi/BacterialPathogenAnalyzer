
import React, { useState } from "react";
import { View, Text, StyleSheet, Alert, Image, Platform } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";

import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { Camera, Image as ImageIcon } from "lucide-react-native";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { TopBar } from "@/components/ui/TopBar";
import { useTheme } from "@/context/ThemeContext";
import { typography, spacing } from "@/constants/theme";

export default function CaptureScreen() {
  const { colors } = useTheme();
  const params = useLocalSearchParams();
  const { user } = useAuth();
  const [cameraPermission, requestCameraPermission] = ImagePicker.useCameraPermissions();

  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const characteristics = params.characteristics
    ? JSON.parse(params.characteristics as string)
    : [];
  const cultureMedium = params.cultureMedium as string;

  const handleBack = () => {
    router.back();
  };

  const takePicture = async () => {
    try {
      if (!cameraPermission?.granted) {
        const permissionResult = await requestCameraPermission();
        if (!permissionResult.granted) {
          Alert.alert("Permission Required", "Camera access is needed to take photos.");
          return;
        }
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setCapturedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Camera error:", error);
      Alert.alert("Error", "Failed to launch camera.");
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission needed",
          "Camera roll permission is required to select images."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setCapturedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Gallery error:", error);
      Alert.alert("Error", "Failed to open gallery.");
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
  };

  const proceedToAgeSelection = async () => {
    if (!capturedImage || !user) return;

    setUploading(true);

    try {
      const fileName = `${user.id}/${Date.now()}.jpg`;
      const contentType = "image/jpeg";

      const base64Data = await FileSystem.readAsStringAsync(capturedImage, {
        encoding: "base64",
      });

      const rawData = decode(base64Data);

      const { error: uploadError } = await supabase.storage
        .from("colony-images")
        .upload(fileName, rawData, {
          contentType,
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: urlData, error: urlError } = await supabase.storage
        .from("colony-images")
        .createSignedUrl(fileName, 60 * 60);

      if (urlError) {
        throw urlError;
      }

      router.push({
        pathname: "/analyze/colony-age",
        params: {
          characteristics: JSON.stringify(characteristics),
          cultureMedium,
          imageUri: urlData.signedUrl,
        },
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An unknown error occurred during upload.";
      Alert.alert(
        "Upload Error",
        `Failed to upload image: ${errorMessage}. Please try again.`,
        [{ text: "OK" }]
      );
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
    }
  };

  const decode = (base64: string): Uint8Array => {
    if (typeof atob === "function") {
      return Uint8Array.from(atob(base64), c => c.charCodeAt(0));
    }
    return new Uint8Array(0);
  };

  if (capturedImage) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <TopBar
          title="Review Image"
          subtitle="Step 3 of 4"
          onBack={handleBack}
        />

        <View style={styles.previewContainer}>
          <Image source={{ uri: capturedImage }} style={styles.previewImage} />

          <Card style={styles.previewActions}>
            <Text style={[styles.previewTitle, { color: colors.text }]}>Image Captured</Text>
            <Text style={[styles.previewText, { color: colors.textSecondary }]}>
              Review your cropped image. Position colonies clearly in the center.
            </Text>

            <View style={styles.actionButtons}>
              <Button
                title="Retake"
                onPress={retakePhoto}
                variant="secondary"
                disabled={uploading}
                style={styles.actionButton}
              />
              <Button
                title="Next Step"
                onPress={proceedToAgeSelection}
                loading={uploading}
                style={styles.actionButton}
              />
            </View>
          </Card>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar
        title="Capture Image"
        subtitle="Step 3 of 4"
        onBack={handleBack}
      />

      <View style={styles.landingContainer}>
        <View style={[styles.iconContainer, { backgroundColor: colors.primary + "10" }]}>
          <Camera size={64} color={colors.primary} />
        </View>

        <Text style={[styles.landingTitle, { color: colors.text }]}>Take a Photo</Text>
        <Text style={[styles.landingText, { color: colors.textSecondary }]}>
          Capture a clear photo of the bacterial colony. You will be able to crop the image after taking it.
        </Text>

        <Card style={styles.optionsCard}>
          <Button
            title="Open Camera"
            onPress={takePicture}
            icon={<Camera size={20} color="#fff" />}
            style={styles.mainButton}
          />

          <View style={styles.orDivider}>
            <View style={[styles.line, { backgroundColor: colors.border }]} />
            <Text style={[styles.orText, { color: colors.textSecondary }]}>OR</Text>
            <View style={[styles.line, { backgroundColor: colors.border }]} />
          </View>

          <Button
            title="Select from Gallery"
            onPress={pickImage}
            variant="secondary"
            icon={<ImageIcon size={20} color={colors.primary} />}
            style={styles.mainButton}
          />
        </Card>
      </View>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  landingContainer: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xl,
  },
  landingTitle: {
    ...typography.heading2,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  landingText: {
    ...typography.body,
    textAlign: 'center',
    marginBottom: spacing.xl,
    maxWidth: 300,
  },
  optionsCard: {
    width: '100%',
    maxWidth: 340,
    padding: spacing.lg,
  },
  mainButton: {
    width: '100%',
  },
  orDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  line: {
    flex: 1,
    height: 1,
  },
  orText: {
    marginHorizontal: spacing.md,
    fontSize: 12,
    fontWeight: '600',
  },
  previewContainer: {
    flex: 1,
    padding: spacing.lg,
  },
  previewImage: {
    flex: 1,
    borderRadius: spacing.md,
    marginBottom: spacing.lg,
    backgroundColor: "#f0f0f0",
  },
  previewActions: {
    alignItems: "center",
  },
  previewTitle: {
    ...typography.heading3,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  previewText: {
    ...typography.body,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  actionButtons: {
    flexDirection: "row",
    gap: spacing.md,
    width: '100%',
  },
  actionButton: {
    flex: 1,
  },
});

