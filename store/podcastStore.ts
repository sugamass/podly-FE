import { podcasts } from "@/mocks/podcasts";
import { create } from "zustand";

interface PodcastState {
  podcasts: typeof podcasts;
  currentPodcastIndex: number;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
  likedPodcasts: Set<string>;
  savedPodcasts: Set<string>;
  cleanup: () => void;

  setCurrentPodcastIndex: (index: number) => void;
  togglePlayPause: () => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setPlaybackRate: (rate: number) => void;
  toggleLike: (podcastId: string) => void;
  toggleSave: (podcastId: string) => void;
  isLiked: (podcastId: string) => boolean;
  isSaved: (podcastId: string) => boolean;
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
      likedPodcasts: new Set<string>(),
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      playbackRate: 1.0,
      currentPodcastIndex: 0,
    });
  },

  setCurrentPodcastIndex: (index: number) => {
    set({
      currentPodcastIndex: index,
      currentTime: 0,
      isPlaying: true,
    });
  },

  togglePlayPause: () => {
    set((state) => ({ isPlaying: !state.isPlaying }));
  },

  setIsPlaying: (isPlaying: boolean) => {
    set({ isPlaying });
  },

  setCurrentTime: (time: number) => {
    set({ currentTime: time });
  },

  setDuration: (duration: number) => {
    set({ duration });
  },

  setPlaybackRate: (rate: number) => {
    set({ playbackRate: rate });
  },

  toggleLike: (podcastId: string) => {
    const { likedPodcasts } = get();
    const newLikedPodcasts = new Set(likedPodcasts);

    if (newLikedPodcasts.has(podcastId)) {
      newLikedPodcasts.delete(podcastId);
    } else {
      newLikedPodcasts.add(podcastId);
    }

    set({ likedPodcasts: newLikedPodcasts });
  },

  toggleSave: (podcastId: string) => {
    const { savedPodcasts } = get();
    const newSavedPodcasts = new Set(savedPodcasts);

    if (newSavedPodcasts.has(podcastId)) {
      newSavedPodcasts.delete(podcastId);
    } else {
      newSavedPodcasts.add(podcastId);
    }

    set({ savedPodcasts: newSavedPodcasts });
  },

  isLiked: (podcastId: string) => {
    return get().likedPodcasts.has(podcastId);
  },

  isSaved: (podcastId: string) => {
    return get().savedPodcasts.has(podcastId);
  },
}));
