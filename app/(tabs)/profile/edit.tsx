import { useAuth } from "@/hooks/useAuth";
import { deleteAvatar, uploadAvatar } from "@/utils/uploadImage";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
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
    fullName: profile?.display_name || "",
    bio: profile?.bio || "",
  });

  const handleSave = async () => {
    try {
      setLoading(true);

      // バリデーション
      if (!formData.username.trim()) {
        Alert.alert("エラー", "ユーザー名を入力してください");
        setLoading(false);
        return;
      }

      if (formData.username.length < 3) {
        Alert.alert("エラー", "ユーザー名は3文字以上で入力してください");
        setLoading(false);
        return;
      }

      // ユーザー名の形式チェック（英数字とアンダースコアのみ）
      const usernameRegex = /^[a-zA-Z0-9_]+$/;
      if (!usernameRegex.test(formData.username)) {
        Alert.alert(
          "エラー",
          "ユーザー名は英数字とアンダースコアのみ使用できます"
        );
        setLoading(false);
        return;
      }

      let finalAvatarUrl: string | null = null;

      // 新しい画像がある場合はアップロード
      if (newAvatarUri && user?.id) {
        try {
          // 古い画像を削除（ある場合）
          if (profile?.avatar_url) {
            await deleteAvatar(profile.avatar_url);
          }

          // 新しい画像をアップロード
          finalAvatarUrl = await uploadAvatar(newAvatarUri, user.id);
        } catch (uploadError: any) {
          console.error("Image upload process failed:", uploadError);

          // エラーの種類に応じて適切な処理を行う
          if (uploadError.message?.includes("Storage upload failed")) {
            // Supabase Storage の実際のエラー
            Alert.alert(
              "エラー",
              "画像のアップロードに失敗しました。もう一度お試しください。"
            );
            setLoading(false);
            return; // プロフィール更新を中止
          } else if (uploadError.message?.includes("Network")) {
            // ネットワークエラー
            Alert.alert(
              "エラー",
              "ネットワークエラーが発生しました。接続を確認してもう一度お試しください。"
            );
            setLoading(false);
            return; // プロフィール更新を中止
          } else {
            // その他のエラー（一般的にはファイル読み込みエラーなど）
            Alert.alert(
              "警告",
              "画像のアップロードに問題が発生しましたが、その他の情報は保存されます"
            );
            finalAvatarUrl = avatarUri; // 既存の画像URLを保持
          }
        }
      }

      const updates = {
        username: formData.username.trim(),
        display_name: formData.fullName.trim() || null,
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
    <SafeAreaView className="flex-1 bg-[#121620]">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="flex-1">
            {/* ヘッダー */}
            <View className="flex-row items-center justify-between px-4 py-3 border-b border-[#1E2430]">
              <TouchableOpacity
                className="p-2 min-w-[60px]"
                onPress={() => router.back()}
              >
                <Ionicons
                  name="arrow-back"
                  size={24}
                  color="#FFFFFF"
                />
              </TouchableOpacity>

              <Text className="text-white text-lg font-semibold">プロフィール編集</Text>

              <TouchableOpacity
                className={`p-2 min-w-[60px] rounded-xl px-4 py-2 ${
                  loading ? 'bg-[#A0A7B5]' : 'bg-[#4F7CFF]'
                }`}
                onPress={handleSave}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text className="text-white text-sm font-semibold text-center">保存</Text>
                )}
              </TouchableOpacity>
            </View>

            <ScrollView
              className="flex-1"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 50 }}
            >
              {/* アバター編集 */}
              <View className="items-center py-8 px-5">
                <TouchableOpacity
                  onPress={showImagePicker}
                  className="relative"
                >
                  <Image
                    source={{
                      uri:
                        avatarUri ||
                        "https://via.placeholder.com/120x120?text=Avatar",
                    }}
                    style={{
                      width: 120,
                      height: 120,
                      borderRadius: 60,
                      borderWidth: 3,
                      borderColor: '#4F7CFF',
                    }}
                  />
                  <View className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-[#4F7CFF] justify-center items-center border-3 border-[#121620]">
                    <Ionicons
                      name="camera"
                      size={24}
                      color="#FFFFFF"
                    />
                  </View>
                </TouchableOpacity>
                <Text className="text-[#A0A7B5] text-sm mt-3">タップして写真を変更</Text>
              </View>

              {/* フォーム */}
              <View className="px-5">
                {/* ユーザー名 */}
                <View className="mb-6">
                  <Text className="text-white text-base font-semibold mb-2">ユーザー名 *</Text>
                  <TextInput
                    className="bg-[#1E2430] rounded-xl px-4 py-4 text-white text-base border border-[#1E2430]"
                    value={formData.username}
                    onChangeText={(text) =>
                      setFormData((prev) => ({
                        ...prev,
                        username: text.toLowerCase(),
                      }))
                    }
                    placeholder="ユーザー名を入力"
                    placeholderTextColor="#A0A7B5"
                    autoCapitalize="none"
                    autoCorrect={false}
                    maxLength={30}
                  />
                  <Text className="text-[#A0A7B5] text-xs mt-1">
                    英数字とアンダースコアのみ使用可能（3文字以上）
                  </Text>
                </View>

                {/* 表示名 */}
                <View className="mb-6">
                  <Text className="text-white text-base font-semibold mb-2">表示名</Text>
                  <TextInput
                    className="bg-[#1E2430] rounded-xl px-4 py-4 text-white text-base border border-[#1E2430]"
                    value={formData.fullName}
                    onChangeText={(text) =>
                      setFormData((prev) => ({ ...prev, fullName: text }))
                    }
                    placeholder="表示名を入力"
                    placeholderTextColor="#A0A7B5"
                    maxLength={50}
                  />
                </View>

                {/* 自己紹介 */}
                <View className="mb-6">
                  <Text className="text-white text-base font-semibold mb-2">自己紹介</Text>
                  <TextInput
                    className="bg-[#1E2430] rounded-xl px-4 py-4 text-white text-base border border-[#1E2430] h-24 pt-4"
                    value={formData.bio}
                    onChangeText={(text) =>
                      setFormData((prev) => ({ ...prev, bio: text }))
                    }
                    placeholder="自己紹介を入力"
                    placeholderTextColor="#A0A7B5"
                    multiline
                    numberOfLines={4}
                    maxLength={200}
                    textAlignVertical="top"
                  />
                  <Text className="text-[#A0A7B5] text-xs text-right mt-1">
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

