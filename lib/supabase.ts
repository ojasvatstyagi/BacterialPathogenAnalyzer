import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

// Get environment variables from Expo Constants (works with app.config.ts)
const supabaseUrl =
  Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_URL ||
  process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey =
  Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export type Database = {
  public: {
    Tables: {
      analyses: {
        Row: {
          id: string;
          user_id: string;
          characteristics: string[];
          culture_medium: string;
          image_url: string | null;
          result: string | null;
          confidence: number | null;
          colony_age: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          characteristics: string[];
          culture_medium: string;
          image_url?: string | null;
          result?: string | null;
          confidence?: number | null;
          colony_age?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          characteristics?: string[];
          culture_medium?: string;
          image_url?: string | null;
          result?: string | null;
          confidence?: number | null;
          colony_age?: string;
          created_at?: string;
        };
      };
    };
  };
};

export interface UserProfile {
  id: string;
  full_name?: string;
  organization?: string;
  phone?: string;
  bio?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}
