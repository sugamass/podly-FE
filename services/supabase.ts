import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import "react-native-url-polyfill/auto";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Supabase credentials are not properly configured. Please check your .env.local file."
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
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
          id: string; // UUID (auth.users.id との連携のため)
          username: string;
          avatar_url: string | null;
          bio: string | null;
          display_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string; // UUID (auth.users.id との連携のため)
          username: string;
          avatar_url?: string | null;
          bio?: string | null;
          display_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          avatar_url?: string | null;
          bio?: string | null;
          display_name?: string | null;
          updated_at?: string;
        };
      };
      podcasts: {
        Row: {
          id: string; // UUID
          title: string;
          summary: string | null;
          script_content: string;
          audio_url: string | null;
          duration: number | null;
          genre_id: string | null; // UUID
          creator_id: string | null; // UUID (profiles.id参照)
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
          image_url: string | null;
          tags: string[] | null;
        };
        Insert: {
          id: string; // UUID
          title: string;
          summary?: string | null;
          script_content: string;
          audio_url?: string | null;
          duration?: number | null;
          genre_id?: string | null; // UUID
          creator_id?: string | null; // UUID (profiles.id参照)
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
          image_url?: string | null;
          tags?: string[] | null;
        };
        Update: {
          id?: string; // UUID
          title?: string;
          summary?: string | null;
          script_content?: string;
          audio_url?: string | null;
          duration?: number | null;
          genre_id?: string | null; // UUID
          creator_id?: string | null; // UUID (profiles.id参照)
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
          image_url?: string | null;
          tags?: string[] | null;
        };
      };
      genres: {
        Row: {
          id: string; // UUID
          name: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id: string; // UUID
          name: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string; // UUID
          name?: string;
          description?: string | null;
          created_at?: string;
        };
      };
      likes: {
        Row: {
          id: string; // UUID
          user_id: string | null; // UUID (profiles.id参照)
          podcast_id: string | null; // UUID
          created_at: string;
        };
        Insert: {
          id: string; // UUID
          user_id?: string | null; // UUID (profiles.id参照)
          podcast_id?: string | null; // UUID
          created_at?: string;
        };
        Update: {
          id?: string; // UUID
          user_id?: string | null; // UUID (profiles.id参照)
          podcast_id?: string | null; // UUID
          created_at?: string;
        };
      };
      saves: {
        Row: {
          id: string; // UUID
          user_id: string | null; // UUID (profiles.id参照)
          podcast_id: string | null; // UUID
          created_at: string;
        };
        Insert: {
          id: string; // UUID
          user_id?: string | null; // UUID (profiles.id参照)
          podcast_id?: string | null; // UUID
          created_at?: string;
        };
        Update: {
          id?: string; // UUID
          user_id?: string | null; // UUID (profiles.id参照)
          podcast_id?: string | null; // UUID
          created_at?: string;
        };
      };
      follows: {
        Row: {
          id: string; // UUID
          follower_id: string | null; // UUID (profiles.id参照)
          following_id: string | null; // UUID (profiles.id参照)
          created_at: string;
        };
        Insert: {
          id: string; // UUID
          follower_id?: string | null; // UUID (profiles.id参照)
          following_id?: string | null; // UUID (profiles.id参照)
          created_at?: string;
        };
        Update: {
          id?: string; // UUID
          follower_id?: string | null; // UUID (profiles.id参照)
          following_id?: string | null; // UUID (profiles.id参照)
          created_at?: string;
        };
      };
      play_history: {
        Row: {
          id: string; // UUID
          user_id: string | null; // UUID (profiles.id参照)
          podcast_id: string | null; // UUID
          progress: number | null;
          completed: boolean | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string; // UUID
          user_id?: string | null; // UUID (profiles.id参照)
          podcast_id?: string | null; // UUID
          progress?: number | null;
          completed?: boolean | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string; // UUID
          user_id?: string | null; // UUID (profiles.id参照)
          podcast_id?: string | null; // UUID
          progress?: number | null;
          completed?: boolean | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      bgm: {
        Row: {
          id: string; // UUID
          name: string;
          description: string | null;
          file_url: string | null;
        };
        Insert: {
          id: string; // UUID
          name: string;
          description?: string | null;
          file_url?: string | null;
        };
        Update: {
          id?: string; // UUID
          name?: string;
          description?: string | null;
          file_url?: string | null;
        };
      };
      comments: {
        Row: {
          id: string; // UUID
          podcast_id: string | null; // UUID
          user_id: string | null; // UUID (profiles.id参照)
          content: string;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id: string; // UUID
          podcast_id?: string | null; // UUID
          user_id?: string | null; // UUID (profiles.id参照)
          content: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string; // UUID
          podcast_id?: string | null; // UUID
          user_id?: string | null; // UUID (profiles.id参照)
          content?: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
    };
  };
}

// ポッドキャストデータ取得関数

export type PodcastWithCreator =
  Database["public"]["Tables"]["podcasts"]["Row"] & {
    creator: Database["public"]["Tables"]["profiles"]["Row"] | null;
    genre: Database["public"]["Tables"]["genres"]["Row"] | null;
  };

export async function fetchPodcasts(page: number = 0, limit: number = 10) {
  const offset = page * limit;

  const { data, error } = await supabase
    .from("podcasts")
    .select("*")
    .eq("published_at", null)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error("Error fetching podcasts:", error);
    throw new Error(`ポッドキャストの取得に失敗しました: ${error.message}`);
  }

  return data || [];
}

