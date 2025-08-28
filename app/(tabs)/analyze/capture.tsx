import React, { useState, useRef } from "react";
import { View, Text, StyleSheet, Alert, Image, Platform } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { decode } from "base64-arraybuffer";
import "react-native-url-polyfill/auto";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import {
  Camera,
  Upload,
  RotateCcw,
  Image as ImageIcon,
} from "lucide-react-native";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { TopBar } from "@/components/ui/TopBar";
import { colors, typography, spacing } from "@/constants/theme";

export default function CaptureScreen() {
  const params = useLocalSearchParams();
  const { user } = useAuth();
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  const characteristics = params.characteristics
    ? JSON.parse(params.characteristics as string)
    : [];
  const medium = params.medium as string;

  const handleBack = () => {
    router.back();
  };

  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  const takePicture = async () => {
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });

      if (photo) {
        setCapturedImage(photo.uri);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to capture image. Please try again.");
    }
  };

  const pickImage = async () => {
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

      const base64 = await FileSystem.readAsStringAsync(capturedImage, {
        encoding: "base64",
      });
      const arrayBuffer = decode(base64);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("colony-images")
        .upload(fileName, arrayBuffer, {
          contentType,
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: urlData, error: urlError } = await supabase.storage
        .from("colony-images")
        .createSignedUrl(fileName, 60 * 60); // 1 hour expiry

      if (urlError) {
        throw urlError;
      }

      router.push({
        pathname: "/(tabs)/analyze/colony-age",
        params: {
          characteristics: JSON.stringify(characteristics),
          medium,
          imageUri: urlData.signedUrl,
        },
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An unknown error occurred during upload.";
      Alert.alert("Upload Error", `Failed to upload image: ${errorMessage}`, [
        { text: "OK" },
      ]);
      console.error(
        "Detailed upload error:",
        JSON.stringify(error, Object.getOwnPropertyNames(error), 2)
      );
    } finally {
      setUploading(false);
    }
  };

  if (!permission) {
    return (
      <SafeAreaView style={styles.container}>
        <TopBar
          title="Capture Image"
          subtitle="Step 3 of 4"
          onBack={handleBack}
        />
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>Loading camera...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <TopBar
          title="Capture Image"
          subtitle="Step 3 of 4"
          onBack={handleBack}
        />
        <View style={styles.permissionContainer}>
          <Card style={styles.permissionCard}>
            <View style={styles.iconContainer}>
              <Camera size={48} color={colors.primary} />
            </View>
            <Text style={styles.permissionTitle}>Camera Access Required</Text>
            <Text style={styles.permissionText}>
              We need access to your camera to capture images of bacterial
              colonies for analysis.
            </Text>
            <Button
              title="Grant Camera Permission"
              onPress={requestPermission}
              style={styles.permissionButton}
            />
            <Button
              title="Select from Gallery Instead"
              onPress={pickImage}
              variant="secondary"
              style={styles.galleryAlternativeButton}
            />
          </Card>
        </View>
      </SafeAreaView>
    );
  }

  if (capturedImage) {
    return (
      <SafeAreaView style={styles.container}>
        <TopBar
          title="Review Image"
          subtitle="Step 3 of 4"
          onBack={handleBack}
        />

        <View style={styles.previewContainer}>
          <Image source={{ uri: capturedImage }} style={styles.previewImage} />

          <Card style={styles.previewActions}>
            <Text style={styles.previewTitle}>Image Captured Successfully</Text>
            <Text style={styles.previewText}>
              Review your image and proceed to specify colony age, or retake if
              needed.
            </Text>

            <View style={styles.actionButtons}>
              <Button
                title="Retake"
                onPress={retakePhoto}
                variant="secondary"
                style={styles.actionButton}
              />
              <Button
                title="Next: Colony Age"
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
    <SafeAreaView style={styles.container}>
      <TopBar
        title="Capture Image"
        subtitle="Step 3 of 4"
        onBack={handleBack}
      />

      <View style={styles.cameraContainer}>
        {Platform.OS === "web" ? (
          <View style={styles.webPlaceholder}>
            <View style={styles.iconContainer}>
              <Camera size={64} color={colors.disabled} />
            </View>
            <Text style={styles.webPlaceholderText}>
              Camera not available in web browser
            </Text>
            <Button
              title="Select Image from Gallery"
              onPress={pickImage}
              style={styles.galleryButton}
            />
          </View>
        ) : (
          <CameraView ref={cameraRef} style={styles.camera} facing={facing}>
            <View style={styles.cameraOverlay}>
              <View style={styles.cameraTop}>
                <Card style={styles.infoCard}>
                  <Text style={styles.infoText}>
                    Position bacterial colonies in the center of the frame
                  </Text>
                </Card>
              </View>

              <View style={styles.cameraBottom}>
                {/* Gallery Button */}
                <View style={styles.controlButton}>
                  <View style={styles.buttonWrapper}>
                    <Button
                      title=""
                      onPress={pickImage}
                      variant="secondary"
                      style={styles.sideButton}
                    />
                    <View style={styles.buttonIcon}>
                      <ImageIcon size={20} color={colors.text} />
                    </View>
                  </View>
                  <Text style={styles.buttonLabel}>Gallery</Text>
                </View>

                {/* Capture Button */}
                <View style={styles.captureButtonContainer}>
                  <View style={styles.captureWrapper}>
                    <Button
                      title=""
                      onPress={takePicture}
                      style={styles.captureButton}
                    />
                    <View style={styles.captureIcon}>
                      <Camera size={28} color={colors.text} />
                    </View>
                  </View>
                  <Text style={styles.captureLabel}>Capture</Text>
                </View>

                {/* Flip Camera Button */}
                <View style={styles.controlButton}>
                  <View style={styles.buttonWrapper}>
                    <Button
                      title=""
                      onPress={toggleCameraFacing}
                      variant="secondary"
                      style={styles.sideButton}
                    />
                    <View style={styles.buttonIcon}>
                      <RotateCcw size={20} color={colors.text} />
                    </View>
                  </View>
                  <Text style={styles.buttonLabel}>Flip</Text>
                </View>
              </View>
            </View>
          </CameraView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    padding: spacing.lg,
  },
  permissionCard: {
    alignItems: "center",
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary + "15",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  permissionTitle: {
    ...typography.heading2,
    color: colors.text,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  permissionText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: spacing.lg,
    lineHeight: 24,
  },
  permissionButton: {
    minWidth: 200,
    marginBottom: spacing.md,
  },
  galleryAlternativeButton: {
    minWidth: 200,
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: "transparent",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  cameraTop: {
    flex: 1,
    justifyContent: "flex-start",
  },
  infoCard: {
    alignSelf: "center",
    maxWidth: 300,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
  },
  infoText: {
    ...typography.caption,
    color: colors.text,
    textAlign: "center",
  },
  cameraBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingBottom: spacing.xl,
  },
  controlButton: {
    alignItems: "center",
  },
  buttonWrapper: {
    position: "relative",
    width: 56,
    height: 56,
  },
  sideButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  buttonIcon: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    pointerEvents: "none",
  },
  buttonLabel: {
    ...typography.caption,
    color: colors.surface,
    marginTop: spacing.xs,
    fontWeight: "600",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  captureButtonContainer: {
    alignItems: "center",
  },
  captureWrapper: {
    position: "relative",
    width: 80,
    height: 80,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    borderWidth: 4,
    borderColor: "rgba(255, 255, 255, 0.8)",
  },
  captureIcon: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    pointerEvents: "none",
  },
  captureLabel: {
    ...typography.caption,
    color: colors.surface,
    marginTop: spacing.xs,
    fontWeight: "700",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  webPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  webPlaceholderText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  galleryButton: {
    minWidth: 200,
  },
  previewContainer: {
    flex: 1,
    padding: spacing.lg,
  },
  previewImage: {
    flex: 1,
    borderRadius: spacing.md,
    marginBottom: spacing.lg,
  },
  previewActions: {
    alignItems: "center",
  },
  previewTitle: {
    ...typography.heading3,
    color: colors.text,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  previewText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  actionButtons: {
    flexDirection: "row",
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
    minWidth: 120,
  },
});
