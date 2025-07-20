// import { podcasts } from "@/mocks/podcasts";
import { create } from "zustand";
import { audioPlayerService, PodcastTrack } from "@/services/AudioPlayerService";
import { 
  fetchPublishedPodcasts, 
  fetchAllPodcasts
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
  // likedPodcasts: Set<string>;
  // savedPodcasts: Set<string>;
  
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
  currentTime: 0,
  duration: 0,
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
      
      const uiPodcasts = supabasePodcasts.map(podcast => 
        convertSupabaseToUIPodcast(podcast, false, false)
      );

      if (page === 0) {
        // 最初のページの場合は置き換え
        set({
          podcasts: uiPodcasts,
          currentPage: page,
          hasNextPage: uiPodcasts.length === limit,
          isLoading: false,
        });
      } else {
        // 追加ページの場合は既存のデータに追加
        set(state => ({
          podcasts: [...state.podcasts, ...uiPodcasts],
          currentPage: page,
          hasNextPage: uiPodcasts.length === limit,
          isLoading: false,
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
