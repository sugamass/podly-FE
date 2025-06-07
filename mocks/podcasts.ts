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
  }
  
  export const podcasts: Podcast[] = [
    {
      id: '1',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      imageUrl: 'https://images.unsplash.com/photo-1589903308904-1010c2294adc?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      title: "The Future of AI in Business Operations",
      host: {
        id: 'host1',
        name: 'Alex Morgan',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80',
        verified: true,
      },
      duration: '12:45',
      description: "How AI is transforming business operations and what executives need to know about implementation strategies. #AI #BusinessTech",
      likes: 4520,
      comments: 324,
      shares: 1200,
      category: "Technology",
      tags: ["AI", "Business", "Technology", "Digital Transformation"],
      timestamp: Date.now() - 3600000,
    },
    {
      id: '2',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
      imageUrl: 'https://images.unsplash.com/photo-1444653614773-995cb1ef9efa?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      title: "Sustainable Investment Strategies for 2025",
      host: {
        id: 'host2',
        name: 'Sarah Chen',
        avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80',
        verified: true,
      },
      duration: '18:30',
      description: "Exploring ESG investments and how sustainability is reshaping the financial landscape. #Finance #Sustainability",
      likes: 3850,
      comments: 210,
      shares: 950,
      category: "Finance",
      tags: ["ESG", "Investing", "Sustainability", "Finance"],
      timestamp: Date.now() - 86400000,
    },
    {
      id: '3',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
      imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      title: "Blockchain Revolution in Supply Chain",
      host: {
        id: 'host3',
        name: 'Michael Torres',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80',
        verified: false,
      },
      duration: '22:15',
      description: "How blockchain technology is creating transparent and efficient supply chains across industries. #Blockchain #SupplyChain",
      likes: 2780,
      comments: 185,
      shares: 720,
      category: "Technology",
      tags: ["Blockchain", "Supply Chain", "Logistics", "Technology"],
      timestamp: Date.now() - 172800000,
    },
    {
      id: '4',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
      imageUrl: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      title: "Remote Work Culture: Building Effective Teams",
      host: {
        id: 'host4',
        name: 'Emma Wilson',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80',
        verified: true,
      },
      duration: '15:20',
      description: "Strategies for building and maintaining high-performing remote teams in the digital age. #RemoteWork #Leadership",
      likes: 5240,
      comments: 430,
      shares: 1850,
      category: "Business",
      tags: ["Remote Work", "Leadership", "Team Building", "Management"],
      timestamp: Date.now() - 259200000,
    },
    {
      id: '5',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
      imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      title: "Quantum Computing: Business Applications",
      host: {
        id: 'host5',
        name: 'David Park',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80',
        verified: true,
      },
      duration: '24:50',
      description: "Understanding quantum computing and its potential applications for business innovation. #QuantumComputing #Innovation",
      likes: 3120,
      comments: 265,
      shares: 890,
      category: "Technology",
      tags: ["Quantum Computing", "Innovation", "Future Tech", "Business Technology"],
      timestamp: Date.now() - 345600000,
    }
  ];