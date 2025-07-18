import { podcasts } from "@/mocks/podcasts";
import { create } from "zustand";
import { audioPlayerService, PodcastTrack } from "@/services/AudioPlayerService";

interface PodcastState {
  podcasts: typeof podcasts;
  currentPodcastIndex: number;
  currentPlayingPodcastId: string | null;
  isPlaying: boolean;
  // currentTime: number;
  // duration: number;
  playbackRate: number;
  // likedPodcasts: Set<string>;
  // savedPodcasts: Set<string>;
  cleanup: () => void;

  setCurrentPodcastIndex: (index: number) => void;
  switchToPodcast: (index: number) => Promise<void>;
  togglePlayPause: () => void;
  setIsPlaying: (isPlaying: boolean) => void;
  // setCurrentTime: (time: number) => void;
  // setDuration: (duration: number) => void;
  setPlaybackRate: (rate: number) => void;
}

export const usePodcastStore = create<PodcastState>((set, get) => ({
  podcasts: podcasts,
  currentPodcastIndex: 0,
  currentPlayingPodcastId: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  playbackRate: 1.0,
  likedPodcasts: new Set<string>(),
  savedPodcasts: new Set<string>(),

  cleanup: () => {
    audioPlayerService.cleanup();
    set({
      isPlaying: false,
      // currentTime: 0,
      // duration: 0,
      playbackRate: 1.0,
      currentPodcastIndex: 0,
      currentPlayingPodcastId: null,
    });
  },

  setCurrentPodcastIndex: (index: number) => {
    set({
      currentPodcastIndex: index,
      // currentTime: 0,
    });
  },

  switchToPodcast: async (index: number) => {
    const state = get();
    const podcast = state.podcasts[index];
    
    if (!podcast) return;

    const podcastTrack: PodcastTrack = {
      id: podcast.id,
      url: podcast.audioUrl,
      title: podcast.title,
      artist: podcast.host?.name || 'Unknown Host',
      artwork: podcast.imageUrl,
      duration: parseInt(podcast.duration.split(':')[0]) * 60 + parseInt(podcast.duration.split(':')[1]),
    };

    const success = await audioPlayerService.switchTrack(podcastTrack);
    
    if (success) {
      set({
        currentPodcastIndex: index,
        currentPlayingPodcastId: podcast.id,
        isPlaying: true,
      });
    }
  },

  togglePlayPause: () => {
    const state = get();
    const newIsPlaying = !state.isPlaying;
    
    if (newIsPlaying) {
      audioPlayerService.play();
    } else {
      audioPlayerService.pause();
    }
    
    set({ isPlaying: newIsPlaying });
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
    audioPlayerService.setPlaybackRate(rate);
    set({ playbackRate: rate });
  },
}));
