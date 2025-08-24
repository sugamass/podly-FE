import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";

interface AudioPreviewSectionProps {
  isAudioGenerated: boolean;
  isPlaying: boolean;
  currentPlayingId: string | null;
  fullAudioUrl: string | null;
  onPlaySection: (sectionId: string) => void;
  onStopAudio: () => void;
}

const AudioPreviewSection: React.FC<AudioPreviewSectionProps> = ({
  isAudioGenerated,
  isPlaying,
  currentPlayingId,
  fullAudioUrl,
  onPlaySection,
  onStopAudio,
}) => {
  if (!isAudioGenerated) {
    return null;
  }

  return (
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
        onPress={() => {
          if (isPlaying && currentPlayingId === "full-podcast") {
            onStopAudio();
          } else {
            onPlaySection("full-podcast");
          }
        }}
        disabled={!fullAudioUrl}
      >
        <Ionicons
          name={
            currentPlayingId === "full-podcast"
              ? "stop"
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
          {currentPlayingId === "full-podcast"
            ? "停止"
            : "全体を再生"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default AudioPreviewSection;