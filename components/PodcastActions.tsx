import Colors from "@/constants/Colors";
import { usePodcastStore } from "@/store/podcastStore";
import { formatNumber } from "@/utils/formatNumber";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import React from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface PodcastActionsProps {
  podcastId: string;
  hostId: string;
  hostAvatar: string;
  likes: number;
  comments: number;
  shares: number;
  onCommentPress: () => void;
}

export default function PodcastActions({
  podcastId,
  hostId,
  hostAvatar,
  likes,
  comments,
  shares,
  onCommentPress,
}: PodcastActionsProps) {
  const { toggleLike, isLiked, toggleSave, isSaved } = usePodcastStore();

  const handleLike = () => {
    toggleLike(podcastId);
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const handleSave = () => {
    toggleSave(podcastId);
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

  const liked = isLiked(podcastId);
  const saved = isSaved(podcastId);

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.avatarContainer}>
        <Image source={{ uri: hostAvatar }} style={styles.avatar} />
        <View style={styles.followIcon}>
          <Text style={styles.followText}>+</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
        <Ionicons
          name={liked ? "heart" : "heart-outline"}
          size={28}
          color={liked ? Colors.dark.primary : Colors.dark.text}
        />
        <Text style={styles.actionText}>{formatNumber(likes)}</Text>
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
          name={saved ? "bookmark" : "bookmark-outline"}
          size={28}
          color={saved ? Colors.dark.highlight : Colors.dark.text}
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
