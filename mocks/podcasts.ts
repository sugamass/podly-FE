export interface Podcast {
  id: string;
  audioUrl: string;
  imageUrl: string;
  title: string;
  host: {
    id: string;
    name: string;
    avatar: string;
    verified: boolean;
  };
  duration: string;
  description: string;
  likes: number;
  comments: number;
  shares: number;
  category: string;
  tags: string[];
  timestamp: number;
  isLiked: boolean;
  isSaved: boolean;
}

export const podcasts: Podcast[] = [
  {
    id: "c8a1f4e7-2b9d-4f6a-7e3c-5b8f1a4d9c2e",
    audioUrl:
      "https://podly-dev-audio-files.s3.amazonaws.com/tmp_full_hls/82257d80_d42a_4aa3_9566_3aee75fa3b5f.m3u8",
    imageUrl:
      "https://images.unsplash.com/photo-1589903308904-1010c2294adc?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    title: "AGIとは？",
    host: {
      id: "host1",
      name: "Alex Morgan",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80",
      verified: true,
    },
    duration: "12:45",
    description:
      "How AI is transforming business operations and what executives need to know about implementation strategies. #AI #BusinessTech",
    likes: 4520,
    comments: 324,
    shares: 1200,
    category: "Technology",
    tags: ["AI", "Business", "Technology", "Digital Transformation"],
    timestamp: Date.now() - 3600000,
    isLiked: false,
    isSaved: false,
  },
  {
    id: "a7f2b8e4-9c3d-4f7a-8b1e-5d6c9a2f4e8b",
    audioUrl:
      "https://podly-dev-audio-files.s3.amazonaws.com/tmp_full_hls/4db2d4ef_a15f_43dd_9e16_797eeac12d15.m3u8",
    imageUrl:
      "https://images.unsplash.com/photo-1444653614773-995cb1ef9efa?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    title: "スティーブ・ジョブズ",
    host: {
      id: "host2",
      name: "Sarah Chen",
      avatar:
        "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80",
      verified: true,
    },
    duration: "18:30",
    description:
      "Exploring ESG investments and how sustainability is reshaping the financial landscape. #Finance #Sustainability",
    likes: 3850,
    comments: 210,
    shares: 950,
    category: "Finance",
    tags: ["ESG", "Investing", "Sustainability", "Finance"],
    timestamp: Date.now() - 86400000,
    isLiked: false,
    isSaved: false,
  },
];
