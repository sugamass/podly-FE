import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Text, TouchableOpacity } from "react-native";

interface GenerateAudioButtonProps {
  isGenerating: boolean;
  isAudioGenerated: boolean;
  onGenerate: () => void;
  onRegenerate: () => void;
}

const GenerateAudioButton: React.FC<GenerateAudioButtonProps> = ({
  isGenerating,
  isAudioGenerated,
  onGenerate,
  onRegenerate,
}) => {
  if (isAudioGenerated) {
    return null; // 音声生成後は表示しない
  }

  return (
    <TouchableOpacity
      style={{
        marginBottom: 24,
        borderRadius: 16,
        overflow: "hidden",
        opacity: isGenerating ? 0.7 : 1,
      }}
      onPress={onGenerate}
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
  );
};

export default GenerateAudioButton;
