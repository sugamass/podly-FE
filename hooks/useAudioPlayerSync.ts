import { useEffect } from 'react';
import { useFocusEffect } from 'expo-router';
import React from 'react';
import TrackPlayer from 'react-native-track-player';
import { usePodcastStore } from '@/store/podcastStore';
import { AudioPlayerService } from '@/services/AudioPlayerService';
import { logger } from '@/utils/logger';

/**
 * 音声プレイヤーの同期とタブフォーカス管理を行うカスタムフック
 */
export const useAudioPlayerSync = () => {
  const audioPlayerService = new AudioPlayerService();
  const { 
    setIsPlaying,
    restartCurrentPodcastFromBeginning 
  } = usePodcastStore();

  // AudioPlayerServiceの状態同期を設定
  useEffect(() => {
    audioPlayerService.setStateUpdateCallback(setIsPlaying);
    
    return () => {
      audioPlayerService.setStateUpdateCallback(() => {});
    };
  }, [setIsPlaying]);

  // タブフォーカス時の自動再生・停止制御
  useFocusEffect(
    React.useCallback(() => {
      // ホームタブにフォーカスした時の処理
      logger.debug('Home tab focused - restarting current podcast from beginning');
      restartCurrentPodcastFromBeginning();
      
      return () => {
        // ホームタブからフォーカスが外れた時の処理
        logger.debug('Home tab unfocused - pausing audio');
        TrackPlayer.pause().catch((error) => {
          logger.error('音声停止エラー', error);
        });
      };
    }, [restartCurrentPodcastFromBeginning])
  );
};