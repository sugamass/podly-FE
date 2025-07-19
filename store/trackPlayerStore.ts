import TrackPlayer, { Capability } from "react-native-track-player";
import { create } from "zustand";

interface TrackPlayerState {
  isInitialized: boolean;
  isPlaying: boolean;
  currentTrack: string | null;
  setupPlayer: () => Promise<void>;
  resetPlayer: () => Promise<void>;
  setIsPlaying: (playing: boolean) => void;
}

export const useTrackPlayerStore = create<TrackPlayerState>((set, get) => ({
  isInitialized: false,
  isPlaying: false,
  currentTrack: null,

  setupPlayer: async () => {
    const { isInitialized } = get();

    if (isInitialized) {
      return;
    }

    try {
      // Check if player is already initialized
      const activeTrackIndex = await TrackPlayer.getActiveTrackIndex().catch(
        () => null
      );

      if (activeTrackIndex === null) {
        // Setup the player only if not already initialized
        await TrackPlayer.setupPlayer({
          waitForBuffer: true,
        });
      }

      // Update options
      await TrackPlayer.updateOptions({
        capabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.SkipToNext,
          Capability.SkipToPrevious,
          Capability.SeekTo,
        ],
        compactCapabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.SeekTo,
        ],
        // progressUpdateEventInterval を削除：リスナーが無いため不要
      });

      set({ isInitialized: true });
    } catch (error) {
      console.error("Error setting up TrackPlayer:", error);
    }
  },

  resetPlayer: async () => {
    try {
      await TrackPlayer.reset();
      set({ isInitialized: false, isPlaying: false, currentTrack: null });
    } catch (error) {
      console.error("Error resetting TrackPlayer:", error);
    }
  },

  setIsPlaying: (playing: boolean) => {
    set({ isPlaying: playing });
  },
}));
