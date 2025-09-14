import {
  AudioPlayerService,
  PodcastTrack,
} from "@/services/AudioPlayerService";
import {
  fetchPodcastsService,
  getUserLikedPodcastsService,
  getUserSavedPodcastsService,
  togglePodcastLikeService,
  togglePodcastSaveService,
} from "@/services/podcastService";
import { UIPodcast } from "@/types/podcast";
import { DeviceEventEmitter } from "react-native";
import { create } from "zustand";

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

  // 共通のインタラクション処理関数
  togglePodcastInteraction: (
    podcastId: string,
    type: "like" | "save",
    serviceFunction: (
      podcastId: string
    ) => Promise<{ success: boolean; error?: string }>
  ) => Promise<boolean>;

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
  updatePodcastLikeState: (
    podcastId: string,
    isLiked: boolean,
    likeCount: number
  ) => void;

  // 保存機能関連のアクション
  togglePodcastSave: (podcastId: string) => Promise<boolean>;
  loadUserSavedPodcasts: () => Promise<void>;
  updatePodcastSaveState: (
    podcastId: string,
    isSaved: boolean,
    saveCount: number
  ) => void;

  // タブ遷移関連のアクション
  setHomeTabFocused: (focused: boolean) => void;
  savePlayingStateForTabSwitch: () => void;
  restartCurrentPodcastFromBeginning: () => void;

  // Supabase関連のアクション
  fetchPodcasts: (page?: number) => Promise<void>;
  loadMorePodcasts: () => Promise<void>;
  setUseSupabaseData: (useSupabase: boolean) => void;
  refreshPodcasts: () => Promise<void>;

  // 自動進行機能
  autoAdvanceToNext: () => void;
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
      url: podcast.audioUrl,
      title: podcast.title,
      artist: podcast.host.name,
      artwork: podcast.imageUrl,
      duration:
        parseInt(podcast.duration.split(":")[0]) * 60 +
        parseInt(podcast.duration.split(":")[1]),
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
        manuallyPaused: false, // 新しいトラックの再生開始時は手動停止フラグをリセット
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
        manuallyPaused: true,
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
    return await get().togglePodcastInteraction(
      podcastId,
      "like",
      togglePodcastLikeService
    );
  },

  loadUserLikedPodcasts: async () => {
    const likedPodcastIds = await getUserLikedPodcastsService();
    set({ likedPodcasts: new Set(likedPodcastIds) });

    // 現在のポッドキャストリストのisLiked状態を更新
    const state = get();
    const updatedPodcasts = state.podcasts.map((podcast) => ({
      ...podcast,
      isLiked: likedPodcastIds.includes(podcast.id),
    }));

    set({ podcasts: updatedPodcasts });
  },

  updatePodcastLikeState: (
    podcastId: string,
    isLiked: boolean,
    likeCount: number
  ) => {
    const state = get();
    const newLikedPodcasts = new Set(state.likedPodcasts);

    if (isLiked) {
      newLikedPodcasts.add(podcastId);
    } else {
      newLikedPodcasts.delete(podcastId);
    }

    const updatedPodcasts = state.podcasts.map((podcast) => {
      if (podcast.id === podcastId) {
        return {
          ...podcast,
          isLiked,
          likes: likeCount,
        };
      }
      return podcast;
    });

    set({
      likedPodcasts: newLikedPodcasts,
      podcasts: updatedPodcasts,
    });
  },

  // 保存機能関連のメソッド（重複排除版）
  togglePodcastSave: async (podcastId: string) => {
    return await get().togglePodcastInteraction(
      podcastId,
      "save",
      togglePodcastSaveService
    );
  },

  loadUserSavedPodcasts: async () => {
    const savedPodcastIds = await getUserSavedPodcastsService();
    set({ savedPodcasts: new Set(savedPodcastIds) });

    // 現在のポッドキャストリストのisSaved状態を更新
    const state = get();
    const updatedPodcasts = state.podcasts.map((podcast) => ({
      ...podcast,
      isSaved: savedPodcastIds.includes(podcast.id),
    }));

    set({ podcasts: updatedPodcasts });

    console.log("User saved podcasts loaded:", savedPodcastIds.length);
  },

  updatePodcastSaveState: (
    podcastId: string,
    isSaved: boolean,
    saveCount: number
  ) => {
    const state = get();
    const newSavedPodcasts = new Set(state.savedPodcasts);

    if (isSaved) {
      newSavedPodcasts.add(podcastId);
    } else {
      newSavedPodcasts.delete(podcastId);
    }

    const updatedPodcasts = state.podcasts.map((podcast) => {
      if (podcast.id === podcastId) {
        return {
          ...podcast,
          isSaved,
          save_count: saveCount,
        };
      }
      return podcast;
    });

    set({
      savedPodcasts: newSavedPodcasts,
      podcasts: updatedPodcasts,
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
        shouldAutoResume: state.isPlaying,
      });
    }
  },

  restartCurrentPodcastFromBeginning: () => {
    const state = get();
    if (state.currentPlayingPodcastId) {
      console.log(
        "Restarting current podcast from beginning:",
        state.currentPlayingPodcastId
      );

      // Track Playerで現在のトラックを0秒位置から再生開始
      audioPlayerService.seekTo(0);
      audioPlayerService.play();

      set({
        isPlaying: true,
        manuallyPaused: false,
        shouldAutoResume: false, // フラグをリセット
      });
    }
  },

  // 共通のインタラクション処理関数
  togglePodcastInteraction: async (
    podcastId: string,
    type: "like" | "save",
    serviceFunction: (
      podcastId: string
    ) => Promise<{ success: boolean; error?: string }>
  ) => {
    const state = get();
    const pendingRequests =
      type === "like" ? state.pendingLikeRequests : state.pendingSaveRequests;
    const currentState =
      type === "like" ? state.likedPodcasts : state.savedPodcasts;

    // 既に進行中のリクエストがある場合は早期リターン
    if (pendingRequests.has(podcastId)) {
      console.log(`${type} request already pending for:`, podcastId);
      return false;
    }

    const isCurrentlyActive = currentState.has(podcastId);

    console.log(
      `toggle${type.charAt(0).toUpperCase() + type.slice(1)} called:`,
      {
        podcastId,
        [`current${type.charAt(0).toUpperCase() + type.slice(1)}State`]:
          isCurrentlyActive,
        pending: pendingRequests.size,
      }
    );

    // リクエストを進行中に追加
    if (type === "like") {
      set((state) => ({
        pendingLikeRequests: new Set([...state.pendingLikeRequests, podcastId]),
      }));
    } else {
      set((state) => ({
        pendingSaveRequests: new Set([...state.pendingSaveRequests, podcastId]),
      }));
    }

    // UIを即座に更新
    if (type === "like") {
      set((state) => ({
        likedPodcasts: isCurrentlyActive
          ? new Set([...state.likedPodcasts].filter((id) => id !== podcastId))
          : new Set([...state.likedPodcasts, podcastId]),
        podcasts: state.podcasts.map((podcast) =>
          podcast.id === podcastId
            ? {
                ...podcast,
                isLiked: !isCurrentlyActive,
                likes: (podcast.likes || 0) + (isCurrentlyActive ? -1 : 1),
              }
            : podcast
        ),
      }));
    } else {
      set((state) => ({
        savedPodcasts: isCurrentlyActive
          ? new Set([...state.savedPodcasts].filter((id) => id !== podcastId))
          : new Set([...state.savedPodcasts, podcastId]),
        podcasts: state.podcasts.map((podcast) =>
          podcast.id === podcastId
            ? {
                ...podcast,
                isSaved: !isCurrentlyActive,
                save_count:
                  (podcast.save_count || 0) + (isCurrentlyActive ? -1 : 1),
              }
            : podcast
        ),
      }));
    }

    try {
      const result = await serviceFunction(podcastId);
      if (result.success) {
        console.log(`${type} request completed:`, podcastId);
      } else {
        throw new Error(result.error || "Unknown error");
      }
    } catch (error) {
      console.error(`${type} failed, reverting state:`, error);

      // エラー時のみロールバック
      if (type === "like") {
        set((state) => ({
          likedPodcasts: isCurrentlyActive
            ? new Set([...state.likedPodcasts, podcastId])
            : new Set(
                [...state.likedPodcasts].filter((id) => id !== podcastId)
              ),
          podcasts: state.podcasts.map((podcast) =>
            podcast.id === podcastId
              ? {
                  ...podcast,
                  isLiked: isCurrentlyActive,
                  likes: (podcast.likes || 0) + (isCurrentlyActive ? 1 : -1),
                }
              : podcast
          ),
        }));
      } else {
        set((state) => ({
          savedPodcasts: isCurrentlyActive
            ? new Set([...state.savedPodcasts, podcastId])
            : new Set(
                [...state.savedPodcasts].filter((id) => id !== podcastId)
              ),
          podcasts: state.podcasts.map((podcast) =>
            podcast.id === podcastId
              ? {
                  ...podcast,
                  isSaved: isCurrentlyActive,
                  save_count:
                    (podcast.save_count || 0) + (isCurrentlyActive ? 1 : -1),
                }
              : podcast
          ),
        }));
      }
    } finally {
      // 進行中リクエストから削除
      if (type === "like") {
        set((state) => ({
          pendingLikeRequests: new Set(
            [...state.pendingLikeRequests].filter((id) => id !== podcastId)
          ),
        }));
      } else {
        set((state) => ({
          pendingSaveRequests: new Set(
            [...state.pendingSaveRequests].filter((id) => id !== podcastId)
          ),
        }));
      }
    }

    return true;
  },

  // Supabase関連のメソッド
  fetchPodcasts: async (page: number = 0) => {
    const state = get();
    if (!state.useSupabaseData) return;

    set({ isLoading: true, error: null });

    try {
      const limit = 10;
      const result = await fetchPodcastsService(page, limit);

      if (page === 0) {
        // 最初のページの場合は置き換え
        set({
          podcasts: result.podcasts,
          currentPage: page,
          hasNextPage: result.hasNextPage,
          isLoading: false,
          likedPodcasts: new Set(result.likedPodcastIds),
        });
      } else {
        // 追加ページの場合は既存のデータに追加
        set((state) => ({
          podcasts: [...state.podcasts, ...result.podcasts],
          currentPage: page,
          hasNextPage: result.hasNextPage,
          isLoading: false,
          likedPodcasts: new Set(result.likedPodcastIds),
        }));
      }
    } catch (error) {
      console.error("Failed to fetch podcasts:", error);
      set({
        error:
          error instanceof Error
            ? error.message
            : "ポッドキャストの取得に失敗しました",
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

  // 自動進行機能: 次のポッドキャストに自動遷移
  autoAdvanceToNext: () => {
    const state = get();
    const nextIndex = state.currentPodcastIndex + 1;

    // 次のポッドキャストが存在するかチェック
    if (nextIndex < state.podcasts.length) {
      // UI側に自動スクロールのイベントを送信
      DeviceEventEmitter.emit("autoAdvanceToNext", { nextIndex });
    } else if (state.hasNextPage && state.useSupabaseData) {
      // 次のページがある場合は追加読み込み
      get()
        .loadMorePodcasts()
        .then(() => {
          // 読み込み完了後に再度次のポッドキャストへ進行
          const updatedState = get();
          if (nextIndex < updatedState.podcasts.length) {
            DeviceEventEmitter.emit("autoAdvanceToNext", { nextIndex });
          }
        });
    } else {
      console.log("No more podcasts available for auto advance");
    }
  },
}));
