import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";

export const useAuthModal = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { initialized, isAuthenticated, loading: authLoading } = useAuth();

  // 統合されたuseEffect: 認証モーダルの表示制御
  useEffect(() => {
    if (initialized) {
      if (!isAuthenticated && !authLoading) {
        setShowAuthModal(true);
      } else if (isAuthenticated && showAuthModal) {
        setShowAuthModal(false);
      }
    }
  }, [initialized, isAuthenticated, authLoading, showAuthModal]);

  return { showAuthModal, setShowAuthModal };
};