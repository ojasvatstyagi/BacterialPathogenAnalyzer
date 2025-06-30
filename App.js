import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";

export default function App() {
  return (
    <View style={styles.container}>
      <Text>Open up App.js to start working on your app!</Text>
      <Button title="Click me" />
      <Card>
        <Text>Card</Text>
      </Card>
      <Checkbox label="Checkbox" />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
