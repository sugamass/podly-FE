import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
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
import Colors from "../constants/Colors";

type AudioSection = {
  id: string;
  text: string;
  audioUrl?: string;
};

export default function CreatePublishScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // 音声生成画面から渡されるデータ
  const script = (params.script as string) || "";
  const selectedVoice = (params.voice as string) || "";
  const audioSections: AudioSection[] = params.audioSections
    ? JSON.parse(params.audioSections as string)
    : [];

  // 配信設定
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState<string[]>([""]);
  const [description, setDescription] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);

  // タグ管理
  const addTag = () => {
    if (tags.length < 5) {
      setTags([...tags, ""]);
    }
  };

  const removeTag = (index: number) => {
    if (tags.length > 1) {
      const newTags = tags.filter((_, i) => i !== index);
      setTags(newTags);
    }
  };

  const updateTag = (index: number, value: string) => {
    const newTags = [...tags];
    newTags[index] = value;
    setTags(newTags);
  };

  // 配信処理
  const handlePublish = async () => {
    if (!title.trim()) {
      Alert.alert("エラー", "タイトルを入力してください");
      return;
    }

    const validTags = tags.filter((tag) => tag.trim() !== "");
    if (validTags.length === 0) {
      Alert.alert("エラー", "少なくとも1つのタグを入力してください");
      return;
    }

    setIsPublishing(true);

    // TODO: 実際の配信API呼び出しを実装
    setTimeout(() => {
      setIsPublishing(false);
      Alert.alert("配信完了", "ポッドキャストが正常に配信されました！", [
        {
          text: "ホームに戻る",
          onPress: () => router.push("/(tabs)"),
        },
      ]);
    }, 2000);
  };

  // 推奨タグの提案
  const suggestedTags = [
    "テクノロジー",
    "ビジネス",
    "エンタメ",
    "教育",
    "ライフスタイル",
  ];

  const addSuggestedTag = (suggestedTag: string) => {
    const emptyTagIndex = tags.findIndex((tag) => tag.trim() === "");
    if (emptyTagIndex !== -1) {
      updateTag(emptyTagIndex, suggestedTag);
    } else if (tags.length < 5) {
      setTags([...tags, suggestedTag]);
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
              タイトルやタグを設定して
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

          {/* タグ入力セクション */}
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
              🏷️ タグ設定 * （最大5個）
            </Text>

            {/* タグ入力フォーム */}
            {tags.map((tag, index) => (
              <View
                key={index}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <TextInput
                  style={{
                    backgroundColor: Colors.dark.background,
                    borderRadius: 12,
                    padding: 16,
                    color: Colors.dark.text,
                    fontSize: 16,
                    borderWidth: 1,
                    borderColor: Colors.dark.border,
                    flex: 1,
                  }}
                  placeholder={`タグ ${index + 1}`}
                  placeholderTextColor={Colors.dark.subtext}
                  value={tag}
                  onChangeText={(value) => updateTag(index, value)}
                  maxLength={20}
                />

                {tags.length > 1 && (
                  <TouchableOpacity
                    style={{
                      backgroundColor: Colors.dark.background,
                      borderRadius: 8,
                      padding: 8,
                      marginLeft: 8,
                      borderWidth: 1,
                      borderColor: Colors.dark.border,
                    }}
                    onPress={() => removeTag(index)}
                  >
                    <Ionicons
                      name="close"
                      size={16}
                      color={Colors.dark.subtext}
                    />
                  </TouchableOpacity>
                )}
              </View>
            ))}

            {/* タグ追加ボタン */}
            {tags.length < 5 && (
              <TouchableOpacity
                style={{
                  backgroundColor: "transparent",
                  borderRadius: 12,
                  padding: 16,
                  borderWidth: 2,
                  borderColor: Colors.dark.primary,
                  borderStyle: "dashed",
                  alignItems: "center",
                  marginBottom: 16,
                }}
                onPress={addTag}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Ionicons
                    name="add"
                    size={20}
                    color={Colors.dark.primary}
                    style={{ marginRight: 8 }}
                  />
                  <Text
                    style={{
                      color: Colors.dark.primary,
                      fontSize: 16,
                      fontWeight: "600",
                    }}
                  >
                    タグを追加
                  </Text>
                </View>
              </TouchableOpacity>
            )}

            {/* 推奨タグ */}
            <View>
              <Text
                style={{
                  fontSize: 14,
                  color: Colors.dark.subtext,
                  marginBottom: 8,
                }}
              >
                推奨タグ:
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {suggestedTags.map((suggestedTag) => (
                  <TouchableOpacity
                    key={suggestedTag}
                    style={{
                      backgroundColor: Colors.dark.background,
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 16,
                      borderWidth: 1,
                      borderColor: Colors.dark.border,
                    }}
                    onPress={() => addSuggestedTag(suggestedTag)}
                    disabled={tags.includes(suggestedTag) || tags.length >= 5}
                  >
                    <Text
                      style={{
                        color: tags.includes(suggestedTag)
                          ? Colors.dark.subtext
                          : Colors.dark.text,
                        fontSize: 12,
                        fontWeight: "500",
                      }}
                    >
                      {suggestedTag}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
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

            <View style={{ marginBottom: 12 }}>
              <Text
                style={{
                  fontSize: 14,
                  color: Colors.dark.subtext,
                  marginBottom: 4,
                }}
              >
                ボイス:
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  color: Colors.dark.text,
                  fontWeight: "500",
                }}
              >
                {selectedVoice || "未選択"}
              </Text>
            </View>

            <View style={{ marginBottom: 12 }}>
              <Text
                style={{
                  fontSize: 14,
                  color: Colors.dark.subtext,
                  marginBottom: 4,
                }}
              >
                セクション数:
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  color: Colors.dark.text,
                  fontWeight: "500",
                }}
              >
                {audioSections.length}個
              </Text>
            </View>

            <View>
              <Text
                style={{
                  fontSize: 14,
                  color: Colors.dark.subtext,
                  marginBottom: 4,
                }}
              >
                原稿文字数:
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  color: Colors.dark.text,
                  fontWeight: "500",
                }}
              >
                {script.length}文字
              </Text>
            </View>
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
