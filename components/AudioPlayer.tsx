import Colors from "@/constants/Colors";
import { usePodcastStore } from "@/store/podcastStore";
import { Ionicons } from "@expo/vector-icons";
import { Audio, AVPlaybackStatus } from "expo-av";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Platform,
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
  const sound = useRef<Audio.Sound | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [duration, setDuration] = useState(0);
  const {
    isPlaying,
    setIsPlaying,
    currentTime,
    setCurrentTime,
    togglePlayPause,
  } = usePodcastStore();

  // Load and unload sound
  useEffect(() => {
    const loadSound = async () => {
      if (isActive) {
        setIsLoading(true);
        try {
          const { sound: newSound } = await Audio.Sound.createAsync(
            { uri },
            { shouldPlay: isPlaying },
            onPlaybackStatusUpdate
          );
          sound.current = newSound;

          // Set position if we have a stored position
          if (currentTime > 0) {
            await sound.current.setPositionAsync(currentTime);
          }
        } catch (error) {
          console.error("Error loading sound", error);
        }
      }
    };

    loadSound();

    return () => {
      if (sound.current) {
        sound.current.unloadAsync();
        sound.current = null;
      }
    };
  }, [uri, isActive]);

  // Handle play/pause
  useEffect(() => {
    const handlePlayPause = async () => {
      if (!sound.current) return;

      try {
        if (isPlaying) {
          await sound.current.playAsync();
        } else {
          await sound.current.pauseAsync();
        }
      } catch (error) {
        console.error("Error controlling playback", error);
      }
    };

    if (isActive) {
      handlePlayPause();
    }
  }, [isPlaying, isActive]);

  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) return;

    setIsLoading(false);
    setDuration(status.durationMillis || 0);
    setCurrentTime(status.positionMillis || 0);

    // If the audio finished playing
    if (status.didJustFinish) {
      setIsPlaying(false);
    }
  };

  const handlePlayPause = () => {
    togglePlayPause();
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleSkipForward = async () => {
    if (!sound.current) return;

    try {
      const status = await sound.current.getStatusAsync();
      if (!status.isLoaded) return;

      const newPosition = Math.min(
        status.positionMillis + 15000,
        status.durationMillis || 0
      );
      await sound.current.setPositionAsync(newPosition);
      setCurrentTime(newPosition);

      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (error) {
      console.error("Error skipping forward", error);
    }
  };

  const handleSkipBackward = async () => {
    if (!sound.current) return;

    try {
      const status = await sound.current.getStatusAsync();
      if (!status.isLoaded) return;

      const newPosition = Math.max(status.positionMillis - 15000, 0);
      await sound.current.setPositionAsync(newPosition);
      setCurrentTime(newPosition);

      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (error) {
      console.error("Error skipping backward", error);
    }
  };

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <View style={styles.container}>
      <Image source={{ uri: imageUrl }} style={styles.image} />

      {isLoading && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={Colors.dark.primary} />
        </View>
      )}

      {!isLoading && (
        <View style={styles.controlsOverlay}>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
            <View style={styles.timeContainer}>
              <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
              <Text style={styles.timeText}>{formatTime(duration)}</Text>
            </View>
          </View>

          <View style={styles.controls}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={handleSkipBackward}
            >
              <Ionicons
                name="play-skip-back"
                size={24}
                color={Colors.dark.text}
              />
              <Text style={styles.skipText}>15s</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.playPauseButton}
              onPress={handlePlayPause}
            >
              {isPlaying ? (
                <Ionicons
                  name="pause"
                  size={30}
                  color={Colors.dark.background}
                />
              ) : (
                <Ionicons
                  name="play"
                  size={30}
                  color={Colors.dark.background}
                />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.controlButton}
              onPress={handleSkipForward}
            >
              <Ionicons
                name="play-skip-forward"
                size={24}
                color={Colors.dark.text}
              />
              <Text style={styles.skipText}>15s</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width,
    height: Platform.OS === "web" ? height - 150 : height - 200,
    backgroundColor: Colors.dark.background,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
    opacity: 0.8,
  },
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  controlsOverlay: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    padding: 20,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressBar: {
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.dark.primary,
  },
  timeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  timeText: {
    color: Colors.dark.text,
    fontSize: 12,
  },
  controls: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  controlButton: {
    alignItems: "center",
    marginHorizontal: 20,
  },
  skipText: {
    color: Colors.dark.text,
    fontSize: 10,
    marginTop: 4,
  },
  playPauseButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.dark.primary,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 20,
  },
});
