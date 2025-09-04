import { Link, router, Stack } from "expo-router";
import { StyleSheet, Text, View, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Page Not Found" }} />
      <View style={styles.container}>
        <Text style={styles.emoji}>🧐</Text>
        <Text style={styles.title}>Oops! We can't find that page.</Text>
        <Text style={styles.description}>
          The screen you're looking for doesn't exist or has been moved. Let's
          get you back on track.
        </Text>
        <Link href="/" asChild>
          <View style={styles.linkButton}>
            <Text style={styles.linkText} onPress={() => router.back()}>
              Go Back
            </Text>
          </View>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  emoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    paddingHorizontal: width * 0.1,
    marginBottom: 30,
  },
  linkButton: {
    marginTop: 15,
    paddingVertical: 12,
    paddingHorizontal: 25,
    backgroundColor: "#1e90ff",
    borderRadius: 8,
  },
  linkText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
  },
});
