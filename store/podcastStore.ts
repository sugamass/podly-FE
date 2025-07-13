import { podcasts } from "@/mocks/podcasts";
import { create } from "zustand";

interface PodcastState {
  podcasts: typeof podcasts;
  currentPodcastIndex: number;
  isPlaying: boolean;
  // currentTime: number;
  // duration: number;
  playbackRate: number;
  // likedPodcasts: Set<string>;
  // savedPodcasts: Set<string>;
  cleanup: () => void;

  setCurrentPodcastIndex: (index: number) => void;
  togglePlayPause: () => void;
  setIsPlaying: (isPlaying: boolean) => void;
  // setCurrentTime: (time: number) => void;
  // setDuration: (duration: number) => void;
  setPlaybackRate: (rate: number) => void;
}

export const usePodcastStore = create<PodcastState>((set, get) => ({
  podcasts: podcasts,
  currentPodcastIndex: 0,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  playbackRate: 1.0,
  likedPodcasts: new Set<string>(),
  savedPodcasts: new Set<string>(),

  cleanup: () => {
    set({
      isPlaying: false,
      // currentTime: 0,
      // duration: 0,
      playbackRate: 1.0,
      currentPodcastIndex: 0,
    });
  },

  setCurrentPodcastIndex: (index: number) => {
    set({
      currentPodcastIndex: index,
      // currentTime: 0,
    });
  },

  togglePlayPause: () => {
    set((state) => ({ isPlaying: !state.isPlaying }));
  },

  setIsPlaying: (isPlaying: boolean) => {
    set({ isPlaying });
  },

  // setCurrentTime: (time: number) => {
  //   set({ currentTime: time });
  // },

  // setDuration: (duration: number) => {
  //   set({ duration });
  // },

  setPlaybackRate: (rate: number) => {
    set({ playbackRate: rate });
  },
}));
