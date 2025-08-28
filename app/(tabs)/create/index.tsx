import { ScriptSectionCard } from "@/components/ScriptSectionCard";
import Colors from "@/constants/Colors";
import {
  createScript,
  PostCreateScriptRequest,
  PromptScriptData,
  ScriptData,
} from "@/services/scriptGenerator";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
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

export default function CreateScreen() {
  const router = useRouter();
  const [theme, setTheme] = useState("");
  const [referenceUrls, setReferenceUrls] = useState<string[]>([""]);
  const [webSearch, setWebSearch] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedScript, setGeneratedScript] = useState<ScriptData[]>([]);
  const [isScriptGenerated, setIsScriptGenerated] = useState(false);
  const [scriptHistory, setScriptHistory] = useState<PromptScriptData[]>([]);
  const [additionalInstruction, setAdditionalInstruction] = useState("");

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

    try {
      // UI状態からAPIリクエスト形式への変換
      const requestData: PostCreateScriptRequest = {
        prompt: theme.trim() || "指定されたURLの内容について説明してください",
        previousScript: scriptHistory,
        reference: validUrls.length > 0 ? validUrls : [],
        isSearch: webSearch,
      };

      console.log("Requesting script generation with:", requestData);

      // API呼び出し
      const response = await createScript(requestData);

      console.log("Received API response in handleGenerateScript:", response);

      // APIレスポンスの検証と処理
      if (!response.newScript) {
        // 開発者向けの詳細ログ
        console.error(
          "API Response structure error: missing newScript property",
          response
        );
        throw new Error(
          "原稿の生成に失敗しました。しばらく時間をおいて再度お試しください。"
        );
      }

      if (
        !response.newScript.script ||
        !Array.isArray(response.newScript.script)
      ) {
        // 開発者向けの詳細ログ
        console.error("API Response script property error:", {
          hasNewScript: !!response.newScript,
          scriptType: typeof response.newScript?.script,
          scriptValue: response.newScript?.script,
        });

        throw new Error(
          "原稿の生成に失敗しました。しばらく時間をおいて再度お試しください。"
        );
      }

      // scriptが配列の場合の正常処理 - 配列をそのまま保持
      const scriptArray = response.newScript.script.filter(
        (item) => item.text && item.text.trim() !== ""
      );

      if (scriptArray.length === 0) {
        throw new Error(
          "原稿が生成されませんでした。別のテーマで再度お試しください。"
        );
      }

      // 正常に原稿が生成された場合のみ状態を更新
      setGeneratedScript(scriptArray);
      setIsScriptGenerated(true);

      // 履歴に現在の原稿を追加
      const currentScript: PromptScriptData = {
        prompt: requestData.prompt,
        script: scriptArray,
        reference: response.newScript.reference || [],
        situation: requestData.situation || undefined,
      };
      setScriptHistory((prev) => [...prev, currentScript]);

      // APIから返された参考URLでreferenceUrlsを上書き
      if (
        response.newScript.reference &&
        response.newScript.reference.length > 0
      ) {
        const urls = response.newScript.reference.map((ref) => ref.url);
        setReferenceUrls(urls);
      } else {
        setReferenceUrls([""]);
      }
    } catch (error) {
      console.error("Script generation error:", error);

      Alert.alert(
        "エラー",
        error instanceof Error
          ? `原稿の生成に失敗しました: ${error.message}`
          : "原稿の生成に失敗しました。しばらく時間をおいて再度お試しください。"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerateScript = async () => {
    if (!additionalInstruction.trim()) {
      Alert.alert("エラー", "追加指示を入力してください");
      return;
    }

    Alert.alert("再生成の確認", "追加指示を踏まえて原稿を再生成しますか？", [
      { text: "キャンセル", style: "cancel" },
      { text: "再生成", onPress: handleGenerateWithAdditionalInstruction },
    ]);
  };

  const handleGenerateWithAdditionalInstruction = async () => {
    const validUrls = referenceUrls.filter((url) => url.trim() !== "");

    setIsGenerating(true);

    try {
      const requestData: PostCreateScriptRequest = {
        prompt: additionalInstruction.trim(),
        previousScript: scriptHistory,
        reference: validUrls,
        isSearch: webSearch,
      };

      console.log(
        "Requesting script generation with additional instruction:",
        requestData
      );

      const response = await createScript(requestData);

      console.log(
        "Received API response for additional instruction:",
        response
      );

      if (
        !response.newScript ||
        !response.newScript.script ||
        !Array.isArray(response.newScript.script)
      ) {
        console.error("API Response error:", response);
        throw new Error(
          "原稿の生成に失敗しました。しばらく時間をおいて再度お試しください。"
        );
      }

      const scriptArray = response.newScript.script.filter(
        (item) => item.text && item.text.trim() !== ""
      );

      if (scriptArray.length === 0) {
        throw new Error(
          "原稿が生成されませんでした。別の指示で再度お試しください。"
        );
      }

      setGeneratedScript(scriptArray);

      // 履歴に追加指示による原稿を追加
      const currentScript: PromptScriptData = {
        prompt: additionalInstruction.trim(),
        script: scriptArray,
        reference: response.newScript.reference || [],
        situation: undefined,
      };
      setScriptHistory((prev) => [...prev, currentScript]);

      // 追加指示をクリア
      setAdditionalInstruction("");

      // APIから返された参考URLでreferenceUrlsを更新
      if (
        response.newScript.reference &&
        response.newScript.reference.length > 0
      ) {
        const urls = response.newScript.reference.map((ref) => ref.url);
        setReferenceUrls(urls);
      }
    } catch (error) {
      console.error("Script regeneration error:", error);
      Alert.alert(
        "エラー",
        error instanceof Error
          ? `原稿の再生成に失敗しました: ${error.message}`
          : "原稿の再生成に失敗しました。しばらく時間をおいて再度お試しください。"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleResetConversation = () => {
    Alert.alert(
      "リセットの確認",
      "すべての入力内容と原稿履歴をリセットしますか？この操作は取り消すことができません。",
      [
        { text: "キャンセル", style: "cancel" },
        {
          text: "リセット",
          style: "destructive",
          onPress: () => {
            // 全状態を初期状態にリセット
            setTheme("");
            setReferenceUrls([""]);
            setWebSearch(false);
            setGeneratedScript([]);
            setIsScriptGenerated(false);
            setScriptHistory([]);
            setAdditionalInstruction("");

          },
        },
      ]
    );
  };

  const handleGenerateAudio = () => {
    if (generatedScript.length === 0) {
      Alert.alert("エラー", "原稿が空です");
      return;
    }

    // 音声生成画面への遷移
    router.push({
      pathname: "/create/audio",
      params: {
        script: JSON.stringify(generatedScript),
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

          {/* テーマ入力セクション（原稿生成前のみ表示） */}
          {!isScriptGenerated && (
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
                テーマ入力
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

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: 8,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "600",
                      color: Colors.dark.text,
                      marginRight: 8,
                    }}
                  >
                    Web検索
                  </Text>
                  <Switch
                    value={webSearch}
                    onValueChange={setWebSearch}
                    trackColor={{
                      false: Colors.dark.border,
                      true: Colors.dark.primary,
                    }}
                    thumbColor={
                      webSearch ? Colors.dark.text : Colors.dark.subtext
                    }
                    style={{
                      transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
                    }}
                  />
                </View>
                <Text
                  style={{
                    fontSize: 12,
                    color: Colors.dark.subtext,
                  }}
                >
                  {theme.length}/200文字
                </Text>
              </View>
            </View>
          )}

          {/* 参考URL入力セクション（原稿生成前のみ表示） */}
          {!isScriptGenerated && (
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
          )}

          {/* 現在のコンテキスト表示（原稿生成後のみ） */}
          {isScriptGenerated && (
            <View
              style={
                {
                  // backgroundColor: Colors.dark.card,
                  // borderRadius: 16,
                  // padding: 20,
                  // marginBottom: 24,
                  // borderWidth: 1,
                  // borderColor: Colors.dark.primary + "30",
                }
              }
            >
              {/* テーマ表示 */}
              {theme.trim() && (
                <View style={{ marginBottom: 16 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "600",
                      color: Colors.dark.text,
                      marginBottom: 8,
                    }}
                  >
                    テーマ
                  </Text>
                  <Text
                    style={{
                      fontSize: 18,
                      color: Colors.dark.text,
                      lineHeight: 20,
                      fontWeight: "bold",
                      backgroundColor: Colors.dark.background,
                    }}
                  >
                    {theme}
                  </Text>
                </View>
              )}

              {/* 参考URL表示 */}
              {referenceUrls.some((url) => url.trim() !== "") && (
                <View>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "600",
                      color: Colors.dark.text,
                      marginBottom: 8,
                    }}
                  >
                    参考URL:
                  </Text>
                  {referenceUrls
                    .filter((url) => url.trim() !== "")
                    .map((url, index) => (
                      <View
                        key={index}
                        style={{
                          backgroundColor: Colors.dark.background,
                          padding: 8,
                          borderRadius: 8,
                          marginBottom:
                            index ===
                            referenceUrls.filter((u) => u.trim() !== "")
                              .length -
                              1
                              ? 0
                              : 8,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 12,
                            color: Colors.dark.secondary,
                            fontFamily: "monospace",
                          }}
                          numberOfLines={1}
                          ellipsizeMode="middle"
                        >
                          {url}
                        </Text>
                      </View>
                    ))}
                </View>
              )}

              {/* Web検索状態表示 */}
              {webSearch && (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: 16,
                    paddingTop: 16,
                    borderTopWidth: 1,
                    borderTopColor: Colors.dark.border,
                  }}
                >
                  <Ionicons
                    name="search"
                    size={14}
                    color={Colors.dark.secondary}
                    style={{ marginRight: 8 }}
                  />
                  <Text
                    style={{
                      fontSize: 12,
                      color: Colors.dark.secondary,
                      fontWeight: "600",
                    }}
                  >
                    Web検索有効
                  </Text>
                </View>
              )}
            </View>
          )}

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

          {/* 原稿調整用の追加指示入力セクション（原稿生成後のみ表示） */}
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
                  marginBottom: 12,
                }}
              >
                原稿を調整する
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
                placeholder="例：「もう少し詳しく説明して」"
                placeholderTextColor={Colors.dark.subtext}
                value={additionalInstruction}
                onChangeText={setAdditionalInstruction}
                multiline
                maxLength={150}
              />

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: 8,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <Ionicons
                    name="bulb"
                    size={16}
                    color={Colors.dark.secondary}
                    style={{ marginRight: 8 }}
                  />
                  <Text
                    style={{
                      fontSize: 12,
                      color: Colors.dark.subtext,
                      flex: 1,
                    }}
                  >
                    既存の原稿を基に調整します
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: 12,
                    color: Colors.dark.subtext,
                  }}
                >
                  {additionalInstruction.length}/150文字
                </Text>
              </View>
            </View>
          )}

          {/* 参考URL入力セクション（原稿生成後も表示） */}
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
                参考URL（任意）
              </Text>

              {referenceUrls.map((url, index) => (
                <View
                  key={index}
                  style={{
                    marginBottom: index === referenceUrls.length - 1 ? 16 : 16,
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
                  追加の参考資料があれば入力してください
                </Text>
              </View>
            </View>
          )}

          {/* 原稿生成後のアクションボタン */}
          {isScriptGenerated && (
            <View
              style={{
                marginBottom: 24,
                flexDirection: "row",
                gap: 8,
              }}
            >
              {/* リセットボタン */}
              <TouchableOpacity
                style={{ flex: 1 }}
                onPress={handleResetConversation}
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
                      name="trash-outline"
                      size={20}
                      color={Colors.dark.text}
                      style={{ marginRight: 4 }}
                    />
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "bold",
                        color: Colors.dark.text,
                      }}
                    >
                      リセット
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>

              {/* 追加指示で再生成ボタン */}
              <TouchableOpacity
                style={{ flex: 1 }}
                onPress={handleRegenerateScript}
                disabled={!additionalInstruction.trim() || isGenerating}
              >
                <View
                  style={{
                    backgroundColor: additionalInstruction.trim()
                      ? Colors.dark.card
                      : Colors.dark.background,
                    paddingVertical: 16,
                    borderRadius: 16,
                    alignItems: "center",
                    borderWidth: 1,
                    borderColor: additionalInstruction.trim()
                      ? Colors.dark.border
                      : Colors.dark.border + "50",
                    opacity: additionalInstruction.trim() ? 1 : 0.5,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <Ionicons
                      name="create"
                      size={20}
                      color={
                        additionalInstruction.trim()
                          ? Colors.dark.text
                          : Colors.dark.subtext
                      }
                      style={{ marginRight: 4 }}
                    />
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "bold",
                        color: additionalInstruction.trim()
                          ? Colors.dark.text
                          : Colors.dark.subtext,
                      }}
                    >
                      再生成
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
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
                borderLeftColor: Colors.dark.secondary,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 16,
                }}
              >
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "bold",
                    color: Colors.dark.text,
                  }}
                >
                  生成された原稿
                </Text>
              </View>

              {/* 話者別原稿セクション */}
              {generatedScript.map((scriptData, index) => (
                <ScriptSectionCard
                  key={index}
                  scriptData={scriptData}
                  index={index}
                  onUpdate={(updatedIndex, updatedData) => {
                    const newScript = [...generatedScript];
                    newScript[updatedIndex] = updatedData;
                    setGeneratedScript(newScript);
                  }}
                  onDelete={
                    generatedScript.length > 1
                      ? (deleteIndex) => {
                          const newScript = generatedScript.filter(
                            (_, i) => i !== deleteIndex
                          );
                          setGeneratedScript(newScript);
                        }
                      : undefined
                  }
                  showDeleteButton={generatedScript.length > 1}
                />
              ))}
            </View>
          )}

          {/* 音声生成ボタン */}
          {isScriptGenerated && (
            <TouchableOpacity
              style={{ marginBottom: 32 }}
              onPress={handleGenerateAudio}
            >
              <LinearGradient
                colors={[Colors.dark.secondary, Colors.dark.primary]}
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
                    音声の生成に進む
                  </Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* 原稿生成中のフルスクリーンローディング */}
      {isGenerating && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: Colors.dark.background + "99",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <View
            style={{
              backgroundColor: Colors.dark.card,
              borderRadius: 20,
              padding: 32,
              alignItems: "center",
              minWidth: 200,
            }}
          >
            <ActivityIndicator
              size="large"
              color={Colors.dark.primary}
              style={{ marginBottom: 20 }}
            />
            <Text
              style={{
                color: Colors.dark.text,
                fontSize: 18,
                fontWeight: "bold",
                textAlign: "center",
                marginBottom: 8,
              }}
            >
              原稿を生成中...
            </Text>
            <Text
              style={{
                color: Colors.dark.subtext,
                fontSize: 14,
                textAlign: "center",
                lineHeight: 20,
              }}
            >
              しばらくお待ちください
            </Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
