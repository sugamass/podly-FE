// import { podcasts } from "@/mocks/podcasts";
import { create } from "zustand";
import { audioPlayerService, PodcastTrack } from "@/services/AudioPlayerService";
import { 
  fetchPublishedPodcasts, 
  fetchAllPodcasts,
  toggleLike,
  getLikeStatus,
  getUserLikedPodcasts
} from "@/services/supabase";
import { UIPodcast, convertSupabaseToUIPodcast } from "@/types/podcast";

interface PodcastState {
  podcasts: UIPodcast[];
  currentPodcastIndex: number;
  currentPlayingPodcastId: string | null;
  isPlaying: boolean;
  // currentTime: number;
  // duration: number;
  playbackRate: number;
  likedPodcasts: Set<string>;
  savedPodcasts: Set<string>;
  processingLikes: Set<string>;
  likeActionQueue: Map<string, number>;
  
  // タブ遷移関連の状態
  wasPlayingBeforeTabSwitch: boolean;
  shouldAutoResume: boolean;
  isHomeTabFocused: boolean;
  manuallyPaused: boolean;
  
  // Supabase関連の状態
  isLoading: boolean;
  error: string | null;
  hasNextPage: boolean;
  currentPage: number;
  useSupabaseData: boolean;
  
  cleanup: () => void;

  setCurrentPodcastIndex: (index: number) => void;
  switchToPodcast: (index: number) => Promise<void>;
  togglePlayPause: () => void;
  setIsPlaying: (isPlaying: boolean) => void;
  // setCurrentTime: (time: number) => void;
  // setDuration: (duration: number) => void;
  setPlaybackRate: (rate: number) => void;
  
  // いいね機能関連のアクション
  togglePodcastLike: (podcastId: string) => Promise<boolean>;
  processLikeQueue: (podcastId: string) => Promise<boolean>;
  loadUserLikedPodcasts: () => Promise<void>;
  updatePodcastLikeState: (podcastId: string, isLiked: boolean, likeCount: number) => void;
  
  // タブ遷移関連のアクション
  setHomeTabFocused: (focused: boolean) => void;
  savePlayingStateForTabSwitch: () => void;
  tryAutoResumeOnTabFocus: () => void;
  
  // Supabase関連のアクション
  fetchPodcasts: (page?: number) => Promise<void>;
  loadMorePodcasts: () => Promise<void>;
  setUseSupabaseData: (useSupabase: boolean) => void;
  refreshPodcasts: () => Promise<void>;
}

