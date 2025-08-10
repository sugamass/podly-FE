import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import Colors from "../constants/Colors";
import { ScriptData } from "../services/scriptGenerator";

interface ScriptSectionCardProps {
  scriptData: ScriptData;
  index: number;
  onUpdate: (index: number, updatedData: ScriptData) => void;
  onDelete?: (index: number) => void;
  showDeleteButton?: boolean;
}

// 話者ごとの色を定義（最大4色でローテーション）
const getSpeakerColor = (speakerName: string): string => {
  const colors = [
    Colors.dark.primary,     // #4F7CFF (プロフェッショナルブルー)
    Colors.dark.secondary,   // #6AD5E8 (ソフトティールアクセント)
    Colors.dark.highlight,   // #F2994A (オレンジハイライト)
    "#9B59B6",              // パープル
  ];
  
  // 話者名のハッシュ値を計算して色を決定
  let hash = 0;
  for (let i = 0; i < speakerName.length; i++) {
    hash = ((hash << 5) - hash + speakerName.charCodeAt(i)) & 0xffffffff;
  }
  
  return colors[Math.abs(hash) % colors.length];
};

export const ScriptSectionCard: React.FC<ScriptSectionCardProps> = ({
  scriptData,
  index,
  onUpdate,
  onDelete,
  showDeleteButton = true,
}) => {
  const speakerName = scriptData.speaker || `話者${index + 1}`;
  const speakerColor = getSpeakerColor(speakerName);

  const handleSpeakerNameChange = (newSpeakerName: string) => {
    onUpdate(index, {
      ...scriptData,
      speaker: newSpeakerName,
    });
  };

  const handleTextChange = (newText: string) => {
    onUpdate(index, {
      ...scriptData,
      text: newText,
    });
  };

  return (
    <View
      style={{
        backgroundColor: Colors.dark.card,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderLeftWidth: 4,
        borderLeftColor: speakerColor,
      }}
    >
      {/* 話者名とアクションボタン */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: speakerColor,
              marginRight: 8,
            }}
          />
          <TextInput
            style={{
              fontSize: 16,
              fontWeight: "bold",
              color: speakerColor,
              flex: 1,
              paddingVertical: 4,
              paddingHorizontal: 8,
              borderRadius: 4,
              backgroundColor: "transparent",
            }}
            value={speakerName}
            onChangeText={handleSpeakerNameChange}
            placeholder="話者名"
            placeholderTextColor={Colors.dark.subtext}
            maxLength={20}
          />
        </View>

        {showDeleteButton && onDelete && (
          <TouchableOpacity
            onPress={() => onDelete(index)}
            style={{
              backgroundColor: Colors.dark.background,
              borderRadius: 16,
              width: 32,
              height: 32,
              alignItems: "center",
              justifyContent: "center",
              marginLeft: 8,
            }}
          >
            <Ionicons
              name="close"
              size={16}
              color={Colors.dark.subtext}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* 原稿テキスト */}
      <TextInput
        style={{
          backgroundColor: Colors.dark.background,
          borderRadius: 8,
          padding: 12,
          color: Colors.dark.text,
          fontSize: 15,
          lineHeight: 22,
          borderWidth: 1,
          borderColor: Colors.dark.border,
          minHeight: 80,
          textAlignVertical: "top",
        }}
        value={scriptData.text || ""}
        onChangeText={handleTextChange}
        multiline
        placeholder="話す内容を入力してください..."
        placeholderTextColor={Colors.dark.subtext}
      />

      {/* キャプション（もしあれば） */}
      {scriptData.caption && (
        <Text
          style={{
            fontSize: 12,
            color: Colors.dark.subtext,
            marginTop: 8,
            fontStyle: "italic",
          }}
        >
          {scriptData.caption}
        </Text>
      )}
    </View>
  );
};