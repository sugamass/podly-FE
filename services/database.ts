import { supabase } from './supabase';
import { withErrorHandling, toAppError } from '../utils/errorHandler';
import { logger } from '../utils/logger';

export interface UserStatistics {
  podcasts: number;
  followers: number;
  following: number;
}

/**
 * ユーザーの統計データを取得
 * @param userId - ユーザーID
 * @returns ポッドキャスト数、フォロワー数、フォロー中数
 */
export async function getUserStatistics(userId: string): Promise<UserStatistics> {
  return withErrorHandling(async () => {
    logger.info('Fetching user statistics', { userId }, 'getUserStatistics');

    // ポッドキャスト数を取得
    const { count: podcastCount, error: podcastError } = await supabase
      .from('podcasts')
      .select('*', { count: 'exact', head: true })
      .eq('creator_id', userId);

    if (podcastError) {
      logger.warn('Podcast count query failed', podcastError, 'getUserStatistics');
    }

    // フォロワー数を取得 (このユーザーをフォローしている人数)
    const { count: followerCount, error: followerError } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', userId);

    if (followerError) {
      logger.warn('Follower count query failed', followerError, 'getUserStatistics');
    }

    // フォロー中数を取得 (このユーザーがフォローしている人数)
    const { count: followingCount, error: followingError } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', userId);

    if (followingError) {
      logger.warn('Following count query failed', followingError, 'getUserStatistics');
    }

    const statistics = {
      podcasts: podcastCount || 0,
      followers: followerCount || 0,
      following: followingCount || 0,
    };

    logger.info('User statistics fetched successfully', { userId, statistics }, 'getUserStatistics');

    return statistics;
  }, 'getUserStatistics').catch((error) => {
    logger.error('Failed to get user statistics', error, 'getUserStatistics');
    return {
      podcasts: 0,
      followers: 0,
      following: 0,
    };
  });
}