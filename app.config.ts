// app.config.ts
// Professional Expo config: read build-time env vars (set via EAS secrets or CI)
// and expose only EXPO_PUBLIC_* values to the runtime via `extra`.

import { ExpoConfig, ConfigContext } from '@expo/config';

export default ({ config }: ConfigContext): ExpoConfig => {
  const {
    EXPO_PUBLIC_SUPABASE_URL,
    EXPO_PUBLIC_SUPABASE_ANON_KEY,
    EXPO_PUBLIC_API_URL,
  } = process.env;

  if (!EXPO_PUBLIC_SUPABASE_URL || !EXPO_PUBLIC_SUPABASE_ANON_KEY) {
    // Build-time warning (you'll see this when building locally or on EAS)
    // This prevents silently building an APK with undefined credentials.
    // Do NOT commit secrets here; set them via `eas secret:create`.
    // eslint-disable-next-line no-console
    console.warn(
      'Build-time warning: EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY is missing.\n' +
        'Make sure you set these with `eas secret:create` or via your CI environment for EAS builds.'
    );
  }

  return {
    ...config,
    name: 'Bacterial Pathogen Analyzer',
    slug: 'bacterialpathogenanalyzer',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/appLogo.png',
    userInterfaceStyle: 'light',
    splash: {
      image: './assets/appLogo.png',
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
        foregroundImage: './assets/appLogo-no-bg.png',
        backgroundColor: '#ffffff',
      },
      package: 'com.ojasvats.bacterialpathogenanalyzer',
    },
    plugins: ['expo-router'],
    extra: {
      router: {},
      eas: {
        projectId: '7064e2b6-5136-441f-af76-3da71be28290',
      },
      // These are intentionally read from process.env at build time (EAS).
      // They must be set as EAS secrets or CI env variables; do NOT commit actual values.
      EXPO_PUBLIC_SUPABASE_URL,
      EXPO_PUBLIC_SUPABASE_ANON_KEY,
      EXPO_PUBLIC_API_URL,
    },
    owner: 'ojasvats',
  };
};
