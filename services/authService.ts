import { supabase } from "@/services/supabase";
import { getUserStatistics, type UserStatistics } from "@/services/database";

export interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
  display_name: string | null;
  created_at: string;
  updated_at: string;
}

export class AuthService {
  /**
   * プロフィール情報を取得
   * @param userId ユーザーID
   * @returns プロフィール情報またはnull
   */
  static async loadProfile(userId: string): Promise<Profile | null> {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      return data || null;
    } catch (error) {
      console.error("Load profile error:", error);
      throw error;
    }
  }

  /**
   * ユーザープロフィールを作成
   * @param userId ユーザーID
   * @param username ユーザー名
   */
  static async createUserProfile(userId: string, username: string): Promise<void> {
    try {
      // プロフィールが既に存在するかチェック
      const { data: existingProfile, error: checkError } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", userId)
        .single();

      // 既に存在する場合は作成をスキップ
      if (existingProfile) {
        console.log("プロフィールは既に存在します");
        return;
      }

      // プロフィールを作成
      const { error: insertError } = await supabase.from("profiles").insert({
        id: userId,
        username: username,
        avatar_url: null,
        bio: null,
      });

      if (insertError) {
        console.error("Profile insert error:", insertError);
        throw new Error(
          "プロフィールの作成に失敗しました。もう一度お試しください。"
        );
      }

      console.log("プロフィールが正常に作成されました:", { userId, username });
    } catch (error) {
      console.error("Create profile error:", error);
      throw error;
    }
  }

  /**
   * プロフィールを更新
   * @param userId ユーザーID
   * @param updates 更新するフィールド
   * @returns 更新されたプロフィール
   */
  static async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile> {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error("Profile update error:", error);
      throw error;
    }
  }

  /**
   * ユーザー名の利用可能性をチェック
   * @param username チェックするユーザー名
   * @returns 利用可能な場合はtrue
   */
  static async checkUsernameAvailability(username: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", username.trim())
        .single();

      if (error && error.code === "PGRST116") {
        // レコードが見つからない場合は利用可能
        return true;
      }

      if (error) {
        throw error;
      }

      // レコードが見つかった場合は既に使用されている
      return false;
    } catch (error) {
      console.error("Username availability check error:", error);
      throw error;
    }
  }

  /**
   * ユーザーの統計情報を取得
   * @param userId ユーザーID
   * @returns 統計情報
   */
  static async loadUserStatistics(userId: string): Promise<UserStatistics> {
    try {
      return await getUserStatistics(userId);
    } catch (error) {
      console.error("Load user statistics error:", error);
      throw error;
    }
  }

  /**
   * サインイン処理
   * @param email メールアドレス
   * @param password パスワード
   * @returns 認証結果
   */
  static async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error("Sign in error:", error);
      throw error;
    }
  }

  /**
   * サインアップ処理
   * @param email メールアドレス
   * @param password パスワード
   * @param username ユーザー名
   * @returns 認証結果
   */
  static async signUp(email: string, password: string, username: string) {
    try {
      // ユーザー名の重複チェック
      const isUsernameAvailable = await this.checkUsernameAvailability(username);
      if (!isUsernameAvailable) {
        throw new Error("このユーザー名は既に使用されています");
      }

      // Supabase Authでユーザー作成
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username.trim(),
          },
        },
      });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error("Sign up error:", error);
      throw error;
    }
  }

  /**
   * サインアウト処理
   */
  static async signOut(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Supabase sign out error:", error);
        throw error;
      }
      console.log("Supabase sign out successful");
    } catch (error) {
      console.error("Sign out error:", error);
      throw error;
    }
  }
}