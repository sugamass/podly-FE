import { Database, PodcastWithCreator } from '@/services/supabase';

// UI表示用の統一ポッドキャストインターフェース
export interface UIPodcast {
  id: string;
  audioUrl: string | null;
  imageUrl: string | null;
  title: string;
  host: {
    id: string;
    name: string;
    avatar: string | null;
    verified: boolean;
  };
  duration: string; // "12:45" 形式
  description: string | null;
  likes: number;
  comments: number;
  shares: number;
  category: string | null;
  tags: string[];
  timestamp: number;
  isLiked: boolean;
  isSaved: boolean;
  // Supabase固有のフィールド
  summary: string | null;
  script_content: string;
  genre_id: string | null;
  source_urls: string[] | null;
  speakers: string[] | null;
  bgm_id: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  like_count: number | null;
  streams: number | null;
  save_count: number | null;
  situation: string | null;
  voices: string[] | null;
}

// Supabaseデータを UI表示用に変換する関数
export function convertSupabaseToUIPodcast(
  podcast: PodcastWithCreator,
  isLiked: boolean = false,
  isSaved: boolean = false
): UIPodcast {
  // 秒を "MM:SS" 形式に変換
  const formatDuration = (seconds: number | null): string => {
    if (!seconds) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return {
    id: podcast.id,
    audioUrl: podcast.audio_url,
    imageUrl: podcast.image_url || null, // 明示的にnullを設定
    title: podcast.title,
    host: {
      id: podcast.creator?.id || '',
      name: podcast.creator?.display_name || podcast.creator?.username || 'Unknown Host',
      avatar: podcast.creator?.avatar_url || null,
      verified: true, // TODO: 実際の認証状態に基づいて設定
    },
    duration: formatDuration(podcast.duration),
    description: podcast.summary,
    likes: podcast.like_count || 0,
    comments: 0, // TODO: コメント数を計算
    shares: 0, // TODO: シェア数を実装
    category: podcast.genre?.name || null,
    tags: podcast.tags || [],
    timestamp: new Date(podcast.created_at).getTime(),
    isLiked,
    isSaved,
    // Supabase固有のフィールド
    summary: podcast.summary,
    script_content: podcast.script_content,
    genre_id: podcast.genre_id,
    source_urls: podcast.source_urls,
    speakers: podcast.speakers,
    bgm_id: podcast.bgm_id,
    published_at: podcast.published_at,
    created_at: podcast.created_at,
    updated_at: podcast.updated_at,
    like_count: podcast.like_count,
    streams: podcast.streams,
    save_count: podcast.save_count,
    situation: podcast.situation,
    voices: podcast.voices,
  };
}

// モックデータからUI表示用に変換する関数（互換性維持用）
// 現在はSupabaseデータのみ使用のためコメントアウト
/*
export function convertMockToUIPodcast(mockPodcast: any): UIPodcast {
  return {
    id: mockPodcast.id,
    audioUrl: mockPodcast.audioUrl,
    imageUrl: mockPodcast.imageUrl,
    title: mockPodcast.title,
    host: mockPodcast.host,
    duration: mockPodcast.duration,
    description: mockPodcast.description,
    likes: mockPodcast.likes,
    comments: mockPodcast.comments,
    shares: mockPodcast.shares,
    category: mockPodcast.category,
    tags: mockPodcast.tags,
    timestamp: mockPodcast.timestamp,
    isLiked: mockPodcast.isLiked,
    isSaved: mockPodcast.isSaved,
    // Supabase固有のフィールド（デフォルト値）
    summary: mockPodcast.description,
    script_content: '',
    genre_id: null,
    source_urls: null,
    speakers: null,
    bgm_id: null,
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    like_count: mockPodcast.likes,
    streams: 0,
    save_count: 0,
    situation: null,
    voices: null,
  };
}
*/

// Supabase Database 型のエクスポート
export type { Database, PodcastWithCreator };