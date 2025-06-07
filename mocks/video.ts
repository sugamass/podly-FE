export interface Video {
    id: string;
    videoUrl: string;
    user: {
      id: string;
      username: string;
      avatar: string;
    };
    description: string;
    likes: number;
    comments: number;
    shares: number;
    music: string;
    timestamp: number;
  }
  
  export const videos: Video[] = [
    {
      id: '1',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-woman-waving-outdoors-1226-large.mp4',
      user: {
        id: 'user1',
        username: 'dancequeen',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80',
      },
      description: "Trying out this new dance trend! #dance #viral",
      likes: 45200,
      comments: 1024,
      shares: 3200,
      music: "Original Sound - dancequeen",
      timestamp: Date.now() - 3600000,
    },
    {
      id: '2',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-dancing-under-changing-lights-1240-large.mp4',
      user: {
        id: 'user2',
        username: 'musiclover',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80',
      },
      description: "Night vibes 🌃 #nightlife #party",
      likes: 120500,
      comments: 3200,
      shares: 8700,
      music: "Party Anthem - DJ Beats",
      timestamp: Date.now() - 86400000,
    },
    {
      id: '3',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-running-through-the-forest-32707-large.mp4',
      user: {
        id: 'user3',
        username: 'naturelover',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80',
      },
      description: "Morning run in the forest 🌲 #nature #fitness",
      likes: 67800,
      comments: 890,
      shares: 2100,
      music: "Morning Motivation - Fitness Tracks",
      timestamp: Date.now() - 172800000,
    },
    {
      id: '4',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-woman-talking-on-video-call-with-smartphone-42740-large.mp4',
      user: {
        id: 'user4',
        username: 'techgirl',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80',
      },
      description: "Work from home life! #remote #tech",
      likes: 32400,
      comments: 567,
      shares: 1200,
      music: "Productive Vibes - Lofi Beats",
      timestamp: Date.now() - 259200000,
    },
    {
      id: '5',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-under-multicolored-lights-1237-large.mp4',
      user: {
        id: 'user5',
        username: 'creativeminds',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80',
      },
      description: "New art project coming soon! #art #creative",
      likes: 89700,
      comments: 2300,
      shares: 5600,
      music: "Creative Flow - Ambient Sounds",
      timestamp: Date.now() - 345600000,
    }
  ];