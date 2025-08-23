import React from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import { VoiceOption } from "@/types/audio";
import { voiceOptions } from "@/constants/voiceOptions";

interface VoiceSelectionSectionProps {
  uniqueSpeakersList: string[];
  speakerVoiceMap: Record<string, VoiceOption>;
  selectedVoice: VoiceOption;
  openSpeaker: string | null;
  onSetOpenSpeaker: (speaker: string | null) => void;
  onSelectSpeakerVoice: (speaker: string, voice: VoiceOption) => void;
}

const VoiceSelectionSection: React.FC<VoiceSelectionSectionProps> = ({
  uniqueSpeakersList,
  speakerVoiceMap,
  selectedVoice,
  openSpeaker,
  onSetOpenSpeaker,
  onSelectSpeakerVoice,
}) => {
  const handleVoicePreview = (voice: VoiceOption) => {
    Alert.alert(
      "ボイスプレビュー",
      `${voice.name}の声で「こんにちは、テスト音声です」を再生します。`,
      [
        { text: "キャンセル", style: "cancel" },
        {
          text: "再生",
          onPress: () => {
            console.log(`Playing preview for ${voice.name}`);
          },
        },
      ]
    );
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
        👥 話者ごとのボイス設定
      </Text>

      {uniqueSpeakersList.length === 0 ? (
        <Text style={{ color: Colors.dark.subtext, fontSize: 12 }}>
          原稿に話者が含まれていません。上の原稿作成で話者を指定してください。
        </Text>
      ) : (
        uniqueSpeakersList.map((speaker) => {
          const current = speakerVoiceMap[speaker]?.name ?? selectedVoice.name;
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
                  onSetOpenSpeaker(openSpeaker === speaker ? null : speaker)
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
                        (speakerVoiceMap[speaker]?.id ?? selectedVoice.id) ===
                        voice.id;
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
                            onSelectSpeakerVoice(speaker, voice);
                            onSetOpenSpeaker(null);
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
  );
};

export default VoiceSelectionSection;