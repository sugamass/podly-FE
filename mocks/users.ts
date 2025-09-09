export interface User {
    id: string;
    username: string;
    fullName: string;
    avatar: string | null;
    bio: string;
    followers: number;
    following: number;
    likes: number;
    podcasts: number; // Changed from videos to podcasts for consistency
  }
  
  export const currentUser: User = {
    id: 'current',
    username: 'yourusername',
    fullName: 'Your Name',
    avatar: null,
    bio: 'Digital creator | Making content about tech and lifestyle',
    followers: 12500,
    following: 350,
    likes: 45600,
    podcasts: 24 // Changed from videos to podcasts
  };
  
  export const users: User[] = [
    {
      id: 'user1',
      username: 'dancequeen',
      fullName: 'Dance Queen',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80',
      bio: 'Professional dancer | Dance tutorials and trends',
      followers: 1200000,
      following: 250,
      likes: 15000000,
      podcasts: 120 // Changed from videos to podcasts
    },
    {
      id: 'user2',
      username: 'musiclover',
      fullName: 'Music Lover',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80',
      bio: 'Music producer | Creating beats and vibes',
      followers: 850000,
      following: 420,
      likes: 9500000,
      podcasts: 85 // Changed from videos to podcasts
    },
    {
      id: 'user3',
      username: 'naturelover',
      fullName: 'Nature Explorer',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80',
      bio: 'Outdoor enthusiast | Sharing beautiful places',
      followers: 650000,
      following: 320,
      likes: 7800000,
      podcasts: 65 // Changed from videos to podcasts
    },
    {
      id: 'user4',
      username: 'techgirl',
      fullName: 'Tech Girl',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80',
      bio: 'Tech enthusiast | Sharing tips and reviews',
      followers: 780000,
      following: 210,
      likes: 8900000,
      podcasts: 78 // Changed from videos to podcasts
    },
    {
      id: 'user5',
      username: 'creativeminds',
      fullName: 'Creative Mind',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80',
      bio: 'Artist and designer | Creating beautiful things',
      followers: 920000,
      following: 380,
      likes: 10200000,
      podcasts: 92 // Changed from videos to podcasts
    }
  ];