import Colors from "@/constants/Colors";
import { useAuth } from "@/hooks/useAuth";
import { deleteAvatar, uploadAvatar } from "@/utils/uploadImage";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

export default function EditProfileScreen() {
  const { user, profile, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [avatarUri, setAvatarUri] = useState(profile?.avatar_url || "");
  const [newAvatarUri, setNewAvatarUri] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    username: profile?.username || "",
    fullName: profile?.full_name || "",
    bio: profile?.bio || "",
  });

  const handleSave = async () => {
    try {
      setLoading(true);

      // バリデーション
      if (!formData.username.trim()) {
        Alert.alert("エラー", "ユーザー名を入力してください");
        return;
      }

      if (formData.username.length < 3) {
        Alert.alert("エラー", "ユーザー名は3文字以上で入力してください");
        return;
      }

      // ユーザー名の形式チェック（英数字とアンダースコアのみ）
      const usernameRegex = /^[a-zA-Z0-9_]+$/;
      if (!usernameRegex.test(formData.username)) {
        Alert.alert(
          "エラー",
          "ユーザー名は英数字とアンダースコアのみ使用できます"
        );
        return;
      }

      let finalAvatarUrl = avatarUri;

      // 新しい画像がある場合はアップロード
      if (newAvatarUri && user?.id) {
        try {
          // 古い画像を削除（ある場合）
          if (profile?.avatar_url) {
            await deleteAvatar(profile.avatar_url);
          }

          // 新しい画像をアップロード
          finalAvatarUrl = await uploadAvatar(newAvatarUri, user.id);
        } catch (uploadError) {
          console.error("Image upload failed:", uploadError);
          Alert.alert(
            "警告",
            "画像のアップロードに失敗しましたが、その他の情報は保存されます"
          );
          finalAvatarUrl = avatarUri; // 既存の画像URLを保持
        }
      }

      const updates = {
        username: formData.username.trim(),
        full_name: formData.fullName.trim() || null,
        bio: formData.bio.trim() || null,
        avatar_url: finalAvatarUrl || null,
      };

      await updateProfile(updates);

      Alert.alert("成功", "プロフィールを更新しました", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      console.error("Profile update error:", error);

      // エラーメッセージの処理
      let errorMessage = "プロフィールの更新に失敗しました";
      if (error.message?.includes("duplicate")) {
        errorMessage = "このユーザー名は既に使用されています";
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert("エラー", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      // 権限の確認
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert(
          "権限が必要です",
          "画像を選択するには写真ライブラリへのアクセス権限が必要です"
        );
        return;
      }

      // 画像選択
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        allowsMultipleSelection: false,
      });

      if (!result.canceled && result.assets[0]) {
        setNewAvatarUri(result.assets[0].uri);
        setAvatarUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Image picker error:", error);
      Alert.alert("エラー", "画像の選択に失敗しました");
    }
  };

  const takePhoto = async () => {
    try {
      // 権限の確認
      const permissionResult =
        await ImagePicker.requestCameraPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert(
          "権限が必要です",
          "写真を撮影するにはカメラへのアクセス権限が必要です"
        );
        return;
      }

      // 写真撮影
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setNewAvatarUri(result.assets[0].uri);
        setAvatarUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Camera error:", error);
      Alert.alert("エラー", "写真の撮影に失敗しました");
    }
  };

  const showImagePicker = () => {
    Alert.alert("プロフィール写真を変更", "写真を選択してください", [
      { text: "カメラで撮影", onPress: takePhoto },
      { text: "ライブラリから選択", onPress: pickImage },
      { text: "キャンセル", style: "cancel" },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.touchableContent}>
            {/* ヘッダー */}
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={() => router.back()}
              >
                <Ionicons
                  name="arrow-back"
                  size={24}
                  color={Colors.dark.text}
                />
              </TouchableOpacity>

              <Text style={styles.headerTitle}>プロフィール編集</Text>

              <TouchableOpacity
                style={[
                  styles.headerButton,
                  styles.saveButton,
                  loading && styles.saveButtonDisabled,
                ]}
                onPress={handleSave}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={Colors.dark.text} />
                ) : (
                  <Text style={styles.saveButtonText}>保存</Text>
                )}
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.scrollView}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              {/* アバター編集 */}
              <View style={styles.avatarSection}>
                <TouchableOpacity
                  onPress={showImagePicker}
                  style={styles.avatarContainer}
                >
                  <Image
                    source={{
                      uri:
                        avatarUri ||
                        "https://via.placeholder.com/120x120?text=Avatar",
                    }}
                    style={styles.avatar}
                  />
                  <View style={styles.avatarOverlay}>
                    <Ionicons
                      name="camera"
                      size={24}
                      color={Colors.dark.text}
                    />
                  </View>
                </TouchableOpacity>
                <Text style={styles.avatarHint}>タップして写真を変更</Text>
              </View>

              {/* フォーム */}
              <View style={styles.formSection}>
                {/* ユーザー名 */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>ユーザー名 *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.username}
                    onChangeText={(text) =>
                      setFormData((prev) => ({
                        ...prev,
                        username: text.toLowerCase(),
                      }))
                    }
                    placeholder="ユーザー名を入力"
                    placeholderTextColor={Colors.dark.inactive}
                    autoCapitalize="none"
                    autoCorrect={false}
                    maxLength={30}
                  />
                  <Text style={styles.hint}>
                    英数字とアンダースコアのみ使用可能（3文字以上）
                  </Text>
                </View>

                {/* 表示名 */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>表示名</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.fullName}
                    onChangeText={(text) =>
                      setFormData((prev) => ({ ...prev, fullName: text }))
                    }
                    placeholder="表示名を入力"
                    placeholderTextColor={Colors.dark.inactive}
                    maxLength={50}
                  />
                </View>

                {/* 自己紹介 */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>自己紹介</Text>
                  <TextInput
                    style={[styles.input, styles.bioInput]}
                    value={formData.bio}
                    onChangeText={(text) =>
                      setFormData((prev) => ({ ...prev, bio: text }))
                    }
                    placeholder="自己紹介を入力"
                    placeholderTextColor={Colors.dark.inactive}
                    multiline
                    numberOfLines={4}
                    maxLength={200}
                    textAlignVertical="top"
                  />
                  <Text style={styles.charCount}>
                    {formData.bio.length}/200
                  </Text>
                </View>
              </View>
            </ScrollView>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  headerButton: {
    padding: 8,
    minWidth: 60,
  },
  headerTitle: {
    color: Colors.dark.text,
    fontSize: 18,
    fontWeight: "600",
  },
  saveButton: {
    backgroundColor: Colors.dark.primary,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  saveButtonDisabled: {
    backgroundColor: Colors.dark.inactive,
  },
  saveButtonText: {
    color: Colors.dark.text,
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 50,
  },
  avatarSection: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: Colors.dark.primary,
  },
  avatarOverlay: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.dark.primary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: Colors.dark.background,
  },
  avatarHint: {
    color: Colors.dark.subtext,
    fontSize: 14,
    marginTop: 12,
  },
  formSection: {
    paddingHorizontal: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    color: Colors.dark.text,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: Colors.dark.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  bioInput: {
    height: 100,
    paddingTop: 14,
  },
  hint: {
    color: Colors.dark.inactive,
    fontSize: 12,
    marginTop: 4,
  },
  charCount: {
    color: Colors.dark.inactive,
    fontSize: 12,
    textAlign: "right",
    marginTop: 4,
  },
  touchableContent: {
    flex: 1,
  },
});
