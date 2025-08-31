import { supabase } from "@/services/supabase";
import { getUserStatistics, type UserStatistics } from "@/services/database";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Session, User } from "@supabase/supabase-js";
import { create } from "zustand";

export interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
  display_name: string | null;
  created_at: string;
  updated_at: string;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  statistics: UserStatistics | null;
  loading: boolean;
  initialized: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  initialize: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  loadProfile: (userId: string) => Promise<void>;
  loadUserStatistics: (userId: string) => Promise<void>;
  checkUsernameAvailability: (username: string) => Promise<boolean>;
  createUserProfile: (userId: string, username: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  profile: null,
  statistics: null,
  loading: true,
  initialized: false,

  setLoading: (loading: boolean) => set({ loading }),

  signIn: async (email: string, password: string) => {
    try {
      set({ loading: true });
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // プロフィール情報と統計情報を取得
      if (data.user) {
        await get().loadProfile(data.user.id);
        await get().loadUserStatistics(data.user.id);
      }
    } catch (error) {
      console.error("Sign in error:", error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  signUp: async (email: string, password: string, username: string) => {
    try {
      set({ loading: true });

      // ユーザー名の重複チェック
      const isUsernameAvailable = await get().checkUsernameAvailability(
        username
      );
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

      if (data.user) {
        // プロフィール作成は必須処理
        // 失敗した場合はサインアップ全体を失敗扱いにする
        try {
          await get().createUserProfile(data.user.id, username.trim());
          console.log("プロフィールが正常に作成されました");

          // プロフィール情報と統計情報を読み込み
          if (data.user.email_confirmed_at) {
            // メール確認済みの場合はプロフィールと統計情報も読み込む
            await get().loadProfile(data.user.id);
            await get().loadUserStatistics(data.user.id);
          }
        } catch (profileError) {
          console.error("Profile creation error:", profileError);
          // プロフィール作成に失敗した場合はサインアップ全体を失敗扱いにする
          throw new Error(
            "アカウント作成中にエラーが発生しました。もう一度お試しください。"
          );
        }
      }
    } catch (error) {
      console.error("Sign up error:", error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  createUserProfile: async (userId: string, username: string) => {
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
  },

  signOut: async () => {
    try {
      set({ loading: true });

      // Supabase認証からサインアウト
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("❌ Supabase sign out error:", error);
        throw error;
      }
      console.log("✅ Supabase sign out successful");

      // AsyncStorageから認証関連データを完全削除
      try {
        await AsyncStorage.multiRemove([
          "supabase.auth.token",
          "sb-auth-token",
          "supabase.session",
          "sb-session",
        ]);
        console.log("✅ AsyncStorage cleared");
      } catch (storageError) {
        console.warn("⚠️ AsyncStorage clear warning:", storageError);
        // AsyncStorageのエラーは致命的ではないので続行
      }

      // Zustandストア状態を完全クリア
      set({
        user: null,
        session: null,
        profile: null,
        statistics: null,
        loading: false,
      });

      console.log("✅ Sign out process completed successfully");
    } catch (error) {
      console.error("❌ Sign out error:", error);
      // エラーが発生してもローディング状態は解除
      set({ loading: false });
      throw error;
    }
  },

  updateProfile: async (updates: Partial<Profile>) => {
    try {
      const { user } = get();
      if (!user) throw new Error("ユーザーがログインしていません");

      const { data, error } = await supabase
        .from("profiles")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)
        .select()
        .single();

      if (error) throw error;

      set({ profile: data });
    } catch (error) {
      console.error("Profile update error:", error);
      throw error;
    }
  },

  loadProfile: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      if (data) {
        set({ profile: data });
      } else {
        // プロフィールが存在しない場合の処理
        console.log("プロフィールが見つかりません:", userId);
        set({ profile: null });
      }
    } catch (error) {
      console.error("Load profile error:", error);
      set({ profile: null });
    }
  },

  loadUserStatistics: async (userId: string) => {
    try {
      const statistics = await getUserStatistics(userId);
      set({ statistics });
    } catch (error) {
      console.error("Load user statistics error:", error);
      set({ statistics: { podcasts: 0, followers: 0, following: 0 } });
    }
  },

  checkUsernameAvailability: async (username: string) => {
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
      return false;
    }
  },

  initialize: async () => {
    try {
      set({ loading: true });

      // 現在のセッションを取得
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error("Get session error:", error);
      } else {
        set({
          session,
          user: session?.user ?? null,
        });

        // プロフィール情報と統計情報を取得
        if (session?.user) {
          await get().loadProfile(session.user.id);
          await get().loadUserStatistics(session.user.id);
        }
      }

      // 認証状態の変更を監視
      supabase.auth.onAuthStateChange(async (event, session) => {
        console.log("Auth state changed:", event, session?.user?.email);

        set({
          session,
          user: session?.user ?? null,
          profile: session?.user ? get().profile : null,
        });

        // ログイン時またはメール確認時にプロフィールを読み込み
        if (
          session?.user &&
          (event === "SIGNED_IN" || event === "TOKEN_REFRESHED")
        ) {
          await get().loadProfile(session.user.id);
          await get().loadUserStatistics(session.user.id);

          // プロフィールが存在しない場合、メタデータからユーザー名を取得して作成
          const currentProfile = get().profile;
          if (!currentProfile && session.user.user_metadata?.username) {
            try {
              await get().createUserProfile(
                session.user.id,
                session.user.user_metadata.username
              );
              await get().loadProfile(session.user.id);
              await get().loadUserStatistics(session.user.id);
            } catch (profileError) {
              console.error("Auto profile creation failed:", profileError);
            }
          }
        }

        // ログアウト時にプロフィールと統計情報をクリア
        if (event === "SIGNED_OUT") {
          set({ profile: null, statistics: null });
        }
      });
    } catch (error) {
      console.error("Auth initialization error:", error);
    } finally {
      set({ loading: false, initialized: true });
    }
  },
}));
