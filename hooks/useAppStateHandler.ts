import { useEffect } from "react";
import { AppState } from "react-native";
import { cleanupTrackPlayerService } from "@/services/TrackPlayerService";
import { AudioPlayerService } from "@/services/AudioPlayerService";
import type { AppState as AppStateType } from "@/types/app";

export const useAppStateHandler = () => {
  const audioPlayerService = new AudioPlayerService();
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateType) => {
      if (nextAppState === "background" || nextAppState === "inactive") {
        cleanupTrackPlayerService();
        audioPlayerService.cleanup();
      }
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange as (state: string) => void
    );

    return () => {
      subscription?.remove();
      cleanupTrackPlayerService();
      audioPlayerService.cleanup();
    };
  }, []);
};