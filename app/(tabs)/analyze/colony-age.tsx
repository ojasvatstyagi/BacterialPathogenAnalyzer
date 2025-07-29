import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Platform,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Clock, Image as ImageIcon } from "lucide-react-native";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { TopBar } from "@/components/ui/TopBar";
import { colors, typography, spacing } from "@/constants/theme";

const COLONY_AGES = [
  {
    value: "24h",
    label: "24 hours",
    description: "Young colonies, early growth",
  },
  {
    value: "48h",
    label: "48 hours",
    description: "Mature colonies, optimal for analysis",
  },
  { value: "72h", label: "72 hours", description: "Well-developed colonies" },
  {
    value: "96h",
    label: "96 hours",
    description: "Older colonies, may show aging effects",
  },
];

export default function ColonyAgeScreen() {
  const params = useLocalSearchParams();
  const [selectedAge, setSelectedAge] = useState<string>("");
  const [analyzing, setAnalyzing] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const characteristics = params.characteristics
    ? JSON.parse(params.characteristics as string)
    : [];
  const medium = params.medium as string;
  const imageUri = params.imageUri as string;

  useEffect(() => {
    // Reset image states when imageUri changes
    setImageError(false);
    setImageLoaded(false);
  }, [imageUri]);

  const handleBack = () => {
    router.back();
  };

  const handleAgeSelection = (age: string) => {
    setSelectedAge(age);
  };

  const analyzeImage = async () => {
    if (!selectedAge) return;

    setAnalyzing(true);
    try {
      router.push({
        pathname: "/(tabs)/analyze/results",
        params: {
          characteristics: JSON.stringify(characteristics),
          medium,
          imageUri,
          colonyAge: selectedAge,
        },
      });
    } catch (error) {
      console.error("Navigation error:", error);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleImageError = (error: any) => {
    console.log("Image failed to load:", imageUri, error);
    setImageError(true);
    setImageLoaded(false);
  };

  const handleImageLoad = () => {
    console.log("Image loaded successfully:", imageUri);
    setImageLoaded(true);
    setImageError(false);
  };

  // Function to get a properly formatted image URI
  const getImageSource = () => {
    if (!imageUri) return null;

    // For web platform, we might need to handle blob URLs differently
    if (Platform.OS === "web" && imageUri.startsWith("blob:")) {
      return { uri: imageUri };
    }

    // For file:// URIs, ensure they're properly formatted
    if (imageUri.startsWith("file://")) {
      return { uri: imageUri };
    }

    // For other URIs, return as-is
    return { uri: imageUri };
  };

  const imageSource = getImageSource();

  return (
    <SafeAreaView style={styles.container}>
      <TopBar title="Colony Age" subtitle="Step 4 of 4" onBack={handleBack} />

      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.instructionCard}>
          <View style={styles.instructionHeader}>
            <View style={styles.iconContainer}>
              <Clock size={32} color={colors.primary} />
            </View>
            <Text style={styles.instructionTitle}>Select Colony Age</Text>
          </View>
          <Text style={styles.instructionText}>
            Please specify the age of the bacterial colonies in your sample.
            This information helps improve analysis accuracy.
          </Text>
        </Card>

        <Card style={styles.imageCard}>
          <Text style={styles.imageTitle}>Captured Sample</Text>

          {imageSource && !imageError ? (
            <View style={styles.imageContainer}>
              <Image
                source={imageSource}
                style={[
                  styles.sampleImage,
                  !imageLoaded && styles.imageLoading,
                ]}
                onError={handleImageError}
                onLoad={handleImageLoad}
                onLoadStart={() => setImageLoaded(false)}
                resizeMode="cover"
              />
              {!imageLoaded && !imageError && (
                <View style={styles.loadingOverlay}>
                  <Text style={styles.loadingText}>Loading image...</Text>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.imagePlaceholder}>
              <ImageIcon size={48} color={colors.disabled} />
              <Text style={styles.imagePlaceholderText}>
                {imageError
                  ? "Failed to load captured image"
                  : "No image available"}
              </Text>
              {imageError && imageUri && (
                <View style={styles.errorDetails}>
                  <Text style={styles.imageUriText}>
                    URI:{" "}
                    {imageUri.length > 60
                      ? `${imageUri.substring(0, 60)}...`
                      : imageUri}
                  </Text>
                  <Text style={styles.errorHint}>
                    {Platform.OS === "web"
                      ? "Web platform image loading issue"
                      : "Image file may be corrupted"}
                  </Text>
                </View>
              )}
            </View>
          )}
        </Card>

        <Card style={styles.ageSelectionCard}>
          <Text style={styles.sectionTitle}>Colony Age Options</Text>

          <View style={styles.ageOptions}>
            {COLONY_AGES.map((age) => (
              <View key={age.value} style={styles.ageOptionContainer}>
                <Button
                  title=""
                  onPress={() => handleAgeSelection(age.value)}
                  variant={selectedAge === age.value ? "primary" : "outline"}
                  style={{
                    ...styles.ageOptionButton,
                    ...(selectedAge === age.value && styles.selectedAgeButton),
                  }}
                />
                <View
                  style={[
                    styles.ageOptionContent,
                    selectedAge === age.value && styles.selectedAgeContent,
                  ]}
                >
                  <View style={styles.ageOptionHeader}>
                    <View
                      style={[
                        styles.radioButton,
                        selectedAge === age.value && styles.radioButtonSelected,
                      ]}
                    >
                      {selectedAge === age.value && (
                        <View style={styles.radioButtonInner} />
                      )}
                    </View>
                    <Text
                      style={[
                        styles.ageOptionLabel,
                        selectedAge === age.value && styles.selectedAgeLabel,
                      ]}
                    >
                      {age.label}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.ageOptionDescription,
                      selectedAge === age.value &&
                        styles.selectedAgeDescription,
                    ]}
                  >
                    {age.description}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {selectedAge && (
            <View style={styles.selectedInfo}>
              <Text style={styles.selectedText}>
                Selected:{" "}
                {COLONY_AGES.find((age) => age.value === selectedAge)?.label}
              </Text>
            </View>
          )}
        </Card>

        <Card style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Analysis Summary</Text>

          <View style={styles.summarySection}>
            <Text style={styles.summaryLabel}>Characteristics:</Text>
            <View style={styles.characteristicsList}>
              {characteristics.map((characteristic: string, index: number) => (
                <View key={index} style={styles.characteristicItem}>
                  <View style={styles.checkmark} />
                  <Text style={styles.characteristicText}>
                    {characteristic}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.summarySection}>
            <Text style={styles.summaryLabel}>Culture Medium:</Text>
            <Text style={styles.summaryValue}>{medium}</Text>
          </View>

          {selectedAge && (
            <View style={styles.summarySection}>
              <Text style={styles.summaryLabel}>Colony Age:</Text>
              <Text style={styles.summaryValue}>
                {COLONY_AGES.find((age) => age.value === selectedAge)?.label}
              </Text>
            </View>
          )}
        </Card>

        <Button
          title="Analyze Image"
          onPress={analyzeImage}
          disabled={!selectedAge}
          loading={analyzing}
          style={styles.analyzeButton}
        />
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
  instructionCard: {
    marginBottom: spacing.lg,
    alignItems: "center",
  },
  instructionHeader: {
    alignItems: "center",
    marginBottom: spacing.md,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary + "15",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  instructionTitle: {
    ...typography.heading2,
    color: colors.text,
    textAlign: "center",
  },
  instructionText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
  },
  imageCard: {
    marginBottom: spacing.lg,
    alignItems: "center",
  },
  imageTitle: {
    ...typography.heading3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  imageContainer: {
    position: "relative",
    width: 200,
    height: 200,
  },
  sampleImage: {
    width: 200,
    height: 200,
    borderRadius: spacing.md,
    borderWidth: 2,
    borderColor: colors.border,
  },
  imageLoading: {
    opacity: 0.5,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: spacing.md,
  },
  loadingText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  imagePlaceholder: {
    width: 200,
    height: 200,
    borderRadius: spacing.md,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
    padding: spacing.md,
  },
  imagePlaceholderText: {
    ...typography.caption,
    color: colors.disabled,
    marginTop: spacing.sm,
    textAlign: "center",
    fontWeight: "600",
  },
  errorDetails: {
    marginTop: spacing.sm,
    alignItems: "center",
  },
  imageUriText: {
    ...typography.caption,
    color: colors.error,
    marginTop: spacing.xs,
    fontSize: 10,
    textAlign: "center",
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  errorHint: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    fontSize: 10,
    textAlign: "center",
    fontStyle: "italic",
  },
  ageSelectionCard: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.heading3,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  ageOptions: {
    gap: spacing.sm,
  },
  ageOptionContainer: {
    position: "relative",
  },
  ageOptionButton: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0,
    zIndex: 1,
  },
  selectedAgeButton: {
    backgroundColor: colors.primary + "20",
  },
  ageOptionContent: {
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.sm,
    backgroundColor: colors.surface,
  },
  selectedAgeContent: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + "08",
  },
  ageOptionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
    marginRight: spacing.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  radioButtonSelected: {
    borderColor: colors.primary,
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  ageOptionLabel: {
    ...typography.body,
    color: colors.text,
    fontWeight: "600",
  },
  selectedAgeLabel: {
    color: colors.primary,
  },
  ageOptionDescription: {
    ...typography.caption,
    color: colors.textSecondary,
    marginLeft: 32,
  },
  selectedAgeDescription: {
    color: colors.text,
  },
  selectedInfo: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.primary + "10",
    borderRadius: spacing.sm,
    borderWidth: 1,
    borderColor: colors.primary + "30",
  },
  selectedText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: "600",
    textAlign: "center",
  },
  summaryCard: {
    marginBottom: spacing.lg,
    backgroundColor: colors.primary + "08",
    borderWidth: 1,
    borderColor: colors.primary + "20",
  },
  summaryTitle: {
    ...typography.heading3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  summarySection: {
    marginBottom: spacing.sm,
  },
  summaryLabel: {
    ...typography.body,
    color: colors.text,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  characteristicsList: {
    gap: spacing.xs,
    marginLeft: spacing.sm,
  },
  characteristicItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkmark: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginRight: spacing.sm,
  },
  characteristicText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  summaryValue: {
    ...typography.body,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
  analyzeButton: {
    marginTop: spacing.md,
  },
});
