import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
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
import Colors from "../../constants/Colors";

type DurationOption = "1分" | "2分" | "3分";
type ToneOption = "カジュアル" | "フォーマル" | "論理的" | "ユーモア";

export default function CreateScreen() {
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
              AI原稿作成
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
              テーマ入力（任意）
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
              参考URL（任意）
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
                    }}
                    placeholder="https://example.com"
                    placeholderTextColor={Colors.dark.subtext}
                    value={url}
                    onChangeText={(value) => updateUrl(index, value)}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  {referenceUrls.length > 1 && (
                    <TouchableOpacity
                      style={{
                        marginLeft: 12,
                        padding: 8,
                        backgroundColor: Colors.dark.background,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: Colors.dark.border,
                      }}
                      onPress={() => removeUrlField(index)}
                    >
                      <Ionicons
                        name="trash"
                        size={20}
                        color={Colors.dark.subtext}
                      />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}

            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 12,
                paddingHorizontal: 16,
                backgroundColor: Colors.dark.background,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: Colors.dark.border,
                borderStyle: "dashed",
              }}
              onPress={addUrlField}
            >
              <Ionicons name="add" size={20} color={Colors.dark.primary} />
              <Text
                style={{
                  marginLeft: 8,
                  color: Colors.dark.primary,
                  fontSize: 16,
                  fontWeight: "500",
                }}
              >
                URLを追加
              </Text>
            </TouchableOpacity>
          </View>

          {/* Web検索設定セクション */}
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
                justifyContent: "space-between",
                alignItems: "center",
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
                  Web検索を使用
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: Colors.dark.subtext,
                    lineHeight: 20,
                  }}
                >
                  最新情報を取得してより豊富な内容にします
                </Text>
              </View>
              <Switch
                value={webSearch}
                onValueChange={setWebSearch}
                trackColor={{
                  false: Colors.dark.border,
                  true: Colors.dark.primary,
                }}
                thumbColor={Colors.dark.text}
              />
            </View>
          </View>

          {/* 設定オプション */}
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
              設定オプション
            </Text>

            {/* 長さ選択 */}
            <View style={{ marginBottom: 20 }}>
              <Text
                style={{
                  fontSize: 16,
                  color: Colors.dark.text,
                  marginBottom: 12,
                  fontWeight: "500",
                }}
              >
                長さ
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
                      paddingVertical: 12,
                      paddingHorizontal: 16,
                      backgroundColor:
                        duration === option
                          ? Colors.dark.primary
                          : Colors.dark.background,
                      borderRadius: 12,
                      marginHorizontal: 4,
                      borderWidth: 1,
                      borderColor: Colors.dark.border,
                    }}
                    onPress={() => setDuration(option)}
                  >
                    <Text
                      style={{
                        textAlign: "center",
                        color: Colors.dark.text,
                        fontSize: 14,
                        fontWeight: duration === option ? "bold" : "normal",
                      }}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* トーン選択 */}
            <View>
              <Text
                style={{
                  fontSize: 16,
                  color: Colors.dark.text,
                  marginBottom: 12,
                  fontWeight: "500",
                }}
              >
                トーン
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                {toneOptions.map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={{
                      paddingVertical: 8,
                      paddingHorizontal: 16,
                      backgroundColor:
                        tone === option
                          ? Colors.dark.primary
                          : Colors.dark.background,
                      borderRadius: 12,
                      marginRight: 8,
                      marginBottom: 8,
                      borderWidth: 1,
                      borderColor: Colors.dark.border,
                    }}
                    onPress={() => setTone(option)}
                  >
                    <Text
                      style={{
                        color: Colors.dark.text,
                        fontSize: 14,
                        fontWeight: tone === option ? "bold" : "normal",
                      }}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* 生成ボタン */}
          {!isScriptGenerated && (
            <TouchableOpacity
              style={{
                borderRadius: 16,
                overflow: "hidden",
                marginBottom: 24,
              }}
              onPress={handleGenerateScript}
              disabled={isGenerating}
            >
              <LinearGradient
                colors={[Colors.dark.primary, Colors.dark.secondary]}
                style={{
                  paddingVertical: 16,
                  paddingHorizontal: 24,
                  alignItems: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {isGenerating ? (
                  <>
                    <Ionicons
                      name="refresh"
                      size={20}
                      color={Colors.dark.text}
                    />
                    <Text
                      style={{
                        marginLeft: 8,
                        color: Colors.dark.text,
                        fontSize: 18,
                        fontWeight: "bold",
                      }}
                    >
                      生成中...
                    </Text>
                  </>
                ) : (
                  <>
                    <Ionicons
                      name="create"
                      size={20}
                      color={Colors.dark.text}
                    />
                    <Text
                      style={{
                        marginLeft: 8,
                        color: Colors.dark.text,
                        fontSize: 18,
                        fontWeight: "bold",
                      }}
                    >
                      原稿を生成
                    </Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          )}

          {/* 生成された原稿 */}
          {isScriptGenerated && (
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
                生成された原稿
              </Text>

              <View
                style={{
                  backgroundColor: Colors.dark.background,
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 16,
                  borderWidth: 1,
                  borderColor: Colors.dark.border,
                }}
              >
                <Text
                  style={{
                    color: Colors.dark.text,
                    fontSize: 16,
                    lineHeight: 24,
                  }}
                >
                  {generatedScript}
                </Text>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <TouchableOpacity
                  style={{
                    flex: 1,
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    backgroundColor: Colors.dark.background,
                    borderRadius: 12,
                    marginRight: 8,
                    borderWidth: 1,
                    borderColor: Colors.dark.border,
                  }}
                  onPress={handleRegenerateScript}
                >
                  <Text
                    style={{
                      textAlign: "center",
                      color: Colors.dark.text,
                      fontSize: 16,
                      fontWeight: "500",
                    }}
                  >
                    再生成
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    flex: 1,
                    borderRadius: 12,
                    marginLeft: 8,
                    overflow: "hidden",
                  }}
                  onPress={handleGenerateAudio}
                >
                  <LinearGradient
                    colors={[Colors.dark.primary, Colors.dark.secondary]}
                    style={{
                      paddingVertical: 12,
                      paddingHorizontal: 16,
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        color: Colors.dark.text,
                        fontSize: 16,
                        fontWeight: "bold",
                      }}
                    >
                      音声生成へ
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
