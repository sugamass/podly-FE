import { supabase } from "@/services/supabase";
import { getUserStatistics, type UserStatistics } from "@/services/database";
import { withErrorHandling, toAppError } from '../utils/errorHandler';
import { logger } from '../utils/logger';

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
    return withErrorHandling(async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error && error.code !== "PGRST116") {
        throw toAppError(error, 'loadProfile');
      }

      return data || null;
    }, 'loadProfile');
  }

  /**
   * ユーザープロフィールを作成
   * @param userId ユーザーID
   * @param username ユーザー名
   */
  static async createUserProfile(userId: string, username: string): Promise<void> {
    return withErrorHandling(async () => {
      // プロフィールが既に存在するかチェック
      const { data: existingProfile, error: checkError } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", userId)
        .single();

      // 既に存在する場合は作成をスキップ
      if (existingProfile) {
        logger.info("Profile already exists, skipping creation", { userId }, 'createUserProfile');
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
        throw toAppError(insertError, 'createUserProfile');
      }

      logger.info("Profile created successfully", { userId, username }, 'createUserProfile');
    }, 'createUserProfile');
  }

  /**
   * プロフィールを更新
   * @param userId ユーザーID
   * @param updates 更新するフィールド
   * @returns 更新されたプロフィール
   */
  static async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile> {
    return withErrorHandling(async () => {
      const { data, error } = await supabase
        .from("profiles")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)
        .select()
        .single();

      if (error) throw toAppError(error, 'updateProfile');

      return data;
    }, 'updateProfile');
  }

  /**
   * ユーザー名の利用可能性をチェック
   * @param username チェックするユーザー名
   * @returns 利用可能な場合はtrue
   */
  static async checkUsernameAvailability(username: string): Promise<boolean> {
    return withErrorHandling(async () => {
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
        throw toAppError(error, 'checkUsernameAvailability');
      }

      // レコードが見つかった場合は既に使用されている
      return false;
    }, 'checkUsernameAvailability');
  }

  /**
   * ユーザーの統計情報を取得
   * @param userId ユーザーID
   * @returns 統計情報
   */
  static async loadUserStatistics(userId: string): Promise<UserStatistics> {
    return withErrorHandling(async () => {
      return await getUserStatistics(userId);
    }, 'loadUserStatistics');
  }

  /**
   * サインイン処理
   * @param email メールアドレス
   * @param password パスワード
   * @returns 認証結果
   */
  static async signIn(email: string, password: string) {
    return withErrorHandling(async () => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw toAppError(error, 'signIn');

      return data;
    }, 'signIn');
  }

  /**
   * サインアップ処理
   * @param email メールアドレス
   * @param password パスワード
   * @param username ユーザー名
   * @returns 認証結果
   */
  static async signUp(email: string, password: string, username: string) {
    return withErrorHandling(async () => {
      // ユーザー名の重複チェック
      const isUsernameAvailable = await this.checkUsernameAvailability(username);
      if (!isUsernameAvailable) {
        throw toAppError(new Error("このユーザー名は既に使用されています"), 'signUp');
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

      if (error) throw toAppError(error, 'signUp');

      return data;
    }, 'signUp');
  }

  /**
   * サインアウト処理
   */
  static async signOut(): Promise<void> {
    return withErrorHandling(async () => {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw toAppError(error, 'signOut');
      }
      logger.info("Sign out completed successfully", undefined, 'signOut');
    }, 'signOut');
  }
}