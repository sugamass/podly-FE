import Colors from "@/constants/Colors";
import {
  AudioPreviewRequest,
  AudioPreviewResponse,
  ScriptData as AudioScriptData,
  generateAudioPreview,
} from "@/services/audioGenerator";
import { audioPlayerService } from "@/services/AudioPlayerService";
import { ScriptData as GeneratedScriptData } from "@/services/scriptGenerator";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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

  // 原稿作成画面から渡される原稿データ（JSON形式）
  const [scriptData, setScriptData] = useState<GeneratedScriptData[]>(() => {
    try {
      const scriptParam = params.script as string;
      if (scriptParam) {
        const parsed = JSON.parse(scriptParam);
        return Array.isArray(parsed) ? parsed : [];
      }
    } catch (error) {
      console.error("Failed to parse script parameter:", error);
      Alert.alert("エラー", "原稿データの解析に失敗しました");
    }
    return [];
  });

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
  const [fullAudioUrl, setFullAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // 話者ごとのボイス選択
  const [speakerVoiceMap, setSpeakerVoiceMap] = useState<
    Record<string, VoiceOption>
  >({});
  const [openSpeaker, setOpenSpeaker] = useState<string | null>(null);

  // スクリプト内のユニーク話者一覧
  const uniqueSpeakersList = useMemo(() => {
    return Array.from(
      new Set((scriptData || []).map((item) => item.speaker || "ナレーター"))
    );
  }, [scriptData]);

  // 未設定スピーカーにデフォルトのselectedVoiceを適用
  useEffect(() => {
    setSpeakerVoiceMap((prev) => {
      const next = { ...prev } as Record<string, VoiceOption>;
      uniqueSpeakersList.forEach((speaker) => {
        if (!next[speaker]) {
          next[speaker] = selectedVoice;
        }
      });
      return next;
    });
  }, [uniqueSpeakersList, selectedVoice]);

  // AudioPlayerServiceの状態変更を監視
  useEffect(() => {
    const handleStateChange = (playing: boolean) => {
      setIsPlaying(playing);
      if (!playing) {
        setCurrentPlayingId(null);
      }
    };

    audioPlayerService.setStateUpdateCallback(handleStateChange);

    // クリーンアップ関数
    return () => {
      audioPlayerService.setStateUpdateCallback(() => {});
    };
  }, []);

  // コンポーネントアンマウント時のクリーンアップ
  useEffect(() => {
    return () => {
      // 再生中の音声を停止
      if (currentPlayingId && isPlaying) {
        audioPlayerService.stopAndClear().catch(console.error);
      }
    };
  }, [currentPlayingId, isPlaying]);

  // セクション再生成関連
  const [regeneratingSectionId, setRegeneratingSectionId] = useState<
    string | null
  >(null);

  // BGM選択関連
  const [selectedBGM, setSelectedBGM] = useState<BGMOption>(() => {
    const initial = {
      id: "starsBeyondEx",
      name: "stars Beyond Ex",
      description: "",
    } as BGMOption;
    return initial;
  });
  const [isBgmOpen, setIsBgmOpen] = useState(false);

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

  // 話者ごとのボイス選択
  const handleSelectSpeakerVoice = (speaker: string, voice: VoiceOption) => {
    setSpeakerVoiceMap((prev) => ({ ...prev, [speaker]: voice }));
  };

  // BGMプレビュー再生
  const handleBGMPreview = (bgm: BGMOption) => {
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
    if (!scriptData || scriptData.length === 0) {
      Alert.alert("エラー", "原稿データが入力されていません");
      return;
    }

    setIsGenerating(true);

    try {
      // GeneratedScriptDataからAudioScriptDataに変換（必須フィールドを保証）
      const audioScript: AudioScriptData[] = scriptData.map((item) => ({
        speaker: item.speaker || "ナレーター",
        text: item.text || "",
        caption: item.caption || "",
      }));

      // スピーカー配列を抽出（重複除去）
      const uniqueSpeakers = Array.from(
        new Set(audioScript.map((item) => item.speaker))
      );

      // 各スピーカーに対応するボイスIDを並べる
      const voicesForSpeakers = uniqueSpeakers.map(
        (s) => speakerVoiceMap[s]?.id ?? selectedVoice.id
      );

      // APIリクエストパラメータを構築
      const requestData: AudioPreviewRequest = {
        script: audioScript,
        tts: "openai",
        voices: voicesForSpeakers,
        speakers: uniqueSpeakers,
      };

      console.log("Generating audio with request:", requestData);

      // 実際のAPI呼び出し
      const response: AudioPreviewResponse = await generateAudioPreview(
        requestData
      );

      console.log("Audio generated successfully:", response);

      // 全体音声URLを保存
      setFullAudioUrl(response.audioUrl || null);

      // レスポンスから音声セクションを構築
      const sections = audioScript.map((item, index) => ({
        id: `section-${index}`,
        text: item.text,
        audioUrl: response.separatedAudioUrls?.[index],
      }));

      setAudioSections(sections);
      setIsAudioGenerated(true);

      Alert.alert("完了", "音声の生成が完了しました！");
    } catch (error) {
      console.error("Audio generation error:", error);
      Alert.alert(
        "エラー",
        error instanceof Error
          ? `音声の生成に失敗しました: ${error.message}`
          : "音声の生成に失敗しました。しばらく時間をおいて再度お試しください。"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // セクション音声再生
  const handlePlaySection = async (sectionId: string) => {
    try {
      if (sectionId === "full-podcast") {
        // 全体音声の再生
        if (isPlaying && currentPlayingId === sectionId) {
          // 停止
          await audioPlayerService.pause();
        } else {
          // 再生
          if (fullAudioUrl) {
            const isCurrentTrack =
              audioPlayerService.isCurrentTrack("full-podcast");

            if (!isCurrentTrack) {
              // 新しいトラックに切り替え
              const success = await audioPlayerService.switchTrack({
                id: "full-podcast",
                url: fullAudioUrl,
                title: "ポッドキャスト全体",
                artist: "Generated Audio",
              });

              if (success) {
                setCurrentPlayingId(sectionId);
              } else {
                Alert.alert("エラー", "音声の再生に失敗しました");
              }
            } else {
              // 既に同じトラック、再生開始
              await audioPlayerService.play();
              setCurrentPlayingId(sectionId);
            }
          } else {
            Alert.alert("エラー", "再生可能な音声がありません");
          }
        }
      } else {
        // セクション別音声再生（既存のロジック）
        if (currentPlayingId === sectionId) {
          setCurrentPlayingId(null);
          // TODO: 再生停止
        } else {
          setCurrentPlayingId(sectionId);
          // TODO: 該当セクションの音声再生
          console.log(`Playing section: ${sectionId}`);
        }
      }
    } catch (error) {
      console.error("Audio playback error:", error);
      setCurrentPlayingId(null);
      setIsPlaying(false);

      // エラーの詳細な処理
      let errorMessage = "音声の再生中にエラーが発生しました";
      if (error instanceof Error) {
        if (
          error.message.includes("network") ||
          error.message.includes("fetch")
        ) {
          errorMessage =
            "ネットワークエラーが発生しました。インターネット接続を確認してください";
        } else if (
          error.message.includes("codec") ||
          error.message.includes("format")
        ) {
          errorMessage = "音声ファイルの形式が対応していません";
        }
      }

      Alert.alert("再生エラー", errorMessage);
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
          onPress: async () => {
            // 現在の再生を停止
            if (currentPlayingId) {
              await audioPlayerService.stopAndClear();
            }
            setIsAudioGenerated(false);
            setAudioSections([]);
            setCurrentPlayingId(null);
            setFullAudioUrl(null);
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

    // 話者→ボイスIDのマッピングを作成
    const speakerVoiceIds = uniqueSpeakersList.reduce<Record<string, string>>(
      (acc, s) => {
        acc[s] = speakerVoiceMap[s]?.id ?? selectedVoice.id;
        return acc;
      },
      {}
    );

    // 配信設定画面への遷移
    router.push({
      pathname: "/create/publish",
      params: {
        script: JSON.stringify(scriptData),
        voice: selectedVoice.id,
        audioSections: JSON.stringify(audioSections),
        speakerVoices: JSON.stringify(speakerVoiceIds),
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

          {/* 話者ごとのボイス設定セクション */}
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
              👥 話者ごとのボイス設定
            </Text>

            {uniqueSpeakersList.length === 0 ? (
              <Text style={{ color: Colors.dark.subtext, fontSize: 12 }}>
                原稿に話者が含まれていません。上の原稿作成で話者を指定してください。
              </Text>
            ) : (
              uniqueSpeakersList.map((speaker) => {
                const current =
                  speakerVoiceMap[speaker]?.name ?? selectedVoice.name;
                return (
                  <View key={speaker} style={{ marginBottom: 16 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginBottom: 8,
                      }}
                    >
                      <View
                        style={{
                          backgroundColor: Colors.dark.primary + "30",
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          borderRadius: 8,
                        }}
                      >
                        <Text
                          style={{
                            color: Colors.dark.primary,
                            fontSize: 12,
                            fontWeight: "600",
                          }}
                        >
                          {speaker}
                        </Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      style={{
                        backgroundColor: Colors.dark.background,
                        borderWidth: 1,
                        borderColor: Colors.dark.border,
                        borderRadius: 12,
                        paddingVertical: 12,
                        paddingHorizontal: 12,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                      onPress={() =>
                        setOpenSpeaker(openSpeaker === speaker ? null : speaker)
                      }
                    >
                      <Text
                        style={{
                          color: Colors.dark.text,
                          fontSize: 14,
                          textTransform: "capitalize",
                        }}
                        numberOfLines={1}
                      >
                        {current}
                      </Text>
                      <Ionicons
                        name="chevron-down"
                        size={16}
                        color={Colors.dark.subtext}
                      />
                    </TouchableOpacity>

                    {openSpeaker === speaker && (
                      <View
                        style={{
                          marginTop: 8,
                          borderWidth: 1,
                          borderColor: Colors.dark.border,
                          borderRadius: 12,
                          backgroundColor: Colors.dark.background,
                          maxHeight: 200,
                          overflow: "hidden",
                        }}
                      >
                        <ScrollView
                          showsVerticalScrollIndicator={false}
                          contentContainerStyle={{ paddingVertical: 4 }}
                        >
                          {voiceOptions.map((voice) => {
                            const selected =
                              (speakerVoiceMap[speaker]?.id ??
                                selectedVoice.id) === voice.id;
                            return (
                              <TouchableOpacity
                                key={`${speaker}-${voice.id}`}
                                style={{
                                  flexDirection: "row",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  paddingVertical: 12,
                                  paddingHorizontal: 12,
                                  borderBottomWidth: 1,
                                  borderBottomColor: Colors.dark.border,
                                  backgroundColor: selected
                                    ? Colors.dark.primary + "20"
                                    : Colors.dark.background,
                                }}
                                onPress={() => {
                                  handleSelectSpeakerVoice(speaker, voice);
                                  setOpenSpeaker(null);
                                }}
                              >
                                <View style={{ flex: 1, paddingRight: 12 }}>
                                  <Text
                                    style={{
                                      color: Colors.dark.text,
                                      fontSize: 14,
                                      fontWeight: "bold",
                                      textTransform: "capitalize",
                                      marginBottom: 4,
                                    }}
                                    numberOfLines={1}
                                  >
                                    {voice.name}
                                  </Text>
                                  <Text
                                    style={{
                                      color: Colors.dark.subtext,
                                      fontSize: 11,
                                      lineHeight: 14,
                                    }}
                                    numberOfLines={2}
                                  >
                                    {voice.description}
                                  </Text>
                                </View>

                                <TouchableOpacity
                                  style={{
                                    backgroundColor: Colors.dark.primary + "80",
                                    width: 28,
                                    height: 28,
                                    borderRadius: 14,
                                    alignItems: "center",
                                    justifyContent: "center",
                                    marginRight: 12,
                                  }}
                                  onPress={() => handleVoicePreview(voice)}
                                >
                                  <Ionicons
                                    name="play"
                                    size={14}
                                    color={Colors.dark.text}
                                  />
                                </TouchableOpacity>

                                <View
                                  style={{
                                    width: 20,
                                    height: 20,
                                    borderRadius: 10,
                                    borderWidth: 2,
                                    borderColor: selected
                                      ? Colors.dark.primary
                                      : Colors.dark.border,
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }}
                                >
                                  {selected && (
                                    <View
                                      style={{
                                        width: 10,
                                        height: 10,
                                        borderRadius: 5,
                                        backgroundColor: Colors.dark.primary,
                                      }}
                                    />
                                  )}
                                </View>
                              </TouchableOpacity>
                            );
                          })}
                        </ScrollView>
                      </View>
                    )}
                  </View>
                );
              })
            )}
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
            <TouchableOpacity
              style={{
                backgroundColor: Colors.dark.background,
                borderWidth: 1,
                borderColor: Colors.dark.border,
                borderRadius: 12,
                paddingVertical: 12,
                paddingHorizontal: 12,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
              onPress={() => setIsBgmOpen((prev) => !prev)}
            >
              <Text
                style={{ color: Colors.dark.text, fontSize: 14 }}
                numberOfLines={1}
              >
                {selectedBGM.name}
              </Text>
              <Ionicons
                name="chevron-down"
                size={16}
                color={Colors.dark.subtext}
              />
            </TouchableOpacity>

            {isBgmOpen && (
              <View
                style={{
                  marginTop: 8,
                  borderWidth: 1,
                  borderColor: Colors.dark.border,
                  borderRadius: 12,
                  backgroundColor: Colors.dark.background,
                  maxHeight: 240,
                  overflow: "hidden",
                }}
              >
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingVertical: 4 }}
                >
                  {bgmOptions.map((bgm) => {
                    const selected = selectedBGM.id === bgm.id;
                    return (
                      <TouchableOpacity
                        key={bgm.id}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                          paddingVertical: 12,
                          paddingHorizontal: 12,
                          borderBottomWidth: 1,
                          borderBottomColor: Colors.dark.border,
                          backgroundColor: selected
                            ? Colors.dark.primary + "20"
                            : Colors.dark.background,
                        }}
                        onPress={() => {
                          setSelectedBGM(bgm);
                          setIsBgmOpen(false);
                        }}
                      >
                        <View style={{ flex: 1, paddingRight: 12 }}>
                          <Text
                            style={{
                              color: Colors.dark.text,
                              fontSize: 14,
                              fontWeight: "bold",
                              marginBottom: 4,
                            }}
                            numberOfLines={1}
                          >
                            {bgm.name}
                          </Text>
                          <Text
                            style={{
                              color: Colors.dark.subtext,
                              fontSize: 11,
                              lineHeight: 14,
                            }}
                            numberOfLines={2}
                          >
                            {bgm.description}
                          </Text>
                        </View>

                        <TouchableOpacity
                          style={{
                            backgroundColor: Colors.dark.secondary + "80",
                            width: 28,
                            height: 28,
                            borderRadius: 14,
                            alignItems: "center",
                            justifyContent: "center",
                            marginRight: 12,
                          }}
                          onPress={() => handleBGMPreview(bgm)}
                        >
                          <Ionicons
                            name="play"
                            size={14}
                            color={Colors.dark.text}
                          />
                        </TouchableOpacity>

                        <View
                          style={{
                            width: 20,
                            height: 20,
                            borderRadius: 10,
                            borderWidth: 2,
                            borderColor: selected
                              ? Colors.dark.primary
                              : Colors.dark.border,
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {selected && (
                            <View
                              style={{
                                width: 10,
                                height: 10,
                                borderRadius: 5,
                                backgroundColor: Colors.dark.primary,
                              }}
                            />
                          )}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}
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
                    isPlaying && currentPlayingId === "full-podcast"
                      ? Colors.dark.success
                      : Colors.dark.primary,
                  borderRadius: 16,
                  paddingVertical: 20,
                  paddingHorizontal: 24,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 12,
                  opacity: !fullAudioUrl ? 0.5 : 1,
                }}
                onPress={() => handlePlaySection("full-podcast")}
                disabled={!fullAudioUrl}
              >
                <Ionicons
                  name={
                    isPlaying && currentPlayingId === "full-podcast"
                      ? "pause"
                      : "play"
                  }
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
                  {isPlaying && currentPlayingId === "full-podcast"
                    ? "停止"
                    : "全体を再生"}
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

      {/* 音声生成中のフルスクリーンローディング */}
      {isGenerating && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: Colors.dark.background + "E6",
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
              音声を生成中...
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
