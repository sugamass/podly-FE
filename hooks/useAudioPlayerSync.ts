import { AudioPlayerService } from "@/services/AudioPlayerService";
import { usePodcastStore } from "@/store/podcastStore";
import { logger } from "@/utils/logger";
import { useFocusEffect } from "expo-router";
import React, { useEffect } from "react";
import { DeviceEventEmitter } from "react-native";
import TrackPlayer from "react-native-track-player";

interface UseAudioPlayerSyncParams {
  flatListRef: React.RefObject<any>;
  setActivePodcastIndex: (index: number) => void;
  activePodcastIndex: number;
}

/**
 * 音声プレイヤーの同期とタブフォーカス管理を行うカスタムフック
 */
export const useAudioPlayerSync = ({
  flatListRef,
  setActivePodcastIndex,
  activePodcastIndex,
}: UseAudioPlayerSyncParams) => {
  const audioPlayerService = new AudioPlayerService();
  const {
    podcasts,
    setIsPlaying,
    restartCurrentPodcastFromBeginning,
    autoAdvanceToNext,
    switchToPodcast,
  } = usePodcastStore();

  // AudioPlayerServiceの状態同期を設定
  useEffect(() => {
    audioPlayerService.setStateUpdateCallback(setIsPlaying);

    return () => {
      audioPlayerService.setStateUpdateCallback(() => {});
    };
  }, [setIsPlaying]);

  // 再生完了イベントの監視
  useEffect(() => {
    const handleTrackPlaybackEnded = () => {
      logger.debug("Track playback ended - auto advancing to next podcast");
      autoAdvanceToNext();
    };

    const subscription = DeviceEventEmitter.addListener(
      "trackPlaybackEnded",
      handleTrackPlaybackEnded
    );

    return () => {
      subscription.remove();
    };
  }, [autoAdvanceToNext]);

  // 自動進行UI更新処理
  useEffect(() => {
    const handleAutoAdvance = ({ nextIndex }: { nextIndex: number }) => {
      logger.debug("Auto advancing to next podcast:", {
        currentIndex: activePodcastIndex,
        nextIndex,
        totalItems: podcasts.length,
      });

      if (nextIndex < podcasts.length && flatListRef.current) {
        try {
          // 自動スクロールを実行
          flatListRef.current.scrollToIndex({
            index: nextIndex,
            animated: true,
          });

          // スクロール完了後に音声切り替えを実行（少し遅延をつける）
          setTimeout(() => {
            setActivePodcastIndex(nextIndex);
            switchToPodcast(nextIndex);
          }, 500); // アニメーション完了を待つ
        } catch (error) {
          logger.error("Auto scroll failed:", error);
          logger.warn("Auto advance cancelled due to scroll failure");
        }
      } else {
        logger.warn("Cannot auto advance: invalid index or missing flatListRef", {
          nextIndex,
          totalPodcasts: podcasts.length,
          hasFlatListRef: !!flatListRef.current,
        });
      }
    };

    const subscription = DeviceEventEmitter.addListener(
      "autoAdvanceToNext",
      handleAutoAdvance
    );

    return () => {
      subscription.remove();
    };
  }, [activePodcastIndex, podcasts.length, switchToPodcast, flatListRef, setActivePodcastIndex]);

  // タブフォーカス時の自動再生・停止制御
  useFocusEffect(
    React.useCallback(() => {
      // ホームタブにフォーカスした時の処理
      logger.debug(
        "Home tab focused - restarting current podcast from beginning"
      );
      restartCurrentPodcastFromBeginning();

      return () => {
        // ホームタブからフォーカスが外れた時の処理
        logger.debug("Home tab unfocused - pausing audio");
        TrackPlayer.pause().catch((error) => {
          logger.error("音声停止エラー", error);
        });
      };
    }, [restartCurrentPodcastFromBeginning])
  );
};
