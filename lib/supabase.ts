import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

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
          created_at?: string;
        };
      };
    };
  };
};
