import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Colors from "../constants/Colors";

type DurationOption = "1分" | "2分" | "3分";
type ToneOption = "カジュアル" | "フォーマル" | "論理的" | "ユーモア";

export default function CreateScriptScreen() {
  const router = useRouter();
  const [theme, setTheme] = useState("");
  const [referenceUrls, setReferenceUrls] = useState<string[]>([""]);
  const [webSearch, setWebSearch] = useState(true);
  const [duration, setDuration] = useState<DurationOption>("2分");
  const [tone, setTone] = useState<ToneOption>("カジュアル");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedScript, setGeneratedScript] = useState("");
  const [isScriptGenerated, setIsScriptGenerated] = useState(false);

  const durationOptions: DurationOption[] = ["1分", "2分", "3分"];
  const toneOptions: ToneOption[] = [
    "カジュアル",
    "フォーマル",
    "論理的",
    "ユーモア",
  ];

  const addUrlField = () => {
    setReferenceUrls([...referenceUrls, ""]);
  };

  const removeUrlField = (index: number) => {
    if (referenceUrls.length > 1) {
      const newUrls = referenceUrls.filter((_, i) => i !== index);
      setReferenceUrls(newUrls);
    }
  };

  const updateUrl = (index: number, value: string) => {
    const newUrls = [...referenceUrls];
    newUrls[index] = value;
    setReferenceUrls(newUrls);
  };

  const handleGenerateScript = async () => {
    const validUrls = referenceUrls.filter((url) => url.trim() !== "");

    if (!theme.trim() && validUrls.length === 0) {
      Alert.alert("エラー", "テーマまたは参考URLのいずれかを入力してください");
      return;
    }

    setIsGenerating(true);
    // TODO: 実際のAPI呼び出しを実装
    setTimeout(() => {
      setIsGenerating(false);
      setIsScriptGenerated(true);
      setGeneratedScript(
        `こんにちは、今日は${
          theme || "指定されたURL"
        }について話していきます。\n\n` +
          `最近の研究によると、この分野では多くの興味深い発見がありました。` +
          `まず第一に、基本的な概念について説明します。\n\n` +
          `詳細については、以下の点が重要です：\n` +
          `1. 基本的な理解\n` +
          `2. 実際の応用例\n` +
          `3. 今後の展望\n\n` +
          `これらの情報を踏まえて、今後の発展が期待されています。\n` +
          `ご清聴ありがとうございました。`
      );
    }, 2000);
  };

  const handleRegenerateScript = () => {
    Alert.alert(
      "再生成の確認",
      "現在の原稿を破棄して、新しい原稿を生成しますか？",
      [
        { text: "キャンセル", style: "cancel" },
        { text: "再生成", onPress: handleGenerateScript },
      ]
    );
  };

  const handleGenerateAudio = () => {
    if (!generatedScript.trim()) {
      Alert.alert("エラー", "原稿が空です");
      return;
    }

    // 音声生成画面への遷移
    router.push({
      pathname: "/create-audio",
      params: {
        script: generatedScript,
      },
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.dark.background }}>
      <Stack.Screen
        options={{
          title: "原稿を作成",
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
              🎙️ AI原稿作成
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: Colors.dark.subtext,
                textAlign: "center",
                lineHeight: 22,
              }}
            >
              テーマやURLから自動で
              {"\n"}ポッドキャスト原稿を生成します
            </Text>
          </View>

          {/* テーマ入力セクション */}
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
              📝 テーマ入力（任意）
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
                minHeight: 80,
                textAlignVertical: "top",
              }}
              placeholder="例：「量子コンピュータについてまとめて」"
              placeholderTextColor={Colors.dark.subtext}
              value={theme}
              onChangeText={setTheme}
              multiline
              maxLength={200}
            />

            <Text
              style={{
                fontSize: 12,
                color: Colors.dark.subtext,
                textAlign: "right",
                marginTop: 8,
              }}
            >
              {theme.length}/200文字
            </Text>
          </View>

          {/* 参考URL入力セクション */}
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
                marginBottom: 16,
              }}
            >
              🌐 参考URL（任意）
            </Text>

            {referenceUrls.map((url, index) => (
              <View
                key={index}
                style={{
                  marginBottom: index === referenceUrls.length - 1 ? 16 : 12,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <TextInput
                    style={{
                      flex: 1,
                      backgroundColor: Colors.dark.background,
                      borderRadius: 12,
                      padding: 16,
                      color: Colors.dark.text,
                      fontSize: 16,
                      borderWidth: 1,
                      borderColor: Colors.dark.border,
                      marginRight: referenceUrls.length > 1 ? 12 : 0,
                    }}
                    placeholder="https://example.com/article"
                    placeholderTextColor={Colors.dark.subtext}
                    value={url}
                    onChangeText={(value) => updateUrl(index, value)}
                    keyboardType="url"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />

                  {referenceUrls.length > 1 && (
                    <TouchableOpacity
                      onPress={() => removeUrlField(index)}
                      style={{
                        backgroundColor: Colors.dark.border,
                        borderRadius: 20,
                        width: 32,
                        height: 32,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Ionicons
                        name="close"
                        size={16}
                        color={Colors.dark.text}
                      />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}

            {/* +アイコンボタン */}
            <TouchableOpacity
              onPress={addUrlField}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: Colors.dark.background,
                borderRadius: 12,
                paddingVertical: 16,
                borderWidth: 1,
                borderColor: Colors.dark.border,
                borderStyle: "dashed",
                marginBottom: 12,
              }}
            >
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
                URLを追加
              </Text>
            </TouchableOpacity>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Ionicons
                name="information-circle"
                size={16}
                color={Colors.dark.subtext}
                style={{ marginRight: 8 }}
              />
              <Text
                style={{
                  fontSize: 12,
                  color: Colors.dark.subtext,
                  flex: 1,
                  lineHeight: 16,
                }}
              >
                記事、ブログ、ニュースサイトなどのURLを入力してください
              </Text>
            </View>
          </View>

          {/* Web検索設定 */}
          <View
            style={{
              backgroundColor: Colors.dark.card,
              borderRadius: 16,
              padding: 20,
              marginBottom: 24,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "bold",
                    color: Colors.dark.text,
                    marginBottom: 4,
                  }}
                >
                  🔍 Web検索
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: Colors.dark.subtext,
                    lineHeight: 20,
                  }}
                >
                  補助的に検索結果を使用して
                  {"\n"}より充実した原稿を作成
                </Text>
              </View>

              <Switch
                value={webSearch}
                onValueChange={setWebSearch}
                trackColor={{
                  false: Colors.dark.border,
                  true: Colors.dark.primary,
                }}
                thumbColor={webSearch ? Colors.dark.text : Colors.dark.subtext}
              />
            </View>
          </View>

          {/* 想定尺設定 */}
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
                marginBottom: 16,
              }}
            >
              ⏱️ 想定尺
            </Text>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              {durationOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={{
                    flex: 1,
                    marginHorizontal: 4,
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    borderRadius: 12,
                    backgroundColor:
                      duration === option
                        ? Colors.dark.primary
                        : Colors.dark.background,
                    borderWidth: 1,
                    borderColor:
                      duration === option
                        ? Colors.dark.primary
                        : Colors.dark.border,
                  }}
                  onPress={() => setDuration(option)}
                >
                  <Text
                    style={{
                      textAlign: "center",
                      color:
                        duration === option
                          ? Colors.dark.text
                          : Colors.dark.subtext,
                      fontWeight: duration === option ? "bold" : "normal",
                    }}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* トーン設定 */}
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
              🎯 トーン選択
            </Text>

            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                marginHorizontal: -4,
              }}
            >
              {toneOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={{
                    marginHorizontal: 4,
                    marginBottom: 8,
                    paddingVertical: 10,
                    paddingHorizontal: 16,
                    borderRadius: 20,
                    backgroundColor:
                      tone === option
                        ? Colors.dark.secondary
                        : Colors.dark.background,
                    borderWidth: 1,
                    borderColor:
                      tone === option
                        ? Colors.dark.secondary
                        : Colors.dark.border,
                  }}
                  onPress={() => setTone(option)}
                >
                  <Text
                    style={{
                      color:
                        tone === option
                          ? Colors.dark.text
                          : Colors.dark.subtext,
                      fontWeight: tone === option ? "bold" : "normal",
                    }}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 生成ボタン */}
          {!isScriptGenerated && (
            <TouchableOpacity
              style={{ marginBottom: 32 }}
              onPress={handleGenerateScript}
              disabled={isGenerating}
            >
              <LinearGradient
                colors={[Colors.dark.primary, Colors.dark.secondary]}
                style={{
                  paddingVertical: 18,
                  borderRadius: 16,
                  alignItems: "center",
                  opacity: isGenerating ? 0.7 : 1,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  {isGenerating ? (
                    <Ionicons
                      name="hourglass"
                      size={24}
                      color={Colors.dark.text}
                      style={{ marginRight: 8 }}
                    />
                  ) : (
                    <Ionicons
                      name="create"
                      size={24}
                      color={Colors.dark.text}
                      style={{ marginRight: 8 }}
                    />
                  )}
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "bold",
                      color: Colors.dark.text,
                    }}
                  >
                    {isGenerating ? "原稿を生成中..." : "原稿を生成"}
                  </Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {/* 生成された原稿セクション */}
          {isScriptGenerated && (
            <View
              style={{
                backgroundColor: Colors.dark.card,
                borderRadius: 16,
                padding: 20,
                marginBottom: 32,
                borderLeftWidth: 4,
                borderLeftColor: Colors.dark.success,
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
                📄 生成された原稿
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
                  minHeight: 200,
                  textAlignVertical: "top",
                }}
                value={generatedScript}
                onChangeText={setGeneratedScript}
                multiline
                placeholder="生成された原稿がここに表示されます..."
                placeholderTextColor={Colors.dark.subtext}
              />

              <Text
                style={{
                  fontSize: 12,
                  color: Colors.dark.subtext,
                  marginTop: 8,
                }}
              >
                原稿は直接編集できます
              </Text>
            </View>
          )}

          {/* 原稿生成後のアクションボタン */}
          {isScriptGenerated && (
            <View style={{ marginBottom: 40 }}>
              {/* 再生成ボタン */}
              <TouchableOpacity
                style={{ marginBottom: 16 }}
                onPress={handleRegenerateScript}
              >
                <View
                  style={{
                    backgroundColor: Colors.dark.card,
                    paddingVertical: 16,
                    borderRadius: 16,
                    alignItems: "center",
                    borderWidth: 1,
                    borderColor: Colors.dark.border,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <Ionicons
                      name="refresh"
                      size={24}
                      color={Colors.dark.text}
                      style={{ marginRight: 8 }}
                    />
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "bold",
                        color: Colors.dark.text,
                      }}
                    >
                      再生成
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>

              {/* 音声生成ボタン */}
              <TouchableOpacity onPress={handleGenerateAudio}>
                <LinearGradient
                  colors={[Colors.dark.success, Colors.dark.secondary]}
                  style={{
                    paddingVertical: 18,
                    borderRadius: 16,
                    alignItems: "center",
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <Ionicons
                      name="mic"
                      size={24}
                      color={Colors.dark.text}
                      style={{ marginRight: 8 }}
                    />
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "bold",
                        color: Colors.dark.text,
                      }}
                    >
                      音声を生成する
                    </Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