export const usePodcastStore = create<PodcastState>((set, get) => ({
  podcasts: [], // 初期状態は空配列、Supabaseから取得
  currentPodcastIndex: 0,
  currentPlayingPodcastId: null,
  isPlaying: false,
  playbackRate: 1.0,
  likedPodcasts: new Set<string>(),
  savedPodcasts: new Set<string>(),
  processingLikes: new Set<string>(),
  likeActionQueue: new Map<string, number>(),
  
  // タブ遷移関連の初期状態
  wasPlayingBeforeTabSwitch: false,
  shouldAutoResume: false,
  isHomeTabFocused: true,
  manuallyPaused: false,
  
  // Supabase関連の初期状態
  isLoading: false, // 初期状態をfalseに戻す
  error: null,
  hasNextPage: true,
  currentPage: 0,
  useSupabaseData: true, // デフォルトでSupabaseデータを使用

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

    // 同じポッドキャストの場合は処理をスキップ
    if (state.currentPlayingPodcastId === podcast.id) {
      set({ currentPodcastIndex: index });
      return;
    }

    const podcastTrack: PodcastTrack = {
      id: podcast.id,
      url: podcast.audioUrl || '',
      title: podcast.title,
      artist: podcast.host?.name || 'Unknown Host',
      artwork: podcast.imageUrl || '',
      duration: parseInt(podcast.duration.split(':')[0]) * 60 + parseInt(podcast.duration.split(':')[1]),
    };

    // 先にcurrentPlayingPodcastIdを更新して、UIの切り替えを先行させる
    set({
      currentPodcastIndex: index,
      currentPlayingPodcastId: podcast.id,
    });

    const success = await audioPlayerService.switchTrack(podcastTrack);
    
    if (success) {
      set({ 
        isPlaying: true,
        manuallyPaused: false // 新しいトラックの再生開始時は手動停止フラグをリセット
      });
    } else {
      // 失敗した場合は前の状態に戻す
      set({
        currentPlayingPodcastId: state.currentPlayingPodcastId,
        isPlaying: false,
      });
    }
  },

  togglePlayPause: () => {
    const state = get();
    const newIsPlaying = !state.isPlaying;
    
    if (newIsPlaying) {
      audioPlayerService.play();
      set({ manuallyPaused: false });
    } else {
      audioPlayerService.pause();
      // 手動で停止した場合は自動再生フラグをリセット
      set({ 
        shouldAutoResume: false,
        manuallyPaused: true 
      });
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

  // いいね機能関連のメソッド
  togglePodcastLike: async (podcastId: string) => {
    const state = get();
    const currentLikeState = state.likedPodcasts.has(podcastId);
    const currentPodcast = state.podcasts.find(p => p.id === podcastId);
    const originalLikes = currentPodcast?.likes || 0;
    
    // 操作キューに追加（高速連続タップ対応）
    const currentQueue = state.likeActionQueue.get(podcastId) || 0;
    const actionDelta = currentLikeState ? -1 : +1;
    const newQueueValue = currentQueue + actionDelta;
    
    console.log('🎯 togglePodcastLike called:', {
      podcastId,
      currentLikeState,
      originalLikes,
      currentQueue,
      actionDelta,
      newQueueValue
    });
    
    // キューが0なら操作をキャンセル（いいね→取り消し→いいね のような場合）
    if (newQueueValue === 0) {
      state.likeActionQueue.delete(podcastId);
      console.log('🔄 Queue canceled out, removing from queue');
      
      // 元の状態に戻す
      const revertedLikedPodcasts = new Set(state.likedPodcasts);
      const originalState = !state.likedPodcasts.has(podcastId);
      
      if (originalState) {
        revertedLikedPodcasts.add(podcastId);
      } else {
        revertedLikedPodcasts.delete(podcastId);
      }
      
      const revertedPodcasts = state.podcasts.map(podcast => {
        if (podcast.id === podcastId) {
          return {
            ...podcast,
            isLiked: originalState,
            likes: originalLikes
          };
        }
        return podcast;
      });
      
      set({ 
        likedPodcasts: revertedLikedPodcasts,
        podcasts: revertedPodcasts,
        likeActionQueue: new Map(state.likeActionQueue)
      });
      
      return true; // UIは更新されたので成功として扱う
    }
    
    // キューを更新
    const newQueue = new Map(state.likeActionQueue);
    newQueue.set(podcastId, newQueueValue);
    
    // 既に処理中の場合はキューのみ更新
    if (state.processingLikes.has(podcastId)) {
      console.log('⚠️ Already processing, updating queue only:', newQueueValue);
      set({ likeActionQueue: newQueue });
      return true;
    }
    
    // 処理中リストに追加
    const newProcessingLikes = new Set(state.processingLikes);
    newProcessingLikes.add(podcastId);
    
    // UIを先に更新（楽観的更新）
    const newLikedPodcasts = new Set(state.likedPodcasts);
    if (currentLikeState) {
      newLikedPodcasts.delete(podcastId);
      console.log('📤 Removing from liked set');
    } else {
      newLikedPodcasts.add(podcastId);
      console.log('📥 Adding to liked set');
    }
    
    // ポッドキャストのlikes数を楽観的に更新
    const updatedPodcasts = state.podcasts.map(podcast => {
      if (podcast.id === podcastId) {
        const newLikes = currentLikeState ? podcast.likes - 1 : podcast.likes + 1;
        console.log('📊 Updating likes count:', podcast.likes, '→', newLikes);
        return {
          ...podcast,
          isLiked: !currentLikeState,
          likes: newLikes
        };
      }
      return podcast;
    });
    
    // UIを即座に更新
    set({ 
      likedPodcasts: newLikedPodcasts,
      podcasts: updatedPodcasts,
      processingLikes: newProcessingLikes,
      likeActionQueue: newQueue
    });

    // バックエンドを更新（キューの累積値を処理）
    const result = await get().processLikeQueue(podcastId);
    return result;
  },

  processLikeQueue: async (podcastId: string) => {
    const state = get();
    const queuedActions = state.likeActionQueue.get(podcastId) || 0;
    
    console.log('🔄 Processing like queue for podcast:', podcastId, 'queued actions:', queuedActions);
    
    if (queuedActions === 0) {
      // キューが空の場合は処理完了
      const finalProcessingLikes = new Set(state.processingLikes);
      finalProcessingLikes.delete(podcastId);
      
      set({ processingLikes: finalProcessingLikes });
      return true;
    }
    
    try {
      // キューに基づいてバックエンド操作を実行
      let success = true;
      let currentResult = { success: true, isLiked: false, likeCount: 0 };
      
      for (let i = 0; i < Math.abs(queuedActions); i++) {
        currentResult = await toggleLike(podcastId);
        if (!currentResult.success) {
          success = false;
          break;
        }
      }
      
      // 処理中リストから削除
      const finalProcessingLikes = new Set(get().processingLikes);
      finalProcessingLikes.delete(podcastId);
      
      // キューをクリア
      const newQueue = new Map(state.likeActionQueue);
      newQueue.delete(podcastId);
      
      if (!success) {
        console.error('❌ processLikeQueue failed, reverting state');
        
        // 失敗した場合は元の状態に戻す
        const originalPodcast = state.podcasts.find(p => p.id === podcastId);
        const originalLikes = originalPodcast?.likes || 0;
        const originalLikedState = state.likedPodcasts.has(podcastId);
        
        // 楽観的更新を元に戻す
        const revertedLikedPodcasts = new Set(state.likedPodcasts);
        if (originalLikedState) {
          revertedLikedPodcasts.add(podcastId);
        } else {
          revertedLikedPodcasts.delete(podcastId);
        }
        
        const revertedPodcasts = state.podcasts.map(podcast => {
          if (podcast.id === podcastId) {
            return {
              ...podcast,
              isLiked: originalLikedState,
              likes: originalLikes
            };
          }
          return podcast;
        });
        
        set({ 
          likedPodcasts: revertedLikedPodcasts,
          podcasts: revertedPodcasts,
          processingLikes: finalProcessingLikes,
          likeActionQueue: newQueue
        });
        
        return false;
      } else {
        // 成功した場合は正確な値で更新
        get().updatePodcastLikeState(podcastId, currentResult.isLiked, currentResult.likeCount);
        
        set(state => ({
          ...state,
          processingLikes: finalProcessingLikes,
          likeActionQueue: newQueue
        }));
        
        console.log('✅ processLikeQueue completed successfully');
        
        // 追加のキューがあるかチェック
        const updatedState = get();
        const remainingQueue = updatedState.likeActionQueue.get(podcastId) || 0;
        if (remainingQueue !== 0) {
          console.log('🔄 Additional queue detected, processing again:', remainingQueue);
          // 再帰的に処理
          return await get().processLikeQueue(podcastId);
        }
        
        return true;
      }
    } catch (error) {
      console.error('❌ processLikeQueue error:', error);
      
      // エラー時の処理中リストから削除とキュークリア
      const finalProcessingLikes = new Set(get().processingLikes);
      finalProcessingLikes.delete(podcastId);
      
      const newQueue = new Map(state.likeActionQueue);
      newQueue.delete(podcastId);
      
      set({ 
        processingLikes: finalProcessingLikes,
        likeActionQueue: newQueue
      });
      
      return false;
    }
  },

  loadUserLikedPodcasts: async () => {
    try {
      const likedPodcastIds = await getUserLikedPodcasts();
      set({ likedPodcasts: new Set(likedPodcastIds) });
      
      // 現在のポッドキャストリストのisLiked状態を更新
      const state = get();
      const updatedPodcasts = state.podcasts.map(podcast => ({
        ...podcast,
        isLiked: likedPodcastIds.includes(podcast.id)
      }));
      
      set({ podcasts: updatedPodcasts });
    } catch (error) {
      console.error('❌ Failed to load user liked podcasts:', error);
    }
  },

  updatePodcastLikeState: (podcastId: string, isLiked: boolean, likeCount: number) => {
    const state = get();
    const newLikedPodcasts = new Set(state.likedPodcasts);
    
    if (isLiked) {
      newLikedPodcasts.add(podcastId);
    } else {
      newLikedPodcasts.delete(podcastId);
    }
    
    const updatedPodcasts = state.podcasts.map(podcast => {
      if (podcast.id === podcastId) {
        return {
          ...podcast,
          isLiked,
          likes: likeCount
        };
      }
      return podcast;
    });
    
    set({ 
      likedPodcasts: newLikedPodcasts,
      podcasts: updatedPodcasts
    });
  },

  // タブ遷移関連のメソッド
  setHomeTabFocused: (focused: boolean) => {
    set({ isHomeTabFocused: focused });
  },

  savePlayingStateForTabSwitch: () => {
    const state = get();
    if (state.currentPlayingPodcastId) {
      set({
        wasPlayingBeforeTabSwitch: state.isPlaying,
        shouldAutoResume: state.isPlaying
      });
    }
  },

  tryAutoResumeOnTabFocus: () => {
    const state = get();
    if (state.shouldAutoResume && state.currentPlayingPodcastId && !state.isPlaying) {
      audioPlayerService.play();
      set({ 
        isPlaying: true,
        shouldAutoResume: false // 一度再生したらフラグをリセット
      });
    }
  },

  // Supabase関連のメソッド
  fetchPodcasts: async (page: number = 0) => {
    const state = get();
    if (!state.useSupabaseData) return;

    set({ isLoading: true, error: null });

    try {
      const limit = 10;
      
      // まず公開済みポッドキャストを試す
      let supabasePodcasts = await fetchPublishedPodcasts(page, limit);
      
      // 結果が空の場合、全てのポッドキャストを試す
      if (!supabasePodcasts || supabasePodcasts.length === 0) {
        supabasePodcasts = await fetchAllPodcasts(page, limit);
      }
      
      // ユーザーのいいね状態を取得
      const likedPodcastIds = await getUserLikedPodcasts();
      const likedPodcastsSet = new Set(likedPodcastIds);
      
      const uiPodcasts = supabasePodcasts.map(podcast => {
        const isLiked = likedPodcastsSet.has(podcast.id);
        return convertSupabaseToUIPodcast(podcast, isLiked, false);
      });

      if (page === 0) {
        // 最初のページの場合は置き換え
        set({
          podcasts: uiPodcasts,
          currentPage: page,
          hasNextPage: uiPodcasts.length === limit,
          isLoading: false,
          likedPodcasts: likedPodcastsSet,
        });
      } else {
        // 追加ページの場合は既存のデータに追加
        set(state => ({
          podcasts: [...state.podcasts, ...uiPodcasts],
          currentPage: page,
          hasNextPage: uiPodcasts.length === limit,
          isLoading: false,
          likedPodcasts: likedPodcastsSet,
        }));
      }
    } catch (error) {
      console.error('❌ Failed to fetch podcasts:', error);
      set({
        error: error instanceof Error ? error.message : 'ポッドキャストの取得に失敗しました',
        isLoading: false,
      });
    }
  },

  loadMorePodcasts: async () => {
    const state = get();
    if (!state.hasNextPage || state.isLoading || !state.useSupabaseData) return;

    await get().fetchPodcasts(state.currentPage + 1);
  },

  setUseSupabaseData: (useSupabase: boolean) => {
    set({ useSupabaseData: useSupabase });
    
    if (useSupabase) {
      // Supabaseデータに切り替え時は最初のページを取得
      get().fetchPodcasts(0);
    }
  },

  refreshPodcasts: async () => {
    const state = get();
    
    if (state.useSupabaseData) {
      await get().fetchPodcasts(0);
    }
  },
}));
