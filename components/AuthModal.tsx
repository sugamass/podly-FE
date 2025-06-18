import Colors from "@/constants/Colors";
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
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

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
    if (!allowClose) return; // モーダルを閉じることが許可されていない場合
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
          [{ text: "OK" }]
        );
      } else {
        await signIn(email.trim(), password);
        // ログイン成功時はアラートを表示せず、自動的にアプリに入る
        handleClose();
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
      onRequestClose={allowClose ? handleClose : undefined}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            {allowClose ? (
              <TouchableOpacity onPress={handleClose}>
                <Ionicons name="close" size={24} color={Colors.dark.text} />
              </TouchableOpacity>
            ) : (
              <View style={{ width: 24 }} />
            )}
            <Text style={styles.headerTitle}>
              {isSignUp ? "アカウント作成" : "ログイン"}
            </Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={styles.scrollView}>
            <View style={styles.content}>
              <Text style={styles.title}>
                {isSignUp ? "Podlyへようこそ" : "おかえりなさい"}
              </Text>
              <Text style={styles.subtitle}>
                {isSignUp
                  ? "新しいアカウントを作成してください"
                  : "アカウントにログインしてください"}
              </Text>

              {/* Username field (signup only) */}
              {isSignUp && (
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>ユーザー名</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="ユーザー名を入力"
                    placeholderTextColor={Colors.dark.inactive}
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              )}

              {/* Email field */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>メールアドレス</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="メールアドレスを入力"
                  placeholderTextColor={Colors.dark.inactive}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              {/* Password field */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>パスワード</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="パスワードを入力（6文字以上）"
                  placeholderTextColor={Colors.dark.inactive}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>

              {/* Confirm password field (signup only) */}
              {isSignUp && (
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>パスワード確認</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="パスワードを再入力"
                    placeholderTextColor={Colors.dark.inactive}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                  />
                </View>
              )}

              {/* Submit button */}
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  loading && styles.submitButtonDisabled,
                ]}
                onPress={handleAuth}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={Colors.dark.text} />
                ) : (
                  <Text style={styles.submitButtonText}>
                    {isSignUp ? "アカウント作成" : "ログイン"}
                  </Text>
                )}
              </TouchableOpacity>

              {/* Toggle mode */}
              <TouchableOpacity
                onPress={toggleMode}
                disabled={loading}
                style={styles.toggleButton}
              >
                <Text style={styles.toggleText}>
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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.dark.primary} />
        <Text style={styles.loadingText}>読み込み中...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        {fallback || (
          <View style={styles.authRequiredContainer}>
            <Text style={styles.authRequiredTitle}>ログインが必要です</Text>
            <TouchableOpacity
              style={styles.authRequiredButton}
              onPress={() => setShowAuthModal(true)}
            >
              <Text style={styles.authRequiredButtonText}>ログイン</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 16,
  },
  headerTitle: {
    color: Colors.dark.text,
    fontSize: 18,
    fontWeight: "bold",
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 24,
  },
  content: {
    paddingVertical: 32,
  },
  title: {
    color: Colors.dark.text,
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    color: Colors.dark.subtext,
    fontSize: 16,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    color: Colors.dark.text,
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: Colors.dark.card,
    color: Colors.dark.text,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: Colors.dark.primary,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    marginTop: 8,
  },
  submitButtonDisabled: {
    backgroundColor: Colors.dark.inactive,
  },
  submitButtonText: {
    color: Colors.dark.text,
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 18,
  },
  toggleButton: {
    paddingVertical: 8,
  },
  toggleText: {
    color: Colors.dark.subtext,
    textAlign: "center",
    fontSize: 14,
  },
  forceSignUpText: {
    color: Colors.dark.inactive,
    textAlign: "center",
    fontSize: 14,
  },
  firstTimeUserInfo: {
    color: Colors.dark.subtext,
    textAlign: "center",
    fontSize: 12,
    marginTop: 12,
    lineHeight: 18,
    paddingHorizontal: 8,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.dark.background,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: Colors.dark.text,
    marginTop: 16,
    fontSize: 16,
  },
  authRequiredContainer: {
    flex: 1,
    backgroundColor: Colors.dark.background,
    alignItems: "center",
    justifyContent: "center",
  },
  authRequiredTitle: {
    color: Colors.dark.text,
    fontSize: 20,
    marginBottom: 16,
  },
  authRequiredButton: {
    backgroundColor: Colors.dark.primary,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
  },
  authRequiredButtonText: {
    color: Colors.dark.text,
    fontWeight: "bold",
    fontSize: 16,
  },
});
