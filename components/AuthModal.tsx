import { useAuth } from "@/hooks/useAuth";
import { useAuthForm } from "@/hooks/useAuthForm";
import { getAuthErrorMessage } from "@/utils/authValidation";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Sub-components
import { AuthHeader } from "./AuthModal/AuthHeader";
import { AuthForm } from "./AuthModal/AuthForm";
import { AuthSubmitButton } from "./AuthModal/AuthSubmitButton";
import { AuthToggle } from "./AuthModal/AuthToggle";

interface AuthModalProps {
  visible: boolean;
  onClose: () => void;
  forceSignUp?: boolean; // 初回起動時にサインアップを強制
  allowClose?: boolean; // モーダルを閉じることを許可するか
}

export function AuthModal({
  visible,
  onClose,
  forceSignUp = false,
  allowClose = true,
}: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(forceSignUp);
  const { signIn, signUp } = useAuth();
  const formHook = useAuthForm(isSignUp);

  const resetForm = () => {
    formHook.resetForm();
    setIsSignUp(false);
  };

  const handleClose = () => {
    if (!allowClose) return; // モーダルを閉じることが許可されていない場合
    resetForm();
    onClose();
  };


  const handleAuth = async () => {
    const validation = formHook.validate();
    if (!validation.isValid) {
      formHook.setErrors(validation.errors);
      const firstError = Object.values(validation.errors)[0];
      Alert.alert("エラー", firstError);
      return;
    }

    formHook.setIsLoading(true);

    try {
      if (isSignUp) {
        await signUp(
          formHook.formData.email.trim(),
          formHook.formData.password,
          formHook.formData.username.trim()
        );
        Alert.alert(
          "登録完了",
          "アカウントとプロフィールが作成されました。メールアドレスに確認リンクを送信しましたので、メールを確認してアカウントを有効化してください。",
          [{ text: "OK", onPress: handleClose }]
        );
      } else {
        await signIn(
          formHook.formData.email.trim(),
          formHook.formData.password
        );
        handleClose();
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      const errorMessage = getAuthErrorMessage(error);
      Alert.alert("エラー", errorMessage);
    } finally {
      formHook.setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    formHook.updateField('password', '');
    formHook.updateField('confirmPassword', '');
    formHook.updateField('username', '');
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={allowClose ? handleClose : undefined}
    >
      <SafeAreaView className="flex-1 bg-[#121620]">
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 px-6 py-4">
            <AuthHeader
              isSignUp={isSignUp}
              onClose={handleClose}
              allowClose={allowClose}
            />
            
            <AuthForm
              isSignUp={isSignUp}
              formHook={formHook}
            />
            
            <AuthSubmitButton
              isSignUp={isSignUp}
              isLoading={formHook.isLoading}
              onPress={handleAuth}
            />
            
            <AuthToggle
              isSignUp={isSignUp}
              onToggle={toggleMode}
              disabled={formHook.isLoading}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

// 認証が必要な画面で使用するガードコンポーネント
interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { isAuthenticated, loading, initialized } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  React.useEffect(() => {
    if (initialized && !loading && !isAuthenticated) {
      setShowAuthModal(true);
    }
  }, [initialized, loading, isAuthenticated]);

  if (!initialized || loading) {
    return (
      <SafeAreaView className="flex-1 bg-[#121620] items-center justify-center">
        <ActivityIndicator size="large" color="#4F7CFF" />
        <Text className="text-white mt-4 text-base">読み込み中...</Text>
      </SafeAreaView>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        {fallback || (
          <SafeAreaView className="flex-1 bg-[#121620] items-center justify-center">
            <Text className="text-white text-xl mb-4">ログインが必要です</Text>
            <TouchableOpacity
              className="bg-[#4F7CFF] px-8 py-3 rounded-xl"
              onPress={() => setShowAuthModal(true)}
            >
              <Text className="text-white font-bold text-base">ログイン</Text>
            </TouchableOpacity>
          </SafeAreaView>
        )}
        <AuthModal
          visible={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        />
      </>
    );
  }

  return <>{children}</>;
}

