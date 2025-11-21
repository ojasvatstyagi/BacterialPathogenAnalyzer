import { createClient } from "@supabase/supabase-js";
import Constants from "expo-constants";

const extra = Constants.expoConfig?.extra || {};

const supabaseUrl = extra.EXPO_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = extra.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Missing Supabase environment variables!");
}

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