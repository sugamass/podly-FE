import { ScriptData as GeneratedScriptData } from "@/services/scriptGenerator";
import { VoiceOption } from "@/types/audio";
import { useEffect, useMemo, useState } from "react";

export const useSpeakerVoices = (scriptData: GeneratedScriptData[]) => {
  // デフォルトボイスの定義
  const defaultVoice: VoiceOption = {
    id: "alloy",
    name: "alloy",
    description: "Neutral, balanced voice",
    gender: "female",
    language: "en",
  };
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

  // 未設定スピーカーにデフォルトボイスを適用
  useEffect(() => {
    setSpeakerVoiceMap((prev) => {
      const next = { ...prev } as Record<string, VoiceOption>;
      uniqueSpeakersList.forEach((speaker) => {
        if (!next[speaker]) {
          next[speaker] = defaultVoice;
        }
      });
      return next;
    });
  }, [uniqueSpeakersList]);

  const handleSelectSpeakerVoice = (speaker: string, voice: VoiceOption) => {
    setSpeakerVoiceMap((prev) => ({ ...prev, [speaker]: voice }));
  };

  return {
    speakerVoiceMap,
    openSpeaker,
    setOpenSpeaker,
    uniqueSpeakersList,
    handleSelectSpeakerVoice,
    defaultVoice,
  };
};
