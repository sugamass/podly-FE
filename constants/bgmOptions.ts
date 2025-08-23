import { BGMOption } from "@/types/audio";

export const bgmOptions: BGMOption[] = [
  {
    id: "starsBeyondEx",
    name: "stars Beyond Ex",
    description: "",
    url: process.env.EXPO_PUBLIC_MUSIC_BASE_URL + "starsBeyondEx.mp3",
  },
  {
    id: "calmForest",
    name: "Calm Forest",
    description: "",
    url: process.env.EXPO_PUBLIC_MUSIC_BASE_URL + "calmForest.mp3",
  },
  {
    id: "calmMind",
    name: "Calm Mind",
    description: "",
    url: process.env.EXPO_PUBLIC_MUSIC_BASE_URL + "calmMind.mp3",
  },
];
