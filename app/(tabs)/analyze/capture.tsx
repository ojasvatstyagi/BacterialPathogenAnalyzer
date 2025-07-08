import React, { useState, useRef } from "react";
import { View, Text, StyleSheet, Alert, Image, Platform } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { ArrowLeft, Camera, Upload, RotateCcw } from "lucide-react-native";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { colors, typography, spacing } from "@/constants/theme";

export default function CaptureScreen() {
  const params = useLocalSearchParams();
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

  const analyzeImage = async () => {
    if (!capturedImage) return;

    setUploading(true);
    try {
      // In a real app, you would upload the image to Supabase storage here
      // For now, we'll just proceed to results with the local URI

      router.push({
        pathname: "/(tabs)/analyze/results",
        params: {
          characteristics: JSON.stringify(characteristics),
          medium,
          imageUri: capturedImage,
        },
      });
    } catch (error) {
      Alert.alert("Error", "Failed to process image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  if (!permission) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>Loading camera...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Card style={styles.permissionCard}>
            <Camera
              size={48}
              color={colors.primary}
              style={styles.permissionIcon}
            />
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
          </Card>
        </View>
      </SafeAreaView>
    );
  }

  if (capturedImage) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Button
            title=""
            onPress={handleBack}
            variant="outline"
            style={styles.backButton}
          />
          <Text style={styles.headerTitle}>Review Image</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.previewContainer}>
          <Image source={{ uri: capturedImage }} style={styles.previewImage} />

          <Card style={styles.previewActions}>
            <Text style={styles.previewTitle}>Image Captured Successfully</Text>
            <Text style={styles.previewText}>
              Review your image and proceed with analysis, or retake if needed.
            </Text>

            <View style={styles.actionButtons}>
              <Button
                title="Retake"
                onPress={retakePhoto}
                variant="outline"
                style={styles.actionButton}
              />
              <Button
                title="Analyze Image"
                onPress={analyzeImage}
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
      <View style={styles.header}>
        <Button
          title=""
          onPress={handleBack}
          variant="outline"
          style={styles.backButton}
        />
        <Text style={styles.headerTitle}>Capture Image</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.cameraContainer}>
        {Platform.OS === "web" ? (
          <View style={styles.webPlaceholder}>
            <Camera size={64} color={colors.disabled} />
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
                <Button
                  title=""
                  onPress={pickImage}
                  variant="outline"
                  style={styles.galleryButtonSmall}
                />

                <Button
                  title=""
                  onPress={takePicture}
                  style={styles.captureButton}
                />

                <Button
                  title=""
                  onPress={toggleCameraFacing}
                  variant="outline"
                  style={styles.flipButton}
                />
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    padding: 0,
  },
  headerTitle: {
    ...typography.heading3,
    color: colors.text,
  },
  headerSpacer: {
    width: 40,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    padding: spacing.lg,
  },
  permissionCard: {
    alignItems: "center",
  },
  permissionIcon: {
    marginBottom: spacing.md,
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
  },
  infoText: {
    ...typography.caption,
    color: colors.text,
    textAlign: "center",
  },
  cameraBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: spacing.lg,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
  },
  galleryButtonSmall: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  flipButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
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
