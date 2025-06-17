import { useAuth } from "@/hooks/useAuth";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface AuthModalProps {
  visible: boolean;
  onClose: () => void;
}

export function AuthModal({ visible, onClose }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setUsername("");
    setConfirmPassword("");
    setIsSignUp(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validateForm = () => {
    if (!email.trim()) {
      Alert.alert("エラー", "メールアドレスを入力してください");
      return false;
    }

    if (!password.trim()) {
      Alert.alert("エラー", "パスワードを入力してください");
      return false;
    }

    if (password.length < 6) {
      Alert.alert("エラー", "パスワードは6文字以上で入力してください");
      return false;
    }

    if (isSignUp) {
      if (!username.trim()) {
        Alert.alert("エラー", "ユーザー名を入力してください");
        return false;
      }

      if (password !== confirmPassword) {
        Alert.alert("エラー", "パスワードが一致しません");
        return false;
      }
    }

    return true;
  };

  const handleAuth = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      if (isSignUp) {
        await signUp(email.trim(), password, username.trim());
        Alert.alert(
          "登録完了",
          "メールアドレスに確認リンクを送信しました。メールを確認してアカウントを有効化してください。",
          [{ text: "OK", onPress: handleClose }]
        );
      } else {
        await signIn(email.trim(), password);
        Alert.alert("ログイン成功", "ようこそ！", [
          { text: "OK", onPress: handleClose },
        ]);
      }
    } catch (error) {
      console.error("Auth error:", error);

      let errorMessage = "不明なエラーが発生しました";

      if (error instanceof Error) {
        switch (error.message) {
          case "Invalid login credentials":
            errorMessage = "メールアドレスまたはパスワードが正しくありません";
            break;
          case "User already registered":
            errorMessage = "このメールアドレスは既に登録されています";
            break;
          case "Email not confirmed":
            errorMessage =
              "メールアドレスが確認されていません。メールをご確認ください";
            break;
          default:
            errorMessage = error.message;
        }
      }

      Alert.alert("エラー", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setPassword("");
    setConfirmPassword("");
    setUsername("");
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View className="flex-1 bg-black">
          {/* Header */}
          <View className="flex-row items-center justify-between p-4 pt-12">
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
            <Text className="text-white text-lg font-bold">
              {isSignUp ? "アカウント作成" : "ログイン"}
            </Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView className="flex-1 px-6">
            <View className="py-8">
              <Text className="text-white text-2xl font-bold mb-2 text-center">
                {isSignUp ? "Podlyへようこそ" : "おかえりなさい"}
              </Text>
              <Text className="text-gray-400 text-center mb-8">
                {isSignUp
                  ? "新しいアカウントを作成してください"
                  : "アカウントにログインしてください"}
              </Text>

              {/* Username field (signup only) */}
              {isSignUp && (
                <View className="mb-4">
                  <Text className="text-white mb-2 font-medium">
                    ユーザー名
                  </Text>
                  <TextInput
                    className="bg-gray-800 text-white p-4 rounded-lg border border-gray-700"
                    placeholder="ユーザー名を入力"
                    placeholderTextColor="#9CA3AF"
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              )}

              {/* Email field */}
              <View className="mb-4">
                <Text className="text-white mb-2 font-medium">
                  メールアドレス
                </Text>
                <TextInput
                  className="bg-gray-800 text-white p-4 rounded-lg border border-gray-700"
                  placeholder="メールアドレスを入力"
                  placeholderTextColor="#9CA3AF"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              {/* Password field */}
              <View className="mb-4">
                <Text className="text-white mb-2 font-medium">パスワード</Text>
                <TextInput
                  className="bg-gray-800 text-white p-4 rounded-lg border border-gray-700"
                  placeholder="パスワードを入力（6文字以上）"
                  placeholderTextColor="#9CA3AF"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>

              {/* Confirm password field (signup only) */}
              {isSignUp && (
                <View className="mb-6">
                  <Text className="text-white mb-2 font-medium">
                    パスワード確認
                  </Text>
                  <TextInput
                    className="bg-gray-800 text-white p-4 rounded-lg border border-gray-700"
                    placeholder="パスワードを再入力"
                    placeholderTextColor="#9CA3AF"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                  />
                </View>
              )}

              {/* Submit button */}
              <TouchableOpacity
                className={`p-4 rounded-lg mb-4 ${
                  loading ? "bg-gray-600" : "bg-red-500"
                }`}
                onPress={handleAuth}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white text-center font-bold text-lg">
                    {isSignUp ? "アカウント作成" : "ログイン"}
                  </Text>
                )}
              </TouchableOpacity>

              {/* Toggle mode */}
              <TouchableOpacity onPress={toggleMode} disabled={loading}>
                <Text className="text-gray-400 text-center">
                  {isSignUp
                    ? "すでにアカウントをお持ちですか？ ログイン"
                    : "アカウントをお持ちでない方は アカウント作成"}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
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
      <View className="flex-1 bg-black items-center justify-center">
        <ActivityIndicator size="large" color="white" />
        <Text className="text-white mt-4">読み込み中...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        {fallback || (
          <View className="flex-1 bg-black items-center justify-center">
            <Text className="text-white text-xl mb-4">ログインが必要です</Text>
            <TouchableOpacity
              className="bg-red-500 px-8 py-3 rounded-lg"
              onPress={() => setShowAuthModal(true)}
            >
              <Text className="text-white font-bold">ログイン</Text>
            </TouchableOpacity>
          </View>
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
