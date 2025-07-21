import Colors from "@/constants/Colors";
import { formatNumber } from "@/utils/formatNumber";
import { usePodcastStore } from "@/store/podcastStore";
import { useAuthStore } from "@/store/authStore";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import React, { useState } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";

interface PodcastActionsProps {
  podcastId: string;
  hostId: string;
  hostAvatar: string;
  likes: number;
  comments: number;
  shares: number;
  onCommentPress: () => void;
  isLiked: boolean;
  isSaved: boolean;
}

export default function PodcastActions({
  podcastId,
  hostId,
  hostAvatar,
  likes,
  comments,
  shares,
  onCommentPress,
  isLiked: initialIsLiked,
}: PodcastActionsProps) {
  const [isSaved, setIsSaved] = useState(false);
  
  const { togglePodcastLike, podcasts } = usePodcastStore();
  const { user } = useAuthStore();
  
  // 現在のポッドキャストの状態を取得（シンプルな実装）
  const currentPodcast = podcasts.find(p => p.id === podcastId);
  const isLiked = currentPodcast?.isLiked ?? initialIsLiked;
  const currentLikes = currentPodcast?.likes ?? likes;

  const handleLike = async () => {
    // ログイン状態チェック
    if (!user) {
      Alert.alert(
        'ログインが必要です',
        'いいねをするにはログインしてください。',
        [
          { text: 'キャンセル', style: 'cancel' },
          { text: 'ログイン', onPress: () => {
            console.log('ログインモーダルを開く');
          }}
        ]
      );
      return;
    }
    
    // ハプティクスフィードバック
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    // ストアの楽観的更新のみを使用（シンプル・高速）
    togglePodcastLike(podcastId);
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const handleComment = () => {
    onCommentPress();
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.avatarContainer}>
        <Image source={{ uri: hostAvatar }} style={styles.avatar} />
        <View style={styles.followIcon}>
          <Text style={styles.followText}>+</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.actionButton} 
        onPress={handleLike}
        activeOpacity={0.7}
      >
        <Ionicons
          name={isLiked ? "heart" : "heart-outline"}
          size={28}
          color={isLiked ? "#FF4444" : Colors.dark.text}
        />
        <Text style={styles.actionText}>
          {formatNumber(currentLikes)}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionButton} onPress={handleComment}>
        <Ionicons
          name="chatbubble-outline"
          size={28}
          color={Colors.dark.text}
        />
        <Text style={styles.actionText}>{formatNumber(comments)}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionButton}>
        <Ionicons name="share-outline" size={28} color={Colors.dark.text} />
        <Text style={styles.actionText}>{formatNumber(shares)}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionButton} onPress={handleSave}>
        <Ionicons
          name={isSaved ? "bookmark" : "bookmark-outline"}
          size={28}
          color={isSaved ? Colors.dark.highlight : Colors.dark.text}
        />
        <Text style={styles.actionText}>Save</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    right: 4,
    bottom: 160,
    alignItems: "center",
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: Colors.dark.primary,
  },
  followIcon: {
    position: "absolute",
    bottom: -10,
    backgroundColor: Colors.dark.primary,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  followText: {
    color: Colors.dark.text,
    fontSize: 16,
    fontWeight: "bold",
  },
  actionButton: {
    alignItems: "center",
    marginBottom: 20,
  },
  actionText: {
    color: Colors.dark.text,
    marginTop: 5,
    fontSize: 12,
  },
});
