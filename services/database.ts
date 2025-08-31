import { supabase } from './supabase';

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
  try {
    // ポッドキャスト数を取得
    const { count: podcastCount, error: podcastError } = await supabase
      .from('podcasts')
      .select('*', { count: 'exact', head: true })
      .eq('creator_id', userId);

    if (podcastError) {
      console.error('Podcast count error:', podcastError);
    }

    // フォロワー数を取得 (このユーザーをフォローしている人数)
    const { count: followerCount, error: followerError } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', userId);

    if (followerError) {
      console.error('Follower count error:', followerError);
    }

    // フォロー中数を取得 (このユーザーがフォローしている人数)
    const { count: followingCount, error: followingError } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', userId);

    if (followingError) {
      console.error('Following count error:', followingError);
    }

    return {
      podcasts: podcastCount || 0,
      followers: followerCount || 0,
      following: followingCount || 0,
    };
  } catch (error) {
    console.error('Get user statistics error:', error);
    return {
      podcasts: 0,
      followers: 0,
      following: 0,
    };
  }
}