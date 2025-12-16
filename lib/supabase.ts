// lib/supabase.ts
// Fully typed + React Native optimized Supabase client for Expo

import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  (Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_URL as
    | string
    | undefined) ||
  '';

const SUPABASE_ANON_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  (Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_ANON_KEY as
    | string
    | undefined) ||
  '';

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

if (!isSupabaseConfigured) {
  console.error(
    '[Supabase] Missing environment variables.\n' +
    'Make sure EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY are set via EAS secrets.'
  );
}

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

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
        Relationships: [
          {
            foreignKeyName: "analyses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ];
      };
    };
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_user: {
        Args: Record<string, never>
        Returns: void
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
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

export const supabase: SupabaseClient<Database> = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      storage: AsyncStorage as any,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false, // required for React Native
    },
  }
);

export default supabase;
