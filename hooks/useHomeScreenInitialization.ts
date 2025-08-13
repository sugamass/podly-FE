import { useEffect } from 'react';
import { usePodcastStore } from '@/store/podcastStore';
import { logger } from '@/utils/logger';

/**
 * ホーム画面の初期化処理を管理するカスタムフック
 * ポッドキャストデータの取得とユーザー関連データの読み込みを担当
 */
export const useHomeScreenInitialization = () => {
  const { 
    podcasts, 
    isLoading, 
    error,
    useSupabaseData,
    refreshPodcasts,
    switchToPodcast,
    loadUserLikedPodcasts,
    loadUserSavedPodcasts
  } = usePodcastStore();

  // 初回データ取得
  useEffect(() => {
    logger.debug('App initialization', {
      useSupabaseData,
      podcastsLength: podcasts.length,
      isLoading,
      error
    });
    
    // Supabaseデータを取得（デフォルトで有効） - 一度だけ実行
    if (useSupabaseData && podcasts.length === 0 && !isLoading && !error) {
      logger.debug('Triggering refresh podcasts...');
      refreshPodcasts().catch(err => {
        logger.error('Refresh podcasts failed', err);
      });
    }
  }, [useSupabaseData, refreshPodcasts]);
  
  // ポッドキャストが読み込まれた後の処理
  useEffect(() => {
    if (podcasts.length > 0) {
      logger.debug('Podcasts loaded, switching to first podcast');
      switchToPodcast(0);
      
      // ユーザーのいいね・保存情報を読み込む
      logger.debug('Loading user liked and saved podcasts...');
      loadUserLikedPodcasts().catch(err => {
        logger.error('Failed to load user liked podcasts', err);
      });
      loadUserSavedPodcasts().catch(err => {
        logger.error('Failed to load user saved podcasts', err);
      });
    }
  }, [podcasts.length, switchToPodcast, loadUserLikedPodcasts, loadUserSavedPodcasts]);

  return { 
    podcasts, 
    isLoading, 
    error 
  };
};