import React, { useEffect } from "react";
import { router } from "expo-router";

export default function AnalyzeIndex() {
  useEffect(() => {
    // Redirect to characteristics screen
    router.replace("/(tabs)/analyze/characteristics");
  }, []);

  return null;
}
