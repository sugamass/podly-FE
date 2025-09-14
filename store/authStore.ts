import { AuthService, type Profile } from "@/services/authService";
import { supabase } from "@/services/supabase";
import { type UserStatistics } from "@/services/database";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Session, User } from "@supabase/supabase-js";
import { create } from "zustand";

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
  setProfile: (profile: Profile | null) => void;
  setStatistics: (statistics: UserStatistics | null) => void;
  refreshProfileData: (userId: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  profile: null,
  statistics: null,
  loading: true,
  initialized: false,

  setLoading: (loading: boolean) => set({ loading }),

  setProfile: (profile: Profile | null) => set({ profile }),

  setStatistics: (statistics: UserStatistics | null) => set({ statistics }),

  refreshProfileData: async (userId: string) => {
    try {
      const profile = await AuthService.loadProfile(userId);
      const statistics = await AuthService.loadUserStatistics(userId);
      set({ profile, statistics });
    } catch (error) {
      console.error("Failed to refresh profile data:", error);
      throw error;
    }
  },

  signIn: async (email: string, password: string) => {
    try {
      set({ loading: true });
      const data = await AuthService.signIn(email, password);

      // プロフィール情報と統計情報を取得
      if (data.user) {
        const profile = await AuthService.loadProfile(data.user.id);
        const statistics = await AuthService.loadUserStatistics(data.user.id);
        set({ profile, statistics });
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

      const data = await AuthService.signUp(email, password, username);

      if (data.user) {
        // プロフィール作成は必須処理
        // 失敗した場合はサインアップ全体を失敗扱いにする
        try {
          await AuthService.createUserProfile(data.user.id, username.trim());
          console.log("プロフィールが正常に作成されました");

          // プロフィール情報と統計情報を読み込み
          if (data.user.email_confirmed_at) {
            // メール確認済みの場合はプロフィールと統計情報も読み込む
            const profile = await AuthService.loadProfile(data.user.id);
            const statistics = await AuthService.loadUserStatistics(data.user.id);
            set({ profile, statistics });
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


  signOut: async () => {
    try {
      set({ loading: true });

      // Supabase認証からサインアウト
      await AuthService.signOut();

      // AsyncStorageから認証関連データを完全削除
      try {
        await AsyncStorage.multiRemove([
          "supabase.auth.token",
          "sb-auth-token",
          "supabase.session",
          "sb-session",
        ]);
        console.log("AsyncStorage cleared");
      } catch (storageError) {
        console.warn("AsyncStorage clear warning:", storageError);
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

      console.log("Sign out process completed successfully");
    } catch (error) {
      console.error("Sign out error:", error);
      // エラーが発生してもローディング状態は解除
      set({ loading: false });
      throw error;
    }
  },

  updateProfile: async (updates: Partial<Profile>) => {
    try {
      const { user } = get();
      if (!user) throw new Error("ユーザーがログインしていません");

      const updatedProfile = await AuthService.updateProfile(user.id, updates);
      set({ profile: updatedProfile });
    } catch (error) {
      console.error("Profile update error:", error);
      throw error;
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
          try {
            const profile = await AuthService.loadProfile(session.user.id);
            const statistics = await AuthService.loadUserStatistics(session.user.id);
            set({ profile, statistics });
          } catch (error) {
            console.error("Failed to load profile or statistics:", error);
            set({ profile: null, statistics: { podcasts: 0, followers: 0, following: 0 } });
          }
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
          try {
            const profile = await AuthService.loadProfile(session.user.id);
            const statistics = await AuthService.loadUserStatistics(session.user.id);
            set({ profile, statistics });

            // プロフィールが存在しない場合、メタデータからユーザー名を取得して作成
            if (!profile && session.user.user_metadata?.username) {
              try {
                await AuthService.createUserProfile(
                  session.user.id,
                  session.user.user_metadata.username
                );
                const newProfile = await AuthService.loadProfile(session.user.id);
                const newStatistics = await AuthService.loadUserStatistics(session.user.id);
                set({ profile: newProfile, statistics: newStatistics });
              } catch (profileError) {
                console.error("Auto profile creation failed:", profileError);
              }
            }
          } catch (error) {
            console.error("Failed to load profile or statistics on auth change:", error);
            set({ profile: null, statistics: { podcasts: 0, followers: 0, following: 0 } });
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