export async function fetchPodcastsWithCreator(
  page: number = 0,
  limit: number = 10
): Promise<PodcastWithCreator[]> {
  const offset = page * limit;

  const { data, error } = await supabase
    .from("podcasts")
    .select(
      `
      *,
      creator:profiles(*),
      genre:genres(*)
    `
    )
    .not("audio_url", "is", null) // 音声URLが存在するもののみ
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error("Error fetching podcasts with creator:", error);
    throw new Error(`ポッドキャストの取得に失敗しました: ${error.message}`);
  }

  return (data || []) as PodcastWithCreator[];
}

export async function fetchPodcastById(
  id: string
): Promise<PodcastWithCreator | null> {
  const { data, error } = await supabase
    .from("podcasts")
    .select(
      `
      *,
      creator:profiles(*),
      genre:genres(*)
    `
    )
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    console.error("Error fetching podcast by id:", error);
    throw new Error(`ポッドキャストの取得に失敗しました: ${error.message}`);
  }

  return data as PodcastWithCreator;
}

export async function fetchPublishedPodcasts(
  page: number = 0,
  limit: number = 10
): Promise<PodcastWithCreator[]> {
  const offset = page * limit;

  const { data, error } = await supabase
    .from("podcasts")
    .select(
      `
      *,
      creator:profiles(*),
      genre:genres(*)
    `
    )
    .not("audio_url", "is", null) // 音声URLが存在するもののみ
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw new Error(
      `公開済みポッドキャストの取得に失敗しました: ${error.message}`
    );
  }

  return (data || []) as PodcastWithCreator[];
}

export async function fetchAllPodcasts(
  page: number = 0,
  limit: number = 10
): Promise<PodcastWithCreator[]> {
  const offset = page * limit;

  const { data, error } = await supabase
    .from("podcasts")
    .select(
      `
      *,
      creator:profiles(*),
      genre:genres(*)
    `
    )
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw new Error(`ポッドキャストの取得に失敗しました: ${error.message}`);
  }

  return (data || []) as PodcastWithCreator[];
}

// Supabase接続テスト用
export async function testSupabaseConnection() {
  try {
    console.log("🔧 Testing Supabase connection...");
    const { count, error } = await supabase
      .from("podcasts")
      .select("*", { count: "exact", head: true });

    if (error) {
      console.error("❌ Supabase connection test failed:", error);
      return { success: false, error: error.message };
    }

    console.log("✅ Supabase connection successful. Total podcasts:", count);
    return { success: true, count: count };
  } catch (error) {
    console.error("❌ Supabase connection test error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// シンプルなテスト関数
export async function fetchSimplePodcasts(): Promise<any[]> {
  console.log("🧪 Simple podcast fetch test...");

  const { data, error } = await supabase
    .from("podcasts")
    .select("id, title, audio_url, created_at")
    .limit(5);

  console.log("🧪 Simple test result:", {
    dataLength: data?.length || 0,
    error: error,
    sampleData: data?.slice(0, 2),
  });

  if (error) {
    throw new Error(`Simple fetch failed: ${error.message}`);
  }

  return data || [];
}







