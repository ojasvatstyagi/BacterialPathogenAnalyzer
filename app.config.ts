import "dotenv/config";

export default {
  expo: {
    name: "Bacterial Pathogen Analyzer",
    slug: "bacterialpathogenanalyzer",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/appLogo.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/appLogo.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    ios: {
      supportsTablet: false,
      bundleIdentifier: "com.sumeetjha.bacterialpathogenanalyzer",
      infoPlist: { ITSAppUsesNonExemptEncryption: false },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/appLogo-no-bg.png",
        backgroundColor: "#ffffff",
      },
      package: "com.sumeetjha.bacterialpathogenanalyzer",
    },
    plugins: ["expo-router"],
    extra: {
      router: {},
      eas: {
        projectId: "f144ea13-2608-4503-9bee-09221635cb32",
      },
      EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
      EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL,
    },
    owner: "sumeetjha",
  },
};
