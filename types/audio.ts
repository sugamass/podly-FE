export type VoiceOption = {
  id: string;
  name: string;
  description: string;
  gender: "male" | "female";
  language: "ja" | "en";
};

export type BGMOption = {
  id: string;
  name: string;
  description: string;
};

export type AudioSection = {
  id: string;
  text: string;
  audioUrl?: string;
  isPlaying?: boolean;
  isRegenerating?: boolean;
};