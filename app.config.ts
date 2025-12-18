// app.config.ts
// Professional Expo config: read build-time env vars (set via EAS secrets or CI)
// and expose only EXPO_PUBLIC_* values to the runtime via `extra`.

import { ExpoConfig, ConfigContext } from '@expo/config';

export default ({ config }: ConfigContext): ExpoConfig => {
  const {
    EXPO_PUBLIC_SUPABASE_URL,
    EXPO_PUBLIC_SUPABASE_ANON_KEY,
  } = process.env;

  if (!EXPO_PUBLIC_SUPABASE_URL || !EXPO_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn(
      'Build-time warning: EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY is missing.\n' +
      'Make sure you set these with `eas secret:create` or via your CI environment for EAS builds.'
    );
  }

  return {
    ...config,
    name: 'Bacterial Pathogen Analyzer',
    slug: 'bacterialpathogenanalyzer',
    scheme: 'bacterialpathogenanalyzer',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    splash: {
      image: './assets/icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    ios: {
      supportsTablet: false,
      bundleIdentifier: 'com.ojasvats.bacterialpathogenanalyzer',
      infoPlist: { ITSAppUsesNonExemptEncryption: false },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive_icon.png',
        backgroundColor: '#ffffff',
      },
      package: 'com.ojasvats.bacterialpathogenanalyzer',
      // @ts-ignore
      usesCleartextTraffic: true,
    },
    plugins: ['expo-router'],
    extra: {
      router: {},
      eas: {
        projectId: '7064e2b6-5136-441f-af76-3da71be28290',
      },
      EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
      EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    },
    owner: 'ojasvats',
  };
};
