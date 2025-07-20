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

    const podcastTrack: PodcastTrack = {
      id: podcast.id,
      url: podcast.audioUrl || '',
      title: podcast.title,
      artist: podcast.host?.name || 'Unknown Host',
      artwork: podcast.imageUrl || '',
      duration: parseInt(podcast.duration.split(':')[0]) * 60 + parseInt(podcast.duration.split(':')[1]),
    };

    const success = await audioPlayerService.switchTrack(podcastTrack);
    
    if (success) {
      set({
        currentPodcastIndex: index,
        currentPlayingPodcastId: podcast.id,
        isPlaying: true,
      });
    }
  },

  togglePlayPause: () => {
    const state = get();
    const newIsPlaying = !state.isPlaying;
    
    if (newIsPlaying) {
      audioPlayerService.play();
    } else {
      audioPlayerService.pause();
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
