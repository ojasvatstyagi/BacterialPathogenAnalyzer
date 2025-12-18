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
import { useTheme } from "@/context/ThemeContext";
import { typography, spacing } from "@/constants/theme";

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
  const { colors } = useTheme();
  const params = useLocalSearchParams();
  const [selectedAge, setSelectedAge] = useState<string>("");
  const [analyzing, setAnalyzing] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const characteristics = params.characteristics
    ? JSON.parse(params.characteristics as string)
    : [];
  const cultureMedium = params.cultureMedium as string;
  const imageUri = params.imageUri as string;

  useEffect(() => {
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
          cultureMedium,
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
    setImageLoaded(true);
    setImageError(false);
  };

  const getImageSource = () => {
    if (!imageUri) return null;
    if (Platform.OS === "web" && imageUri.startsWith("blob:")) {
      return { uri: imageUri };
    }
    if (imageUri.startsWith("file://")) {
      return { uri: imageUri };
    }
    return { uri: imageUri };
  };

  const imageSource = getImageSource();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar title="Colony Age" subtitle="Step 4 of 4" onBack={handleBack} />

      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.instructionCard}>
          <View style={styles.instructionHeader}>
            <View style={[styles.iconContainer, { backgroundColor: colors.primary + "15" }]}>
              <Clock size={32} color={colors.primary} />
            </View>
            <Text style={[styles.instructionTitle, { color: colors.text }]}>Select Colony Age</Text>
          </View>
          <Text style={[styles.instructionText, { color: colors.textSecondary }]}>
            Please specify the age of the bacterial colonies in your sample.
            This information helps improve analysis accuracy.
          </Text>
        </Card>

        <Card style={styles.imageCard}>
          <Text style={[styles.imageTitle, { color: colors.text }]}>Captured Sample</Text>

          {imageSource && !imageError ? (
            <View style={styles.imageContainer}>
              <Image
                source={imageSource}
                style={[
                  styles.sampleImage,
                  { borderColor: colors.border },
                  !imageLoaded && styles.imageLoading,
                ]}
                onError={handleImageError}
                onLoad={handleImageLoad}
                onLoadStart={() => setImageLoaded(false)}
                resizeMode="cover"
              />
              {!imageLoaded && !imageError && (
                <View style={[styles.loadingOverlay, { backgroundColor: colors.background, opacity: 0.8 }]}>
                  <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading image...</Text>
                </View>
              )}
            </View>
          ) : (
            <View style={[styles.imagePlaceholder, { borderColor: colors.border, backgroundColor: colors.background }]}>
              <ImageIcon size={48} color={colors.disabled} />
              <Text style={[styles.imagePlaceholderText, { color: colors.disabled }]}>
                {imageError
                  ? "Failed to load captured image"
                  : "No image available"}
              </Text>
              {imageError && imageUri && (
                <View style={styles.errorDetails}>
                  <Text style={[styles.imageUriText, { color: colors.error }]}>
                    URI:{" "}
                    {imageUri.length > 60
                      ? `${imageUri.substring(0, 60)}...`
                      : imageUri}
                  </Text>
                  <Text style={[styles.errorHint, { color: colors.textSecondary }]}>
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
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Colony Age Options</Text>

          <View style={styles.ageOptions}>
            {COLONY_AGES.map((age) => (
              <View key={age.value} style={styles.ageOptionContainer}>
                <Button
                  title=""
                  onPress={() => handleAgeSelection(age.value)}
                  variant={selectedAge === age.value ? "primary" : "outline"}
                  style={{
                    ...styles.ageOptionButton,
                    ...(selectedAge === age.value && { backgroundColor: colors.primary + "20" }),
                  }}
                />
                <View
                  style={[
                    styles.ageOptionContent,
                    {
                      borderColor: colors.border,
                      backgroundColor: colors.surface
                    },
                    selectedAge === age.value && {
                      borderColor: colors.primary,
                      backgroundColor: colors.primary + "08",
                    },
                  ]}
                >
                  <View style={styles.ageOptionHeader}>
                    <View
                      style={[
                        styles.radioButton,
                        { borderColor: colors.border },
                        selectedAge === age.value && { borderColor: colors.primary },
                      ]}
                    >
                      {selectedAge === age.value && (
                        <View style={[styles.radioButtonInner, { backgroundColor: colors.primary }]} />
                      )}
                    </View>
                    <Text
                      style={[
                        styles.ageOptionLabel,
                        { color: colors.text },
                        selectedAge === age.value && { color: colors.primary },
                      ]}
                    >
                      {age.label}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.ageOptionDescription,
                      { color: colors.textSecondary },
                      selectedAge === age.value && { color: colors.text },
                    ]}
                  >
                    {age.description}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {selectedAge && (
            <View style={[styles.selectedInfo, { backgroundColor: colors.primary + "10", borderColor: colors.primary + "30" }]}>
              <Text style={[styles.selectedText, { color: colors.primary }]}>
                Selected:{" "}
                {COLONY_AGES.find((age) => age.value === selectedAge)?.label}
              </Text>
            </View>
          )}
        </Card>

        <Card style={[styles.summaryCard, { backgroundColor: colors.primary + "08", borderColor: colors.primary + "20" }]}>
          <Text style={[styles.summaryTitle, { color: colors.text }]}>Analysis Summary</Text>

          <View style={styles.summarySection}>
            <Text style={[styles.summaryLabel, { color: colors.text }]}>Characteristics:</Text>
            <View style={styles.characteristicsList}>
              {characteristics.map((characteristic: string, index: number) => (
                <View key={index} style={styles.characteristicItem}>
                  <View style={[styles.checkmark, { backgroundColor: colors.primary }]} />
                  <Text style={[styles.characteristicText, { color: colors.textSecondary }]}>
                    {characteristic}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.summarySection}>
            <Text style={[styles.summaryLabel, { color: colors.text }]}>Culture Medium:</Text>
            <Text style={[styles.summaryValue, { color: colors.textSecondary }]}>{cultureMedium}</Text>
          </View>

          {selectedAge && (
            <View style={styles.summarySection}>
              <Text style={[styles.summaryLabel, { color: colors.text }]}>Colony Age:</Text>
              <Text style={[styles.summaryValue, { color: colors.textSecondary }]}>
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
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  instructionTitle: {
    ...typography.heading2,
    textAlign: "center",
  },
  instructionText: {
    ...typography.body,
    textAlign: "center",
    lineHeight: 24,
  },
  imageCard: {
    marginBottom: spacing.lg,
    alignItems: "center",
  },
  imageTitle: {
    ...typography.heading3,
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
    borderRadius: spacing.md,
  },
  loadingText: {
    ...typography.caption,
    fontWeight: "600",
  },
  imagePlaceholder: {
    width: 200,
    height: 200,
    borderRadius: spacing.md,
    borderWidth: 2,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.md,
  },
  imagePlaceholderText: {
    ...typography.caption,
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
    marginTop: spacing.xs,
    fontSize: 10,
    textAlign: "center",
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  errorHint: {
    ...typography.caption,
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
  ageOptionContent: {
    padding: spacing.md,
    borderWidth: 1,
    borderRadius: spacing.sm,
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
    marginRight: spacing.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  ageOptionLabel: {
    ...typography.body,
    fontWeight: "600",
  },
  ageOptionDescription: {
    ...typography.caption,
    marginLeft: 32,
  },
  selectedInfo: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: spacing.sm,
    borderWidth: 1,
  },
  selectedText: {
    ...typography.body,
    fontWeight: "600",
    textAlign: "center",
  },
  summaryCard: {
    marginBottom: spacing.lg,
    borderWidth: 1,
  },
  summaryTitle: {
    ...typography.heading3,
    marginBottom: spacing.md,
  },
  summarySection: {
    marginBottom: spacing.sm,
  },
  summaryLabel: {
    ...typography.body,
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
    marginRight: spacing.sm,
  },
  characteristicText: {
    ...typography.body,
  },
  summaryValue: {
    ...typography.body,
    marginLeft: spacing.sm,
  },
  analyzeButton: {
    marginTop: spacing.md,
  },
});