import Colors from "@/constants/Colors";
import { usePodcastStore } from "@/store/podcastStore";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import React from "react";
import {
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

interface AudioPlayerProps {
  podcastId: string;
  imageUrl: string;
  isActive: boolean;
}

const { width, height } = Dimensions.get("window");

export default function AudioPlayer({
  podcastId,
  imageUrl,
  isActive,
}: AudioPlayerProps) {
  const { isPlaying, togglePlayPause, currentPlayingPodcastId } = usePodcastStore();

  const handlePlayPause = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    togglePlayPause();
  };

  const isCurrentPodcast = currentPlayingPodcastId === podcastId;
  const showPauseIcon = isCurrentPodcast && !isPlaying;

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={1}
      onPress={handlePlayPause}
    >
      {/* Background Image */}
      <Image
        source={{ uri: imageUrl }}
        style={styles.backgroundImage}
        contentFit="cover"
      />

      {/* Dark Overlay for better contrast */}
      <View style={styles.overlay} />

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
    height: height,
    position: "relative",
  },
  backgroundImage: {
    position: "absolute",
    top: 0,
    left: 0,
    width: width,
    height: height,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: width,
    height: height,
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
    top: height / 2 - 50,
    left: width / 2 - 50,
    width: 100,
    height: 100,
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
});
