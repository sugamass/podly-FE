import { create } from "zustand";
import { AudioPlayerService, PodcastTrack } from "@/services/AudioPlayerService";
import { 
  fetchPublishedPodcasts, 
  fetchAllPodcasts,
  toggleLike,
  getLikeStatus,
  getUserLikedPodcasts,
  toggleSave,
  getSaveStatus,
  getUserSavedPodcasts
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
  
  // リクエスト重複排除のための状態
  pendingLikeRequests: Set<string>;
  pendingSaveRequests: Set<string>;
  
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
  loadUserLikedPodcasts: () => Promise<void>;
  updatePodcastLikeState: (podcastId: string, isLiked: boolean, likeCount: number) => void;
  
  // 保存機能関連のアクション
  togglePodcastSave: (podcastId: string) => Promise<boolean>;
  loadUserSavedPodcasts: () => Promise<void>;
  updatePodcastSaveState: (podcastId: string, isSaved: boolean, saveCount: number) => void;
  
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

const audioPlayerService = new AudioPlayerService();

export const usePodcastStore = create<PodcastState>((set, get) => ({
  podcasts: [], // 初期状態は空配列、Supabaseから取得
  currentPodcastIndex: 0,
  currentPlayingPodcastId: null,
  isPlaying: false,
  playbackRate: 1.0,
  likedPodcasts: new Set<string>(),
  savedPodcasts: new Set<string>(),
  
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
  
  // リクエスト重複排除の初期状態
  pendingLikeRequests: new Set<string>(),
  pendingSaveRequests: new Set<string>(),

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

  // いいね機能関連のメソッド（重複排除版）
  togglePodcastLike: async (podcastId: string) => {
    const state = get();
    
    // 既に進行中のリクエストがある場合は早期リターン
    if (state.pendingLikeRequests.has(podcastId)) {
      console.log('🚫 Like request already pending for:', podcastId);
      return false;
    }
    
    const currentLikeState = state.likedPodcasts.has(podcastId);
    
    console.log('🎯 togglePodcastLike called:', {
      podcastId,
      currentLikeState,
      pending: state.pendingLikeRequests.size
    });
    
    // リクエストを進行中に追加
    set(state => ({
      pendingLikeRequests: new Set([...state.pendingLikeRequests, podcastId])
    }));
    
    // UIを即座に更新
    set(state => ({
      likedPodcasts: currentLikeState 
        ? new Set([...state.likedPodcasts].filter(id => id !== podcastId))
        : new Set([...state.likedPodcasts, podcastId]),
      podcasts: state.podcasts.map(podcast => 
        podcast.id === podcastId 
          ? { 
              ...podcast, 
              isLiked: !currentLikeState,
              likes: (podcast.likes || 0) + (currentLikeState ? -1 : 1)
            }
          : podcast
      )
    }));
    
    try {
      // バックエンド処理
      await toggleLike(podcastId);
      console.log('✅ Like request completed:', podcastId);
    } catch (error) {
      console.error('❌ toggleLike failed, reverting state:', error);
      
      // エラー時のみロールバック
      set(state => ({
        likedPodcasts: currentLikeState
          ? new Set([...state.likedPodcasts, podcastId])
          : new Set([...state.likedPodcasts].filter(id => id !== podcastId)),
        podcasts: state.podcasts.map(podcast => 
          podcast.id === podcastId 
            ? { 
                ...podcast, 
                isLiked: currentLikeState,
                likes: (podcast.likes || 0) + (currentLikeState ? 1 : -1)
              }
            : podcast
        )
      }));
    } finally {
      // 進行中リクエストから削除
      set(state => ({
        pendingLikeRequests: new Set([...state.pendingLikeRequests].filter(id => id !== podcastId))
      }));
    }
    
    return true;
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

  // 保存機能関連のメソッド（重複排除版）
  togglePodcastSave: async (podcastId: string) => {
    const state = get();
    
    // 既に進行中のリクエストがある場合は早期リターン
    if (state.pendingSaveRequests.has(podcastId)) {
      console.log('🚫 Save request already pending for:', podcastId);
      return false;
    }
    
    const currentSaveState = state.savedPodcasts.has(podcastId);
    
    console.log('🎯 togglePodcastSave called:', {
      podcastId,
      currentSaveState,
      pending: state.pendingSaveRequests.size
    });
    
    // リクエストを進行中に追加
    set(state => ({
      pendingSaveRequests: new Set([...state.pendingSaveRequests, podcastId])
    }));
    
    // UIを即座に更新
    set(state => ({
      savedPodcasts: currentSaveState 
        ? new Set([...state.savedPodcasts].filter(id => id !== podcastId))
        : new Set([...state.savedPodcasts, podcastId]),
      podcasts: state.podcasts.map(podcast => 
        podcast.id === podcastId 
          ? { 
              ...podcast, 
              isSaved: !currentSaveState,
              save_count: (podcast.save_count || 0) + (currentSaveState ? -1 : 1)
            }
          : podcast
      )
    }));
    
    try {
      // バックエンド処理
      await toggleSave(podcastId);
      console.log('✅ Save request completed:', podcastId);
    } catch (error) {
      console.error('❌ toggleSave failed, reverting state:', error);
      
      // エラー時のみロールバック
      set(state => ({
        savedPodcasts: currentSaveState
          ? new Set([...state.savedPodcasts, podcastId])
          : new Set([...state.savedPodcasts].filter(id => id !== podcastId)),
        podcasts: state.podcasts.map(podcast => 
          podcast.id === podcastId 
            ? { 
                ...podcast, 
                isSaved: currentSaveState,
                save_count: (podcast.save_count || 0) + (currentSaveState ? 1 : -1)
              }
            : podcast
        )
      }));
    } finally {
      // 進行中リクエストから削除
      set(state => ({
        pendingSaveRequests: new Set([...state.pendingSaveRequests].filter(id => id !== podcastId))
      }));
    }
    
    return true;
  },


  loadUserSavedPodcasts: async () => {
    try {
      const savedPodcastIds = await getUserSavedPodcasts();
      set({ savedPodcasts: new Set(savedPodcastIds) });
      
      // 現在のポッドキャストリストのisSaved状態を更新
      const state = get();
      const updatedPodcasts = state.podcasts.map(podcast => ({
        ...podcast,
        isSaved: savedPodcastIds.includes(podcast.id)
      }));
      
      set({ podcasts: updatedPodcasts });
      
      console.log('✅ User saved podcasts loaded:', savedPodcastIds.length);
    } catch (error) {
      console.error('❌ Failed to load user saved podcasts:', error);
    }
  },

  updatePodcastSaveState: (podcastId: string, isSaved: boolean, saveCount: number) => {
    const state = get();
    const newSavedPodcasts = new Set(state.savedPodcasts);
    
    if (isSaved) {
      newSavedPodcasts.add(podcastId);
    } else {
      newSavedPodcasts.delete(podcastId);
    }
    
    const updatedPodcasts = state.podcasts.map(podcast => {
      if (podcast.id === podcastId) {
        return {
          ...podcast,
          isSaved,
          save_count: saveCount
        };
      }
      return podcast;
    });
    
    set({ 
      savedPodcasts: newSavedPodcasts,
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
