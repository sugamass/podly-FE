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
          username: string;
          avatar_url: string | null;
          bio: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          avatar_url?: string | null;
          bio?: string | null;
          updated_at?: string;
        };
      };
      podcasts: {
        Row: {
          id: string;
          title: string;
          summary: string | null;
          script_content: string;
          audio_url: string | null;
          duration: number | null;
          genre_id: string | null;
          creator_id: string | null;
          source_urls: string[] | null;
          speakers: string[] | null;
          bgm_id: string | null;
          published_at: string | null;
          created_at: string;
          updated_at: string;
          like_count: number | null;
          streams: number | null;
          save_count: number | null;
          situation: string | null;
          voices: string[] | null;
        };
        Insert: {
          id?: string;
          title: string;
          summary?: string | null;
          script_content: string;
          audio_url?: string | null;
          duration?: number | null;
          genre_id?: string | null;
          creator_id?: string | null;
          source_urls?: string[] | null;
          speakers?: string[] | null;
          bgm_id?: string | null;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
          like_count?: number | null;
          streams?: number | null;
          save_count?: number | null;
          situation?: string | null;
          voices?: string[] | null;
        };
        Update: {
          id?: string;
          title?: string;
          summary?: string | null;
          script_content?: string;
          audio_url?: string | null;
          duration?: number | null;
          genre_id?: string | null;
          creator_id?: string | null;
          source_urls?: string[] | null;
          speakers?: string[] | null;
          bgm_id?: string | null;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
          like_count?: number | null;
          streams?: number | null;
          save_count?: number | null;
          situation?: string | null;
          voices?: string[] | null;
        };
      };
      genres: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          created_at?: string;
        };
      };
      likes: {
        Row: {
          id: string;
          user_id: string | null;
          podcast_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          podcast_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          podcast_id?: string | null;
          created_at?: string;
        };
      };
      saves: {
        Row: {
          id: string;
          user_id: string | null;
          podcast_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          podcast_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          podcast_id?: string | null;
          created_at?: string;
        };
      };
      follows: {
        Row: {
          id: string;
          follower_id: string | null;
          following_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          follower_id?: string | null;
          following_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          follower_id?: string | null;
          following_id?: string | null;
          created_at?: string;
        };
      };
      play_history: {
        Row: {
          id: string;
          user_id: string | null;
          podcast_id: string | null;
          progress: number;
          completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          podcast_id?: string | null;
          progress?: number;
          completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          podcast_id?: string | null;
          progress?: number;
          completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      bgm: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          file_url: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          file_url?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          file_url?: string | null;
        };
      };
    };
  };
}
