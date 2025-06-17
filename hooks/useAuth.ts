import { useAuthStore } from "@/store/authStore";
import { useEffect } from "react";

export function useAuth() {
  const {
    user,
    session,
    profile,
    loading,
    initialized,
    signIn,
    signUp,
    signOut,
    updateProfile,
    initialize,
  } = useAuthStore();

  useEffect(() => {
    if (!initialized) {
      initialize();
    }
  }, [initialized, initialize]);

  return {
    user,
    session,
    profile,
    loading,
    initialized,
    signIn,
    signUp,
    signOut,
    updateProfile,
    isAuthenticated: !!user,
    isEmailVerified: user?.email_confirmed_at != null,
  };
}

export function useRequireAuth() {
  const auth = useAuth();

  useEffect(() => {
    if (auth.initialized && !auth.isAuthenticated) {
      // 認証が必要なページでの処理
      console.log("Authentication required");
    }
  }, [auth.initialized, auth.isAuthenticated]);

  return auth;
}
