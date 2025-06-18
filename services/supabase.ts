import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import "react-native-url-polyfill/auto";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Supabase credentials are not properly configured. Please check your .env.local file."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Database types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string | null;
          full_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
        };
      };
      videos: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          video_url: string;
          thumbnail_url: string | null;
          user_id: string;
          created_at: string;
          likes_count: number;
          comments_count: number;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          video_url: string;
          thumbnail_url?: string | null;
          user_id: string;
          created_at?: string;
          likes_count?: number;
          comments_count?: number;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          video_url?: string;
          thumbnail_url?: string | null;
          user_id?: string;
          created_at?: string;
          likes_count?: number;
          comments_count?: number;
        };
      };
      podcasts: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          audio_url: string;
          thumbnail_url: string | null;
          user_id: string;
          created_at: string;
          likes_count: number;
          duration: number;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          audio_url: string;
          thumbnail_url?: string | null;
          user_id: string;
          created_at?: string;
          likes_count?: number;
          duration?: number;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          audio_url?: string;
          thumbnail_url?: string | null;
          user_id?: string;
          created_at?: string;
          likes_count?: number;
          duration?: number;
        };
      };
    };
  };
}
