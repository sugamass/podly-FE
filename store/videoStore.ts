import { create } from 'zustand';
import { videos } from '@/mocks/videos';

interface VideoState {
  videos: typeof videos;
  currentVideoIndex: number;
  likedVideos: Set<string>;
  setCurrentVideoIndex: (index: number) => void;
  toggleLike: (videoId: string) => void;
  isLiked: (videoId: string) => boolean;
}

export const useVideoStore = create<VideoState>((set, get) => ({
  videos: videos,
  currentVideoIndex: 0,
  likedVideos: new Set<string>(),
  
  setCurrentVideoIndex: (index: number) => {
    set({ currentVideoIndex: index });
  },
  
  toggleLike: (videoId: string) => {
    const { likedVideos } = get();
    const newLikedVideos = new Set(likedVideos);
    
    if (newLikedVideos.has(videoId)) {
      newLikedVideos.delete(videoId);
    } else {
      newLikedVideos.add(videoId);
    }
    
    set({ likedVideos: newLikedVideos });
  },
  
  isLiked: (videoId: string) => {
    return get().likedVideos.has(videoId);
  }
}));