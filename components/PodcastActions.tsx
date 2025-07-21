import Colors from "@/constants/Colors";
import { formatNumber } from "@/utils/formatNumber";
import { usePodcastStore } from "@/store/podcastStore";
import { useAuthStore } from "@/store/authStore";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import React, { useState, useRef } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  Animated,
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
  isSaved: initialIsSaved,
}: PodcastActionsProps) {
  const { 
    togglePodcastLike, 
    togglePodcastSave, 
    podcasts,
    pendingLikeRequests,
    pendingSaveRequests
  } = usePodcastStore();
  const { user } = useAuthStore();
  
  // アニメーション用のref
  const likeScaleAnim = useRef(new Animated.Value(1)).current;
  const saveScaleAnim = useRef(new Animated.Value(1)).current;
  
  // アニメーション中状態管理
  const [isLikeAnimating, setIsLikeAnimating] = useState(false);
  const [isSaveAnimating, setIsSaveAnimating] = useState(false);
  
  // 現在のポッドキャストの状態を取得
  const currentPodcast = podcasts.find(p => p.id === podcastId);
  const isLiked = currentPodcast?.isLiked ?? initialIsLiked;
  const currentLikes = currentPodcast?.likes ?? likes;
  const isSaved = currentPodcast?.isSaved ?? initialIsSaved;
  const currentSaves = currentPodcast?.save_count ?? 0;
  
  // リクエスト進行中状態を取得
  const isLikeRequestPending = pendingLikeRequests.has(podcastId);
  const isSaveRequestPending = pendingSaveRequests.has(podcastId);

  // アニメーション関数
  const animateLike = () => {
    setIsLikeAnimating(true);
    
    Animated.sequence([
      Animated.timing(likeScaleAnim, {
        toValue: 1.3,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(likeScaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsLikeAnimating(false); // 完了時にフラグリセット
    });
  };

  const animateSave = () => {
    setIsSaveAnimating(true);
    
    Animated.sequence([
      Animated.timing(saveScaleAnim, {
        toValue: 1.3,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(saveScaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsSaveAnimating(false); // 完了時にフラグリセット
    });
  };

  const handleLike = async () => {
    // アニメーション中またはリクエスト進行中は早期リターン
    if (isLikeAnimating || isLikeRequestPending) {
      console.log('🚫 Like action blocked:', { isLikeAnimating, isLikeRequestPending });
      return;
    }
    
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
    
    // OFF→ONの場合のみアニメーション実行
    if (!isLiked) {
      animateLike();
    }
    
    // ハプティクスフィードバック
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    // ストアの重複排除機能付きトグル処理
    const success = await togglePodcastLike(podcastId);
    if (!success) {
      console.log('🚫 Like toggle was blocked due to pending request');
    }
  };

  const handleSave = async () => {
    // アニメーション中またはリクエスト進行中は早期リターン
    if (isSaveAnimating || isSaveRequestPending) {
      console.log('🚫 Save action blocked:', { isSaveAnimating, isSaveRequestPending });
      return;
    }
    
    // ログイン状態チェック
    if (!user) {
      Alert.alert(
        'ログインが必要です',
        '保存するにはログインしてください。',
        [
          { text: 'キャンセル', style: 'cancel' },
          { text: 'ログイン', onPress: () => {
            console.log('ログインモーダルを開く');
          }}
        ]
      );
      return;
    }
    
    // OFF→ONの場合のみアニメーション実行
    if (!isSaved) {
      animateSave();
    }
    
    // ハプティクスフィードバック
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    // ストアの重複排除機能付きトグル処理
    const success = await togglePodcastSave(podcastId);
    if (!success) {
      console.log('🚫 Save toggle was blocked due to pending request');
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
        activeOpacity={isLikeAnimating || isLikeRequestPending ? 1 : 0.7}
        disabled={isLikeAnimating || isLikeRequestPending}
      >
        <Animated.View style={{ transform: [{ scale: likeScaleAnim }] }}>
          <Ionicons
            name={isLiked ? "heart" : "heart-outline"}
            size={28}
            color={isLiked ? "#FF4444" : Colors.dark.text}
          />
        </Animated.View>
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

      <TouchableOpacity 
        style={styles.actionButton} 
        onPress={handleSave}
        activeOpacity={isSaveAnimating || isSaveRequestPending ? 1 : 0.7}
        disabled={isSaveAnimating || isSaveRequestPending}
      >
        <Animated.View style={{ transform: [{ scale: saveScaleAnim }] }}>
          <Ionicons
            name={isSaved ? "bookmark" : "bookmark-outline"}
            size={28}
            color={isSaved ? Colors.dark.highlight : Colors.dark.text}
          />
        </Animated.View>
        <Text style={styles.actionText}>
          {formatNumber(currentSaves)}
        </Text>
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
