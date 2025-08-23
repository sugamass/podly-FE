import React from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import { BGMOption } from "@/types/audio";
import { bgmOptions } from "@/constants/bgmOptions";

interface BGMSelectionSectionProps {
  selectedBGM: BGMOption;
  isBgmOpen: boolean;
  onSetIsBgmOpen: (isOpen: boolean) => void;
  onSelectBGM: (bgm: BGMOption) => void;
}

const BGMSelectionSection: React.FC<BGMSelectionSectionProps> = ({
  selectedBGM,
  isBgmOpen,
  onSetIsBgmOpen,
  onSelectBGM,
}) => {
  const handleBGMPreview = (bgm: BGMOption) => {
    Alert.alert("BGMプレビュー", `${bgm.name}を30秒間プレビュー再生します。`, [
      { text: "キャンセル", style: "cancel" },
      {
        text: "再生",
        onPress: () => {
          console.log(`Playing BGM preview for ${bgm.name}`);
        },
      },
    ]);
  };

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
        onPress={() => onSetIsBgmOpen(!isBgmOpen)}
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
                    onSelectBGM(bgm);
                    onSetIsBgmOpen(false);
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
  );
};

export default BGMSelectionSection;