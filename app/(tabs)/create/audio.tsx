import AudioPreviewSection from "@/components/AudioPreviewSection";
import BGMSelectionSection from "@/components/BGMSelectionSection";
import GenerateAudioButton from "@/components/GenerateAudioButton";
import VoiceSelectionSection from "@/components/VoiceSelectionSection";
import Colors from "@/constants/Colors";
import { useAudioGeneration } from "@/hooks/useAudioGeneration";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { useBGMPlayer } from "@/hooks/useBGMPlayer";
import { useSpeakerVoices } from "@/hooks/useSpeakerVoices";
import { ScriptData as GeneratedScriptData } from "@/services/scriptGenerator";
import { BGMOption } from "@/types/audio";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
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

  // カスタムフックの使用
  const {
    speakerVoiceMap,
    openSpeaker,
    setOpenSpeaker,
    uniqueSpeakersList,
    handleSelectSpeakerVoice,
    defaultVoice,
  } = useSpeakerVoices(scriptData);

  const {
    isGenerating,
    audioSections,
    isAudioGenerated,
    fullAudioUrl,
    regeneratingSectionId,
    generateAudio,
    regenerateAudio,
    updateSectionText,
    regenerateSection,
  } = useAudioGeneration();

  const { currentPlayingId, isPlaying, playSection, clearPlayback } =
    useAudioPlayer();

  const {
    currentPlayingBGM,
    isPlaying: isBGMPlaying,
    playBGM,
    stopBGM,
  } = useBGMPlayer();

  // 音声生成ハンドラー
  const handleGenerateAudio = () => {
    generateAudio(scriptData, speakerVoiceMap, defaultVoice, selectedBGM.id);
  };

  // 音声再生成ハンドラー
  const handleRegenerateAudio = () => {
    regenerateAudio(
      scriptData,
      speakerVoiceMap,
      defaultVoice,
      selectedBGM.id,
      clearPlayback
    );
  };

  // セクション音声再生
  const handlePlaySection = (sectionId: string) => {
    playSection(sectionId, fullAudioUrl);
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
        acc[s] = speakerVoiceMap[s]?.id ?? defaultVoice.id;
        return acc;
      },
      {}
    );

    // 配信設定画面への遷移
    router.push({
      pathname: "/create/publish",
      params: {
        script: JSON.stringify(scriptData),
        voice: defaultVoice.id,
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
          <VoiceSelectionSection
            uniqueSpeakersList={uniqueSpeakersList}
            speakerVoiceMap={speakerVoiceMap}
            selectedVoice={defaultVoice}
            openSpeaker={openSpeaker}
            onSetOpenSpeaker={setOpenSpeaker}
            onSelectSpeakerVoice={handleSelectSpeakerVoice}
          />

          {/* BGM選択セクション */}
          <BGMSelectionSection
            selectedBGM={selectedBGM}
            isBgmOpen={isBgmOpen}
            onSetIsBgmOpen={setIsBgmOpen}
            onSelectBGM={setSelectedBGM}
            currentPlayingBGM={currentPlayingBGM}
            isBGMPlaying={isBGMPlaying}
            onPlayBGM={playBGM}
          />

          {/* 音声生成ボタン */}
          <GenerateAudioButton
            isGenerating={isGenerating}
            isAudioGenerated={isAudioGenerated}
            onGenerate={handleGenerateAudio}
            onRegenerate={handleRegenerateAudio}
          />

          {/* ポッドキャスト全体プレビュー */}
          <AudioPreviewSection
            isAudioGenerated={isAudioGenerated}
            isPlaying={isPlaying}
            currentPlayingId={currentPlayingId}
            fullAudioUrl={fullAudioUrl}
            onPlaySection={handlePlaySection}
          />

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
