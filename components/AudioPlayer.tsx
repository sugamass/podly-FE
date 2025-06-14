import Colors from "@/constants/Colors";
import { usePodcastStore } from "@/store/podcastStore";
import { Ionicons } from "@expo/vector-icons";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface AudioPlayerProps {
  uri: string;
  imageUrl: string;
  isActive: boolean;
}

const { width, height } = Dimensions.get("window");

export default function AudioPlayer({
  uri,
  imageUrl,
  isActive,
}: AudioPlayerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const {
    isPlaying,
    setIsPlaying,
    currentTime,
    setCurrentTime,
    duration,
    setDuration,
    playbackRate,
    setPlaybackRate,
  } = usePodcastStore();

  // Create audio player
  const player = useAudioPlayer({ uri });
  const status = useAudioPlayerStatus(player);

  // Handle player status updates
  useEffect(() => {
    if (status.isLoaded) {
      setIsLoading(false);
      setDuration(status.duration);
      setCurrentTime(status.currentTime);
      setIsPlaying(status.playing);
    }
  }, [status, setDuration, setCurrentTime, setIsPlaying]);

  // Handle play/pause based on isActive prop
  useEffect(() => {
    if (!isLoading && status.isLoaded) {
      if (isActive && !status.playing) {
        player.play();
      } else if (!isActive && status.playing) {
        player.pause();
      }
    }
  }, [isActive, isLoading, status.isLoaded, status.playing, player]);

  // Handle play/pause from store
  useEffect(() => {
    if (!isLoading && status.isLoaded) {
      if (isPlaying && !status.playing) {
        player.play();
      } else if (!isPlaying && status.playing) {
        player.pause();
      }
    }
  }, [isPlaying, isLoading, status.isLoaded, status.playing, player]);

  // Update playback rate
  useEffect(() => {
    if (!isLoading && status.isLoaded && player.playbackRate !== playbackRate) {
      player.setPlaybackRate(playbackRate);
    }
  }, [playbackRate, isLoading, status.isLoaded, player]);

  const handlePlayPause = () => {
    if (isLoading || !status.isLoaded) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (status.playing) {
      player.pause();
      setIsPlaying(false);
    } else {
      player.play();
      setIsPlaying(true);
    }
  };

  const handleSeek = (position: number) => {
    if (isLoading || !status.isLoaded) return;

    const seekTime = (position / 100) * status.duration;
    player.seekTo(seekTime);
    setCurrentTime(seekTime);
  };

  const handleSpeedChange = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const speeds = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
    const currentIndex = speeds.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % speeds.length;
    const newSpeed = speeds[nextIndex];

    setPlaybackRate(newSpeed);
  };

  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const getPlaybackRateText = () => {
    return `${playbackRate}x`;
  };

  const progress =
    status.isLoaded && status.duration > 0
      ? (status.currentTime / status.duration) * 100
      : 0;

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.dark.primary} />
        <Text style={styles.loadingText}>Loading audio...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Album Art */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imageUrl }}
          style={styles.albumImage}
          contentFit="cover"
        />
      </View>

      {/* Controls */}
      <View style={styles.controlsContainer}>
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <Text style={styles.timeText}>
            {formatTime(status.currentTime || 0)}
          </Text>
          <View style={styles.progressBarContainer}>
            <TouchableOpacity
              style={styles.progressBar}
              onPress={(event) => {
                const { locationX } = event.nativeEvent;
                const progressBarWidth = width * 0.7; // Approximate width
                const newProgress = (locationX / progressBarWidth) * 100;
                handleSeek(Math.max(0, Math.min(100, newProgress)));
              }}
            >
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
              <View
                style={[
                  styles.progressThumb,
                  { left: `${Math.max(0, Math.min(100, progress))}%` },
                ]}
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.timeText}>
            {formatTime(status.duration || 0)}
          </Text>
        </View>

        {/* Control Buttons */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.speedButton}
            onPress={handleSpeedChange}
          >
            <Text style={styles.speedText}>{getPlaybackRateText()}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.playButton} onPress={handlePlayPause}>
            <Ionicons
              name={status.playing ? "pause" : "play"}
              size={40}
              color="white"
            />
          </TouchableOpacity>

          <View style={styles.spacer} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    paddingHorizontal: 20,
    paddingVertical: 30,
    borderRadius: 20,
    margin: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
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
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
  },
  timeText: {
    color: "white",
    fontSize: 14,
    minWidth: 45,
    textAlign: "center",
  },
  progressBarContainer: {
    flex: 1,
    marginHorizontal: 15,
  },
  progressBar: {
    height: 20,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 10,
    position: "relative",
    justifyContent: "center",
  },
  progressFill: {
    height: 4,
    backgroundColor: Colors.dark.primary,
    borderRadius: 2,
    position: "absolute",
    top: 8,
  },
  progressThumb: {
    position: "absolute",
    top: 2,
    width: 16,
    height: 16,
    backgroundColor: Colors.dark.primary,
    borderRadius: 8,
    marginLeft: -8,
  },
  buttonsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  speedButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 50,
    alignItems: "center",
  },
  speedText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  playButton: {
    backgroundColor: Colors.dark.primary,
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
  },
  spacer: {
    width: 50,
  },
});
