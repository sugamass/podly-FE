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
console.log("supabaseUrl", supabaseUrl);
console.log("supabaseKey", supabaseKey);
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

// ID生成ヘルパー関数
export function generateId(): string {
  return Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
}

export function generateUUIDLikeId(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// いいね機能関連の関数
export async function toggleLike(
  podcastId: string
): Promise<{ success: boolean; isLiked: boolean; likeCount: number }> {
  try {
    console.log("🔄 toggleLike called for podcast:", podcastId);

    // 現在のユーザーを取得
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("❌ Auth error:", authError);
      throw new Error("ログインが必要です");
    }

    console.log("👤 User ID:", user.id);

    // 現在のいいね状態を確認（軽量チェック）
    const { data: existingLike } = await supabase
      .from("likes")
      .select("id")
      .eq("user_id", user.id)
      .eq("podcast_id", podcastId)
      .single();

    let isLiked: boolean;

    if (existingLike) {
      // いいねが存在する場合は削除
      console.log("➖ Deleting existing like");
      const { error: deleteError } = await supabase
        .from("likes")
        .delete()
        .eq("user_id", user.id)
        .eq("podcast_id", podcastId);

      if (deleteError) {
        console.error("❌ Delete error:", deleteError);
        throw deleteError;
      }

      isLiked = false;
    } else {
      // いいねが存在しない場合は追加（upsert使用）
      console.log("➕ Adding new like with upsert");
      const { error: upsertError } = await supabase.from("likes").upsert(
        {
          id: generateUUIDLikeId(),
          user_id: user.id,
          podcast_id: podcastId,
        },
        {
          onConflict: "user_id,podcast_id",
          ignoreDuplicates: false,
        }
      );

      if (upsertError) {
        console.error("❌ Upsert error:", upsertError);
        throw upsertError;
      }

      isLiked = true;
    }

    // 更新後のいいね数を取得
    console.log("📊 Getting updated like count...");
    const { count: likeCount, error: countError } = await supabase
      .from("likes")
      .select("*", { count: "exact", head: true })
      .eq("podcast_id", podcastId);

    if (countError) {
      console.error("❌ Count error:", countError);
      throw countError;
    }

    console.log("📊 New like count:", likeCount);

    // ポッドキャストのlike_countを更新
    console.log("📝 Updating podcast like_count...");
    const { error: updateError } = await supabase
      .from("podcasts")
      .update({ like_count: likeCount || 0 })
      .eq("id", podcastId);

    if (updateError) {
      console.error("❌ Update error:", updateError);
      throw updateError;
    }

    console.log("✅ toggleLike completed successfully:", {
      isLiked,
      likeCount: likeCount || 0,
    });

    return {
      success: true,
      isLiked,
      likeCount: likeCount || 0,
    };
  } catch (error) {
    console.error("❌ Failed to toggle like:", error);
    return {
      success: false,
      isLiked: false,
      likeCount: 0,
    };
  }
}

export async function getLikeStatus(podcastId: string): Promise<boolean> {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return false;
    }

    const { data, error } = await supabase
      .from("likes")
      .select("id")
      .eq("user_id", user.id)
      .eq("podcast_id", podcastId)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("❌ Failed to get like status:", error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error("❌ Failed to get like status:", error);
    return false;
  }
}

export async function getLikeCount(podcastId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from("likes")
      .select("*", { count: "exact", head: true })
      .eq("podcast_id", podcastId);

    if (error) {
      console.error("❌ Failed to get like count:", error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error("❌ Failed to get like count:", error);
    return 0;
  }
}

export async function getUserLikedPodcasts(userId?: string): Promise<string[]> {
  try {
    let targetUserId = userId;

    if (!targetUserId) {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        return [];
      }
      targetUserId = user.id;
    }

    const { data, error } = await supabase
      .from("likes")
      .select("podcast_id")
      .eq("user_id", targetUserId);

    if (error) {
      console.error("❌ Failed to get user liked podcasts:", error);
      return [];
    }

    return (data || []).map((like) => like.podcast_id).filter(Boolean);
  } catch (error) {
    console.error("❌ Failed to get user liked podcasts:", error);
    return [];
  }
}

