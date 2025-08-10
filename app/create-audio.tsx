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

type BGMOption = {
  id: string;
  name: string;
  description: string;
};

type AudioSection = {
  id: string;
  text: string;
  audioUrl?: string;
  isPlaying?: boolean;
  isRegenerating?: boolean;
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
    id: "alloy",
    name: "alloy",
    description: "Neutral, balanced voice",
    gender: "female",
    language: "en",
  });

  // 音声生成関連
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioSections, setAudioSections] = useState<AudioSection[]>([]);
  const [isAudioGenerated, setIsAudioGenerated] = useState(false);
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);

  // セクション再生成関連
  const [regeneratingSectionId, setRegeneratingSectionId] = useState<
    string | null
  >(null);

  // BGM選択関連
  const [selectedBGM, setSelectedBGM] = useState<BGMOption>({
    id: "none",
    name: "BGMなし",
    description: "音声のみで生成",
  });

  // 利用可能なボイス一覧
  const voiceOptions: VoiceOption[] = [
    {
      id: "alloy",
      name: "alloy",
      description: "Neutral, balanced voice",
      gender: "female",
      language: "en",
    },
    {
      id: "ash",
      name: "ash",
      description: "Deep, resonant male voice",
      gender: "male",
      language: "en",
    },
    {
      id: "ballad",
      name: "ballad",
      description: "Warm, storytelling voice",
      gender: "female",
      language: "en",
    },
    {
      id: "coral",
      name: "coral",
      description: "Bright, energetic voice",
      gender: "female",
      language: "en",
    },
    {
      id: "echo",
      name: "echo",
      description: "Clear, articulate voice",
      gender: "male",
      language: "en",
    },
    {
      id: "fable",
      name: "fable",
      description: "Smooth, confident voice",
      gender: "male",
      language: "en",
    },
    {
      id: "onyx",
      name: "onyx",
      description: "Strong, authoritative voice",
      gender: "male",
      language: "en",
    },
    {
      id: "nova",
      name: "nova",
      description: "Young, vibrant voice",
      gender: "female",
      language: "en",
    },
    {
      id: "sage",
      name: "sage",
      description: "Wise, mature voice",
      gender: "male",
      language: "en",
    },
    {
      id: "shimmer",
      name: "shimmer",
      description: "Gentle, soothing voice",
      gender: "female",
      language: "en",
    },
    {
      id: "verse",
      name: "verse",
      description: "Expressive, dynamic voice",
      gender: "female",
      language: "en",
    },
  ];

  // 利用可能なBGM一覧
  const bgmOptions: BGMOption[] = [
    // {
    //   id: "none",
    //   name: "BGMなし",
    //   description: "音声のみで生成",
    //   category: "ambient",
    // },
    {
      id: "starsBeyondEx",
      name: "stars Beyond Ex",
      description: "",
    },
    {
      id: "calmForest",
      name: "Calm Forest",
      description: "",
    },
    {
      id: "calmMind",
      name: "Calm Mind",
      description: "",
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

  // BGMプレビュー再生
  const handleBGMPreview = (bgm: BGMOption) => {
    if (bgm.id === "none") {
      Alert.alert("プレビュー", "BGMなしが選択されています。");
      return;
    }

    Alert.alert("BGMプレビュー", `${bgm.name}を30秒間プレビュー再生します。`, [
      { text: "キャンセル", style: "cancel" },
      {
        text: "再生",
        onPress: () => {
          // TODO: 実際のBGM再生実装
          console.log(`Playing BGM preview for ${bgm.name}`);
        },
      },
    ]);
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

  // セクションテキスト更新
  const handleUpdateSectionText = (sectionId: string, newText: string) => {
    setAudioSections((prevSections) =>
      prevSections.map((section) =>
        section.id === sectionId ? { ...section, text: newText } : section
      )
    );
  };

  // 個別セクション再生成
  const handleRegenerateSection = async (sectionId: string) => {
    Alert.alert(
      "セクション再生成の確認",
      "このセクションの音声を再生成しますか？",
      [
        { text: "キャンセル", style: "cancel" },
        {
          text: "再生成",
          onPress: async () => {
            setRegeneratingSectionId(sectionId);

            // TODO: 実際のAPI呼び出しを実装
            setTimeout(() => {
              setAudioSections((prevSections) =>
                prevSections.map((section) =>
                  section.id === sectionId
                    ? {
                        ...section,
                        audioUrl: `regenerated-audio-${Date.now()}.mp3`,
                        isRegenerating: false,
                      }
                    : section
                )
              );
              setRegeneratingSectionId(null);
              Alert.alert("完了", "セクションの音声を再生成しました！");
            }, 2000);
          },
        },
      ]
    );
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
          headerShown: false,
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
          {/* 戻るボタン */}
          <TouchableOpacity
            style={{
              alignSelf: "flex-start",
              paddingVertical: 8,
              paddingHorizontal: 12,
              marginBottom: 20,
              backgroundColor: Colors.dark.card,
              borderRadius: 8,
              flexDirection: "row",
              alignItems: "center",
            }}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={20} color={Colors.dark.text} />
            <Text
              style={{
                marginLeft: 8,
                color: Colors.dark.text,
                fontSize: 16,
              }}
            >
              戻る
            </Text>
          </TouchableOpacity>

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

            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              {voiceOptions.map((voice) => (
                <TouchableOpacity
                  key={voice.id}
                  style={{
                    width: "48%",
                    backgroundColor:
                      selectedVoice.id === voice.id
                        ? Colors.dark.primary + "20"
                        : Colors.dark.background,
                    borderRadius: 12,
                    padding: 12,
                    borderWidth: selectedVoice.id === voice.id ? 2 : 1,
                    borderColor:
                      selectedVoice.id === voice.id
                        ? Colors.dark.primary
                        : Colors.dark.border,
                    minHeight: 100,
                  }}
                  onPress={() => setSelectedVoice(voice)}
                >
                  <View style={{ flex: 1 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 6,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "bold",
                          color: Colors.dark.text,
                          textTransform: "capitalize",
                        }}
                      >
                        {voice.name}
                      </Text>
                      <TouchableOpacity
                        style={{
                          backgroundColor: Colors.dark.primary + "80",
                          width: 24,
                          height: 24,
                          borderRadius: 12,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        onPress={() => handleVoicePreview(voice)}
                      >
                        <Ionicons
                          name="play"
                          size={12}
                          color={Colors.dark.text}
                        />
                      </TouchableOpacity>
                    </View>

                    <View
                      style={{
                        backgroundColor:
                          voice.gender === "female"
                            ? Colors.dark.secondary + "30"
                            : Colors.dark.primary + "30",
                        paddingHorizontal: 6,
                        paddingVertical: 2,
                        borderRadius: 6,
                        alignSelf: "flex-start",
                        marginBottom: 6,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 10,
                          color:
                            voice.gender === "female"
                              ? Colors.dark.secondary
                              : Colors.dark.primary,
                          fontWeight: "600",
                        }}
                      >
                        {voice.gender === "female" ? "Female" : "Male"}
                      </Text>
                    </View>

                    <Text
                      style={{
                        fontSize: 11,
                        color: Colors.dark.subtext,
                        lineHeight: 14,
                        flex: 1,
                      }}
                      numberOfLines={2}
                    >
                      {voice.description}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* BGM選択セクション */}
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
              🎵 BGM選択
            </Text>

            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              {bgmOptions.map((bgm) => (
                <TouchableOpacity
                  key={bgm.id}
                  style={{
                    width: "48%",
                    backgroundColor:
                      selectedBGM.id === bgm.id
                        ? Colors.dark.primary + "20"
                        : Colors.dark.background,
                    borderRadius: 12,
                    padding: 12,
                    borderWidth: selectedBGM.id === bgm.id ? 2 : 1,
                    borderColor:
                      selectedBGM.id === bgm.id
                        ? Colors.dark.primary
                        : Colors.dark.border,
                    minHeight: 100,
                  }}
                  onPress={() => setSelectedBGM(bgm)}
                >
                  <View style={{ flex: 1 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 6,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "bold",
                          color: Colors.dark.text,
                        }}
                        numberOfLines={1}
                      >
                        {bgm.name}
                      </Text>
                      {bgm.id !== "none" && (
                        <TouchableOpacity
                          style={{
                            backgroundColor: Colors.dark.secondary + "80",
                            width: 24,
                            height: 24,
                            borderRadius: 12,
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                          onPress={() => handleBGMPreview(bgm)}
                        >
                          <Ionicons
                            name="play"
                            size={12}
                            color={Colors.dark.text}
                          />
                        </TouchableOpacity>
                      )}
                    </View>

                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginBottom: 6,
                      }}
                    ></View>

                    <Text
                      style={{
                        fontSize: 11,
                        color: Colors.dark.subtext,
                        lineHeight: 14,
                        flex: 1,
                      }}
                      numberOfLines={2}
                    >
                      {bgm.description}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
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
          {/* {isAudioGenerated && (
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
                        marginTop: 4,
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
                    
                    <TextInput
                      style={{
                        flex: 1,
                        backgroundColor: Colors.dark.card,
                        borderRadius: 8,
                        padding: 12,
                        color: Colors.dark.text,
                        fontSize: 14,
                        borderWidth: 1,
                        borderColor: Colors.dark.border,
                        minHeight: 60,
                        textAlignVertical: "top",
                        marginRight: 8,
                      }}
                      value={section.text}
                      onChangeText={(text) => handleUpdateSectionText(section.id, text)}
                      multiline
                      placeholder="文章を入力..."
                      placeholderTextColor={Colors.dark.subtext}
                    />
                    
                    <View
                      style={{
                        flexDirection: "column",
                        gap: 8,
                      }}
                    >
                      <TouchableOpacity
                        style={{
                          backgroundColor:
                            currentPlayingId === section.id
                              ? Colors.dark.success
                              : Colors.dark.primary,
                          width: 32,
                          height: 32,
                          borderRadius: 16,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        onPress={() => handlePlaySection(section.id)}
                      >
                        <Ionicons
                          name={currentPlayingId === section.id ? "pause" : "play"}
                          size={16}
                          color={Colors.dark.text}
                        />
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={{
                          backgroundColor: regeneratingSectionId === section.id ? Colors.dark.border : Colors.dark.highlight,
                          width: 32,
                          height: 32,
                          borderRadius: 16,
                          alignItems: "center",
                          justifyContent: "center",
                          opacity: regeneratingSectionId === section.id ? 0.7 : 1,
                        }}
                        onPress={() => handleRegenerateSection(section.id)}
                        disabled={regeneratingSectionId === section.id}
                      >
                        <Ionicons
                          name={regeneratingSectionId === section.id ? "sync" : "refresh"}
                          size={16}
                          color={Colors.dark.text}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )} */}

          {/* ポッドキャスト全体プレビュー */}
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
                  textAlign: "center",
                }}
              >
                🎧 ポッドキャスト プレビュー
              </Text>

              <TouchableOpacity
                style={{
                  backgroundColor:
                    currentPlayingId === "full-podcast"
                      ? Colors.dark.success
                      : Colors.dark.primary,
                  borderRadius: 16,
                  paddingVertical: 20,
                  paddingHorizontal: 24,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 12,
                }}
                onPress={() => handlePlaySection("full-podcast")}
              >
                <Ionicons
                  name={currentPlayingId === "full-podcast" ? "pause" : "play"}
                  size={24}
                  color={Colors.dark.text}
                  style={{ marginRight: 12 }}
                />
                <Text
                  style={{
                    color: Colors.dark.text,
                    fontSize: 18,
                    fontWeight: "bold",
                  }}
                >
                  {currentPlayingId === "full-podcast" ? "停止" : "全体を再生"}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* アクションボタン */}
          <View style={{ flexDirection: "row", gap: 12, marginBottom: 32 }}>
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
