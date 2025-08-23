import { useState } from "react";
import { Alert } from "react-native";
import { AudioSection, VoiceOption } from "@/types/audio";
import {
  AudioPreviewRequest,
  AudioPreviewResponse,
  ScriptData as AudioScriptData,
  generateAudioPreview,
} from "@/services/audioGenerator";
import { ScriptData as GeneratedScriptData } from "@/services/scriptGenerator";

export const useAudioGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioSections, setAudioSections] = useState<AudioSection[]>([]);
  const [isAudioGenerated, setIsAudioGenerated] = useState(false);
  const [fullAudioUrl, setFullAudioUrl] = useState<string | null>(null);
  const [regeneratingSectionId, setRegeneratingSectionId] = useState<string | null>(null);

  const generateAudio = async (
    scriptData: GeneratedScriptData[],
    speakerVoiceMap: Record<string, VoiceOption>,
    selectedVoice: VoiceOption,
    selectedBgmId: string
  ) => {
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
        bgmId: selectedBgmId,
      };

      console.log("Generating audio with request:", requestData);

      // 実際のAPI呼び出し
      const response: AudioPreviewResponse = await generateAudioPreview(requestData);

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

  const regenerateAudio = async (
    scriptData: GeneratedScriptData[],
    speakerVoiceMap: Record<string, VoiceOption>,
    selectedVoice: VoiceOption,
    selectedBgmId: string,
    onClearPlayback: () => void
  ) => {
    Alert.alert(
      "再生成の確認",
      "現在の音声を破棄して、新しい音声を生成しますか？",
      [
        { text: "キャンセル", style: "cancel" },
        {
          text: "再生成",
          onPress: async () => {
            onClearPlayback();
            setIsAudioGenerated(false);
            setAudioSections([]);
            setFullAudioUrl(null);
            await generateAudio(scriptData, speakerVoiceMap, selectedVoice, selectedBgmId);
          },
        },
      ]
    );
  };

  const updateSectionText = (sectionId: string, newText: string) => {
    setAudioSections((prevSections) =>
      prevSections.map((section) =>
        section.id === sectionId ? { ...section, text: newText } : section
      )
    );
  };

  const regenerateSection = async (sectionId: string) => {
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

  return {
    isGenerating,
    audioSections,
    isAudioGenerated,
    fullAudioUrl,
    regeneratingSectionId,
    generateAudio,
    regenerateAudio,
    updateSectionText,
    regenerateSection,
  };
};