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

type VoiceOption = {
  id: string;
  name: string;
  description: string;
  gender: "male" | "female";
  language: "ja" | "en";
};

type AudioSection = {
  id: string;
  text: string;
  audioUrl?: string;
  isPlaying?: boolean;
};

export default function CreateAudioScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // 原稿作成画面から渡される原稿データ
  const [script, setScript] = useState<string>(
    (params.script as string) ||
      `こんにちは、今日は量子コンピュータについて話していきます。

最近の研究によると、この分野では多くの興味深い発見がありました。まず第一に、基本的な概念について説明します。

詳細については、以下の点が重要です：
1. 基本的な理解
2. 実際の応用例
3. 今後の展望

これらの情報を踏まえて、今後の発展が期待されています。ご清聴ありがとうございました。`
  );

  // 音声設定
  const [selectedVoice, setSelectedVoice] = useState<VoiceOption>({
    id: "voice-1",
    name: "さくら",
    description: "明るく親しみやすい女性の声",
    gender: "female",
    language: "ja",
  });

  // 音声生成関連
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioSections, setAudioSections] = useState<AudioSection[]>([]);
  const [isAudioGenerated, setIsAudioGenerated] = useState(false);
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);

  // 利用可能なボイス一覧
  const voiceOptions: VoiceOption[] = [
    {
      id: "voice-1",
      name: "さくら",
      description: "明るく親しみやすい女性の声",
      gender: "female",
      language: "ja",
    },
    {
      id: "voice-2",
      name: "たけし",
      description: "落ち着いた男性の声",
      gender: "male",
      language: "ja",
    },
    {
      id: "voice-3",
      name: "みお",
      description: "やわらかで上品な女性の声",
      gender: "female",
      language: "ja",
    },
    {
      id: "voice-4",
      name: "けんじ",
      description: "深みのある男性の声",
      gender: "male",
      language: "ja",
    },
  ];

  // ボイスプレビュー再生
  const handleVoicePreview = (voice: VoiceOption) => {
    Alert.alert(
      "ボイスプレビュー",
      `${voice.name}の声で「こんにちは、テスト音声です」を再生します。`,
      [
        { text: "キャンセル", style: "cancel" },
        {
          text: "再生",
          onPress: () => {
            // TODO: 実際の音声再生実装
            console.log(`Playing preview for ${voice.name}`);
          },
        },
      ]
    );
  };

  // 音声生成
  const handleGenerateAudio = async () => {
    if (!script.trim()) {
      Alert.alert("エラー", "原稿が入力されていません");
      return;
    }

    setIsGenerating(true);

    // TODO: 実際のAPI呼び出しを実装
    setTimeout(() => {
      // 原稿を段落ごとに分割
      const sections = script
        .split("\n\n")
        .filter((s) => s.trim())
        .map((text, index) => ({
          id: `section-${index}`,
          text: text.trim(),
          audioUrl: `mock-audio-${index}.mp3`, // モックURL
        }));

      setAudioSections(sections);
      setIsAudioGenerated(true);
      setIsGenerating(false);

      Alert.alert("完了", "音声の生成が完了しました！");
    }, 3000);
  };

  // セクション音声再生
  const handlePlaySection = (sectionId: string) => {
    if (currentPlayingId === sectionId) {
      setCurrentPlayingId(null);
      // TODO: 再生停止
    } else {
      setCurrentPlayingId(sectionId);
      // TODO: 該当セクションの音声再生
      console.log(`Playing section: ${sectionId}`);
    }
  };

  // 音声再生成
  const handleRegenerateAudio = () => {
    Alert.alert(
      "再生成の確認",
      "現在の音声を破棄して、新しい音声を生成しますか？",
      [
        { text: "キャンセル", style: "cancel" },
        {
          text: "再生成",
          onPress: () => {
            setIsAudioGenerated(false);
            setAudioSections([]);
            setCurrentPlayingId(null);
            handleGenerateAudio();
          },
        },
      ]
    );
  };

  // 配信設定画面への遷移
  const handleProceedToPublish = () => {
    if (!isAudioGenerated) {
      Alert.alert("エラー", "音声を生成してください");
      return;
    }

    // 配信設定画面への遷移
    router.push({
      pathname: "/create-publish",
      params: {
        script,
        voice: selectedVoice.id,
        audioSections: JSON.stringify(audioSections),
      },
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.dark.background }}>
      <Stack.Screen
        options={{
          title: "音声を生成",
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
              🎤 音声生成設定
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: Colors.dark.subtext,
                textAlign: "center",
                lineHeight: 22,
              }}
            >
              ボイスと音質を選択して
              {"\n"}高品質な音声を生成します
            </Text>
          </View>

          {/* ボイス選択セクション */}
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
              🎤 ボイス選択
            </Text>

            {voiceOptions.map((voice) => (
              <TouchableOpacity
                key={voice.id}
                style={{
                  backgroundColor:
                    selectedVoice.id === voice.id
                      ? Colors.dark.primary + "20"
                      : Colors.dark.background,
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 12,
                  borderWidth: selectedVoice.id === voice.id ? 2 : 1,
                  borderColor:
                    selectedVoice.id === voice.id
                      ? Colors.dark.primary
                      : Colors.dark.border,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
                onPress={() => setSelectedVoice(voice)}
              >
                <View style={{ flex: 1 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 4,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "bold",
                        color: Colors.dark.text,
                        marginRight: 8,
                      }}
                    >
                      {voice.name}
                    </Text>
                    <View
                      style={{
                        backgroundColor:
                          voice.gender === "female"
                            ? Colors.dark.secondary + "30"
                            : Colors.dark.primary + "30",
                        paddingHorizontal: 8,
                        paddingVertical: 2,
                        borderRadius: 8,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          color:
                            voice.gender === "female"
                              ? Colors.dark.secondary
                              : Colors.dark.primary,
                          fontWeight: "600",
                        }}
                      >
                        {voice.gender === "female" ? "女性" : "男性"}
                      </Text>
                    </View>
                  </View>
                  <Text
                    style={{
                      fontSize: 14,
                      color: Colors.dark.subtext,
                      lineHeight: 18,
                    }}
                  >
                    {voice.description}
                  </Text>
                </View>

                <TouchableOpacity
                  style={{
                    backgroundColor: Colors.dark.primary,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 8,
                    marginLeft: 12,
                  }}
                  onPress={() => handleVoicePreview(voice)}
                >
                  <Ionicons name="play" size={16} color={Colors.dark.text} />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>

          {/* 音声生成ボタン */}
          {!isAudioGenerated && (
            <TouchableOpacity
              style={{
                marginBottom: 24,
                borderRadius: 16,
                overflow: "hidden",
                opacity: isGenerating ? 0.7 : 1,
              }}
              onPress={handleGenerateAudio}
              disabled={isGenerating}
            >
              <LinearGradient
                colors={[Colors.dark.primary, Colors.dark.secondary]}
                style={{
                  paddingVertical: 18,
                  paddingHorizontal: 24,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {isGenerating ? (
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
                      音声を生成中...
                    </Text>
                  </>
                ) : (
                  <>
                    <Ionicons
                      name="mic"
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
                      音声を生成
                    </Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          )}

          {/* 音声生成後のプレビューセクション */}
          {isAudioGenerated && (
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
                🎧 音声プレビュー
              </Text>

              {audioSections.map((section, index) => (
                <View
                  key={section.id}
                  style={{
                    backgroundColor: Colors.dark.background,
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 12,
                    borderWidth: 1,
                    borderColor: Colors.dark.border,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "flex-start",
                      marginBottom: 12,
                    }}
                  >
                    <View
                      style={{
                        backgroundColor: Colors.dark.primary,
                        width: 24,
                        height: 24,
                        borderRadius: 12,
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: 12,
                      }}
                    >
                      <Text
                        style={{
                          color: Colors.dark.text,
                          fontSize: 12,
                          fontWeight: "bold",
                        }}
                      >
                        {index + 1}
                      </Text>
                    </View>
                    <Text
                      style={{
                        flex: 1,
                        fontSize: 14,
                        color: Colors.dark.text,
                        lineHeight: 20,
                      }}
                    >
                      {section.text}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={{
                      backgroundColor:
                        currentPlayingId === section.id
                          ? Colors.dark.success
                          : Colors.dark.primary,
                      paddingVertical: 10,
                      paddingHorizontal: 16,
                      borderRadius: 8,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      alignSelf: "flex-start",
                    }}
                    onPress={() => handlePlaySection(section.id)}
                  >
                    <Ionicons
                      name={currentPlayingId === section.id ? "pause" : "play"}
                      size={16}
                      color={Colors.dark.text}
                      style={{ marginRight: 8 }}
                    />
                    <Text
                      style={{
                        color: Colors.dark.text,
                        fontSize: 14,
                        fontWeight: "600",
                      }}
                    >
                      {currentPlayingId === section.id ? "停止" : "再生"}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* 原稿編集セクション */}
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
              📝 原稿編集
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
              placeholder="原稿を編集できます..."
              placeholderTextColor={Colors.dark.subtext}
              value={script}
              onChangeText={setScript}
              multiline
            />

            <Text
              style={{
                fontSize: 12,
                color: Colors.dark.subtext,
                textAlign: "right",
                marginTop: 8,
              }}
            >
              {script.length}文字
            </Text>
          </View>

          {/* アクションボタン */}
          <View style={{ flexDirection: "row", gap: 12, marginBottom: 32 }}>
            {/* 再生成ボタン */}
            {isAudioGenerated && (
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: Colors.dark.card,
                  borderRadius: 12,
                  paddingVertical: 16,
                  paddingHorizontal: 20,
                  borderWidth: 1,
                  borderColor: Colors.dark.border,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onPress={handleRegenerateAudio}
              >
                <Ionicons
                  name="refresh"
                  size={18}
                  color={Colors.dark.text}
                  style={{ marginRight: 8 }}
                />
                <Text
                  style={{
                    color: Colors.dark.text,
                    fontSize: 16,
                    fontWeight: "600",
                  }}
                >
                  再生成
                </Text>
              </TouchableOpacity>
            )}

            {/* 配信設定ボタン */}
            <TouchableOpacity
              style={{
                flex: isAudioGenerated ? 1 : 1,
                borderRadius: 12,
                overflow: "hidden",
                opacity: !isAudioGenerated ? 0.5 : 1,
              }}
              onPress={handleProceedToPublish}
              disabled={!isAudioGenerated}
            >
              <LinearGradient
                colors={[Colors.dark.success, Colors.dark.primary]}
                style={{
                  paddingVertical: 16,
                  paddingHorizontal: 20,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons
                  name="arrow-forward"
                  size={18}
                  color={Colors.dark.text}
                  style={{ marginRight: 8 }}
                />
                <Text
                  style={{
                    color: Colors.dark.text,
                    fontSize: 16,
                    fontWeight: "bold",
                  }}
                >
                  配信に進む
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
