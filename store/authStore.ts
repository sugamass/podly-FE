import { supabase } from "@/services/supabase";
import type { Session, User } from "@supabase/supabase-js";
import { create } from "zustand";

export interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  initialized: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username?: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  initialize: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  loadProfile: (userId: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  profile: null,
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

      // プロフィール情報を取得
      if (data.user) {
        await get().loadProfile(data.user.id);
      }
    } catch (error) {
      console.error("Sign in error:", error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  signUp: async (email: string, password: string, username?: string) => {
    try {
      set({ loading: true });
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      // サインアップ成功時にプロフィールを作成
      if (data.user && username) {
        const { error: profileError } = await supabase.from("profiles").insert({
          id: data.user.id,
          username,
          full_name: username,
        });

        if (profileError) {
          console.error("Profile creation error:", profileError);
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
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      set({
        user: null,
        session: null,
        profile: null,
      });
    } catch (error) {
      console.error("Sign out error:", error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateProfile: async (updates: Partial<Profile>) => {
    try {
      const { user } = get();
      if (!user) throw new Error("ユーザーがログインしていません");

      const { data, error } = await supabase
        .from("profiles")
        .update(updates)
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

      set({ profile: data });
    } catch (error) {
      console.error("Load profile error:", error);
      // プロフィールが存在しない場合は作成
      if (!get().profile) {
        await supabase.from("profiles").insert({
          id: userId,
          username: null,
          full_name: null,
        });
      }
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

        // プロフィール情報を取得
        if (session?.user) {
          await get().loadProfile(session.user.id);
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

        // ログイン時にプロフィールを読み込み
        if (session?.user && event === "SIGNED_IN") {
          await get().loadProfile(session.user.id);
        }

        // ログアウト時にプロフィールをクリア
        if (event === "SIGNED_OUT") {
          set({ profile: null });
        }
      });
    } catch (error) {
      console.error("Auth initialization error:", error);
    } finally {
      set({ loading: false, initialized: true });
    }
  },
}));
