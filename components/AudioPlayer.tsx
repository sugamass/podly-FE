import Colors from "@/constants/Colors";
import { usePodcastStore } from "@/store/podcastStore";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import React, { useState } from "react";
import {
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
  Text,
} from "react-native";

interface AudioPlayerProps {
  podcastId: string;
  imageUrl: string | null;
  isActive: boolean;
  style?: ViewStyle;
}

const { width } = Dimensions.get("window");

// デフォルト画像URL
const DEFAULT_IMAGE_URL = "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80";

export default function AudioPlayer({
  podcastId,
  imageUrl,
  isActive,
  style,
}: AudioPlayerProps) {
  const { isPlaying, togglePlayPause, currentPlayingPodcastId } = usePodcastStore();
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handlePlayPause = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    togglePlayPause();
  };

  const isCurrentPodcast = currentPlayingPodcastId === podcastId;
  const showPauseIcon = isCurrentPodcast && !isPlaying;
  
  // 画像URLが存在しない場合はデフォルト画像を使用
  const displayImageUrl = imageUrl || DEFAULT_IMAGE_URL;

  // デバッグ情報をログ出力
  React.useEffect(() => {
    console.log('AudioPlayer Debug:', {
      podcastId,
      originalImageUrl: imageUrl,
      displayImageUrl,
      isActive,
      imageError,
      imageLoaded
    });
  }, [podcastId, imageUrl, displayImageUrl, isActive, imageError, imageLoaded]);

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      activeOpacity={1}
      onPress={handlePlayPause}
    >
      {/* Background Image */}
      <Image
        source={{ uri: displayImageUrl }}
        style={styles.backgroundImage}
        contentFit="cover"
        placeholder="https://via.placeholder.com/400x400/1a1a2e/ffffff?text=Loading"
        onLoad={() => setImageLoaded(true)}
        onError={(error) => {
          console.error('Image load error:', error);
          setImageError(true);
        }}
      />

      {/* Dark Overlay for better contrast */}
      <View style={styles.overlay} />

      {/* デバッグ情報表示（開発時のみ） */}
      {!imageLoaded && !imageError && (
        <View style={styles.debugContainer}>
          <Text style={styles.debugText}>画像読み込み中...</Text>
          <Text style={styles.debugText}>URL: {displayImageUrl}</Text>
        </View>
      )}

      {imageError && (
        <View style={styles.debugContainer}>
          <Text style={styles.debugText}>画像読み込みエラー</Text>
          <Text style={styles.debugText}>URL: {displayImageUrl}</Text>
        </View>
      )}

      {/* Pause Icon - Show when paused */}
      {showPauseIcon && (
        <View style={styles.pauseIconContainer}>
          <Ionicons
            name="pause"
            size={80}
            color="white"
            style={styles.pauseIcon}
          />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: width,
    flex: 1,
    position: "relative",
  },
  backgroundImage: {
    position: "absolute",
    top: 0,
    left: 0,
    width: width,
    height: "100%",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: width,
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    backgroundColor: Colors.dark.background,
  },
  loadingText: {
    color: "white",
    marginTop: 10,
    fontSize: 16,
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  albumImage: {
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: 20,
  },
  controlsContainer: {
    width: "100%",
  },
  pauseIconContainer: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: 100,
    height: 100,
    marginTop: -50,
    marginLeft: -50,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 50,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  pauseIcon: {
    opacity: 0.9,
  },
  debugContainer: {
    position: "absolute",
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: "rgba(255, 0, 0, 0.8)",
    padding: 10,
    borderRadius: 8,
    zIndex: 10,
  },
  debugText: {
    color: "white",
    fontSize: 12,
    marginBottom: 5,
  },
});
