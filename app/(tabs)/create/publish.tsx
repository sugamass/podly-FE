import Colors from "@/constants/Colors";
import { createPodcast } from "@/services/supabase";
import { useAuthStore } from "@/store/authStore";
import { AudioSection } from "@/types/audio";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CreatePublishScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuthStore();

  // 音声生成画面から渡されるデータ
  const script = (params.script as string) || "";
  const selectedVoice = (params.voice as string) || "";
  const audioSections: AudioSection[] = params.audioSections
    ? JSON.parse(params.audioSections as string)
    : [];

  // 配信設定
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);

  // 配信処理
  const handlePublish = async () => {
    try {
      // バリデーション
      if (!title.trim()) {
        Alert.alert("エラー", "タイトルを入力してください");
        return;
      }

      // ログイン状態の確認
      if (!user) {
        Alert.alert("エラー", "ログインが必要です");
        return;
      }

      setIsPublishing(true);

      // ポッドキャスト作成データを準備
      const podcastData = {
        title: title.trim(),
        script: script,
        description: description.trim(),
        selectedVoice: selectedVoice,
        audioSections: audioSections,
        creatorId: user.id,
      };

      // ポッドキャスト作成関数を呼び出し
      const result = await createPodcast(podcastData);

      if (!result.success) {
        throw new Error(result.error || "ポッドキャストの作成に失敗しました");
      }

      Alert.alert("配信完了", "ポッドキャストが正常に配信されました！", [
        {
          text: "ホームに戻る",
          onPress: () => router.push("/(tabs)"),
        },
      ]);
    } catch (error) {
      console.error("Publish error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "配信に失敗しました";
      Alert.alert("エラー", errorMessage);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.dark.background }}>
      <Stack.Screen
        options={{
          title: "配信設定",
          headerStyle: { backgroundColor: Colors.dark.background },
          headerTintColor: Colors.dark.text,
          headerTitleStyle: { fontWeight: "bold" },
        }}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={{ flex: 1, padding: 20 }}
          showsVerticalScrollIndicator={false}
        >
          {/* ヘッダーセクション */}
          <View style={{ marginBottom: 32 }}>
            <Text
              style={{
                fontSize: 24,
                fontWeight: "bold",
                color: Colors.dark.text,
                textAlign: "center",
                marginBottom: 8,
              }}
            >
              📻 配信設定
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: Colors.dark.subtext,
                textAlign: "center",
                lineHeight: 22,
              }}
            >
              タイトルを設定して
              {"\n"}ポッドキャストを配信しましょう
            </Text>
          </View>

          {/* タイトル入力セクション */}
          <View
            style={{
              backgroundColor: Colors.dark.card,
              borderRadius: 16,
              padding: 20,
              marginBottom: 24,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                color: Colors.dark.text,
                marginBottom: 12,
              }}
            >
              🎧 タイトル *
            </Text>

            <TextInput
              style={{
                backgroundColor: Colors.dark.background,
                borderRadius: 12,
                padding: 16,
                color: Colors.dark.text,
                fontSize: 16,
                borderWidth: 1,
                borderColor: Colors.dark.border,
              }}
              placeholder="例：「量子コンピュータの基礎知識」"
              placeholderTextColor={Colors.dark.subtext}
              value={title}
              onChangeText={setTitle}
              maxLength={100}
            />

            <Text
              style={{
                fontSize: 12,
                color: Colors.dark.subtext,
                textAlign: "right",
                marginTop: 8,
              }}
            >
              {title.length}/100文字
            </Text>
          </View>

          {/* 説明文入力セクション */}
          <View
            style={{
              backgroundColor: Colors.dark.card,
              borderRadius: 16,
              padding: 20,
              marginBottom: 24,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                color: Colors.dark.text,
                marginBottom: 12,
              }}
            >
              📝 説明文（任意）
            </Text>

            <TextInput
              style={{
                backgroundColor: Colors.dark.background,
                borderRadius: 12,
                padding: 16,
                color: Colors.dark.text,
                fontSize: 16,
                borderWidth: 1,
                borderColor: Colors.dark.border,
                minHeight: 100,
                textAlignVertical: "top",
              }}
              placeholder="このポッドキャストの内容や見どころを入力してください..."
              placeholderTextColor={Colors.dark.subtext}
              value={description}
              onChangeText={setDescription}
              multiline
              maxLength={500}
            />

            <Text
              style={{
                fontSize: 12,
                color: Colors.dark.subtext,
                textAlign: "right",
                marginTop: 8,
              }}
            >
              {description.length}/500文字
            </Text>
          </View>

          {/* 配信内容確認セクション */}
          <View
            style={{
              backgroundColor: Colors.dark.card,
              borderRadius: 16,
              padding: 20,
              marginBottom: 32,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                color: Colors.dark.text,
                marginBottom: 16,
              }}
            >
              📋 配信内容確認
            </Text>

            {audioSections.length > 0 && audioSections[0]?.duration && (
              <View style={{ marginBottom: 12 }}>
                <Text
                  style={{
                    fontSize: 14,
                    color: Colors.dark.subtext,
                    marginBottom: 4,
                  }}
                >
                  音声時間:
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    color: Colors.dark.text,
                    fontWeight: "500",
                  }}
                >
                  {Math.floor(audioSections[0].duration / 60)}分
                  {Math.floor(audioSections[0].duration % 60)}秒
                </Text>
              </View>
            )}
          </View>

          {/* 配信ボタン */}
          <TouchableOpacity
            style={{
              marginBottom: 32,
              borderRadius: 16,
              overflow: "hidden",
              opacity: isPublishing ? 0.7 : 1,
            }}
            onPress={handlePublish}
            disabled={isPublishing}
          >
            <LinearGradient
              colors={[Colors.dark.success, Colors.dark.primary]}
              style={{
                paddingVertical: 18,
                paddingHorizontal: 24,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {isPublishing ? (
                <>
                  <Ionicons
                    name="sync"
                    size={20}
                    color={Colors.dark.text}
                    style={{ marginRight: 8 }}
                  />
                  <Text
                    style={{
                      color: Colors.dark.text,
                      fontSize: 18,
                      fontWeight: "bold",
                    }}
                  >
                    配信中...
                  </Text>
                </>
              ) : (
                <>
                  <Ionicons
                    name="radio"
                    size={20}
                    color={Colors.dark.text}
                    style={{ marginRight: 8 }}
                  />
                  <Text
                    style={{
                      color: Colors.dark.text,
                      fontSize: 18,
                      fontWeight: "bold",
                    }}
                  >
                    配信する
                  </Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
