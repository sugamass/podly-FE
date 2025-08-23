import { useState, useEffect, useMemo } from "react";
import { VoiceOption } from "@/types/audio";
import { ScriptData as GeneratedScriptData } from "@/services/scriptGenerator";

export const useSpeakerVoices = (
  scriptData: GeneratedScriptData[],
  selectedVoice: VoiceOption
) => {
  const [speakerVoiceMap, setSpeakerVoiceMap] = useState<Record<string, VoiceOption>>({});
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

  const handleSelectSpeakerVoice = (speaker: string, voice: VoiceOption) => {
    setSpeakerVoiceMap((prev) => ({ ...prev, [speaker]: voice }));
  };

  return {
    speakerVoiceMap,
    openSpeaker,
    setOpenSpeaker,
    uniqueSpeakersList,
    handleSelectSpeakerVoice,
  };
};