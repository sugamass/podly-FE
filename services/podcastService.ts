import {
  fetchAllPodcasts,
  fetchPublishedPodcasts,
  getUserLikedPodcasts,
  getUserSavedPodcasts,
  toggleLike,
  toggleSave,
} from "@/services/supabase";
import { UIPodcast, convertSupabaseToUIPodcast } from "@/types/podcast";
import { withErrorHandling, toAppError } from '../utils/errorHandler';
import { logger } from '../utils/logger';

export interface PodcastFetchResult {
  podcasts: UIPodcast[];
  likedPodcastIds: string[];
  hasNextPage: boolean;
}

export interface ToggleResult {
  success: boolean;
  error?: string;
}

/**
 * ポッドキャストデータの取得
 */
export async function fetchPodcastsService(
  page: number = 0,
  limit: number = 10
): Promise<PodcastFetchResult> {
  return withErrorHandling(async () => {
    logger.info("Fetching podcasts", { page, limit }, 'fetchPodcastsService');
    
    // まず公開済みポッドキャストを試す
    let supabasePodcasts = await fetchPublishedPodcasts(page, limit);

    // 結果が空の場合、全てのポッドキャストを試す
    if (!supabasePodcasts || supabasePodcasts.length === 0) {
      supabasePodcasts = await fetchAllPodcasts(page, limit);
    }

    // ユーザーのいいね状態を取得
    const likedPodcastIds = await getUserLikedPodcasts();
    const likedPodcastsSet = new Set(likedPodcastIds);

    const uiPodcasts = supabasePodcasts.map((podcast) => {
      const isLiked = likedPodcastsSet.has(podcast.id);
      return convertSupabaseToUIPodcast(podcast, isLiked, false);
    });

    logger.info("Podcasts fetched successfully", {
      count: uiPodcasts.length,
      hasNextPage: uiPodcasts.length === limit
    }, 'fetchPodcastsService');

    return {
      podcasts: uiPodcasts,
      likedPodcastIds,
      hasNextPage: uiPodcasts.length === limit,
    };
  }, 'fetchPodcastsService');
}

/**
 * いいね機能のトグル
 */
export async function togglePodcastLikeService(
  podcastId: string
): Promise<ToggleResult> {
  return withErrorHandling(async () => {
    await toggleLike(podcastId);
    logger.info("Podcast like toggled successfully", { podcastId }, 'togglePodcastLikeService');
    return { success: true };
  }, 'togglePodcastLikeService').catch((error) => {
    logger.error("Failed to toggle podcast like", error, 'togglePodcastLikeService');
    return {
      success: false,
      error: error.message || "Unknown error",
    };
  });
}

/**
 * 保存機能のトグル
 */
export async function togglePodcastSaveService(
  podcastId: string
): Promise<ToggleResult> {
  return withErrorHandling(async () => {
    await toggleSave(podcastId);
    logger.info("Podcast save toggled successfully", { podcastId }, 'togglePodcastSaveService');
    return { success: true };
  }, 'togglePodcastSaveService').catch((error) => {
    logger.error("Failed to toggle podcast save", error, 'togglePodcastSaveService');
    return {
      success: false,
      error: error.message || "Unknown error",
    };
  });
}

/**
 * ユーザーのいいね済みポッドキャスト一覧を取得
 */
export async function getUserLikedPodcastsService(): Promise<string[]> {
  return withErrorHandling(async () => {
    return await getUserLikedPodcasts();
  }, 'getUserLikedPodcastsService').catch((error) => {
    logger.error("Failed to load user liked podcasts", error, 'getUserLikedPodcastsService');
    return [];
  });
}

/**
 * ユーザーの保存済みポッドキャスト一覧を取得
 */
export async function getUserSavedPodcastsService(): Promise<string[]> {
  return withErrorHandling(async () => {
    return await getUserSavedPodcasts();
  }, 'getUserSavedPodcastsService').catch((error) => {
    logger.error("Failed to load user saved podcasts", error, 'getUserSavedPodcastsService');
    return [];
  });
}