// 保存機能関連の関数
export async function toggleSave(
  podcastId: string
): Promise<{ success: boolean; isSaved: boolean; saveCount: number }> {
  try {
    console.log("🔄 toggleSave called for podcast:", podcastId);

    // 現在のユーザーを取得
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("❌ Auth error:", authError);
      throw new Error("ログインが必要です");
    }

    console.log("👤 User ID:", user.id);

    // 現在の保存状態を確認（軽量チェック）
    const { data: existingSave } = await supabase
      .from("saves")
      .select("id")
      .eq("user_id", user.id)
      .eq("podcast_id", podcastId)
      .single();

    let isSaved: boolean;

    if (existingSave) {
      // 保存が存在する場合は削除
      console.log("➖ Deleting existing save");
      const { error: deleteError } = await supabase
        .from("saves")
        .delete()
        .eq("user_id", user.id)
        .eq("podcast_id", podcastId);

      if (deleteError) {
        console.error("❌ Delete error:", deleteError);
        throw deleteError;
      }

      isSaved = false;
    } else {
      // 保存が存在しない場合は追加（upsert使用）
      console.log("➕ Adding new save with upsert");
      const { error: upsertError } = await supabase.from("saves").upsert(
        {
          id: generateUUIDLikeId(),
          user_id: user.id,
          podcast_id: podcastId,
        },
        {
          onConflict: "user_id,podcast_id",
          ignoreDuplicates: false,
        }
      );

      if (upsertError) {
        console.error("❌ Upsert error:", upsertError);
        throw upsertError;
      }

      isSaved = true;
    }

    // 更新後の保存数を取得
    console.log("📊 Getting updated save count...");
    const { count: saveCount, error: countError } = await supabase
      .from("saves")
      .select("*", { count: "exact", head: true })
      .eq("podcast_id", podcastId);

    if (countError) {
      console.error("❌ Count error:", countError);
      throw countError;
    }

    console.log("📊 New save count:", saveCount);

    // ポッドキャストのsave_countを更新
    console.log("📝 Updating podcast save_count...");
    const { error: updateError } = await supabase
      .from("podcasts")
      .update({ save_count: saveCount || 0 })
      .eq("id", podcastId);

    if (updateError) {
      console.error("❌ Update error:", updateError);
      throw updateError;
    }

    console.log("✅ toggleSave completed successfully:", {
      isSaved,
      saveCount: saveCount || 0,
    });

    return {
      success: true,
      isSaved,
      saveCount: saveCount || 0,
    };
  } catch (error) {
    console.error("❌ Failed to toggle save:", error);
    return {
      success: false,
      isSaved: false,
      saveCount: 0,
    };
  }
}

export async function getSaveStatus(podcastId: string): Promise<boolean> {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return false;
    }

    const { data, error } = await supabase
      .from("saves")
      .select("id")
      .eq("user_id", user.id)
      .eq("podcast_id", podcastId)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("❌ Failed to get save status:", error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error("❌ Failed to get save status:", error);
    return false;
  }
}

export async function getSaveCount(podcastId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from("saves")
      .select("*", { count: "exact", head: true })
      .eq("podcast_id", podcastId);

    if (error) {
      console.error("❌ Failed to get save count:", error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error("❌ Failed to get save count:", error);
    return 0;
  }
}

export async function getUserSavedPodcasts(userId?: string): Promise<string[]> {
  try {
    let targetUserId = userId;

    if (!targetUserId) {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        return [];
      }
      targetUserId = user.id;
    }

    const { data, error } = await supabase
      .from("saves")
      .select("podcast_id")
      .eq("user_id", targetUserId);

    if (error) {
      console.error("❌ Failed to get user saved podcasts:", error);
      return [];
    }

    return (data || []).map((save) => save.podcast_id).filter(Boolean);
  } catch (error) {
    console.error("❌ Failed to get user saved podcasts:", error);
    return [];
  }
}
