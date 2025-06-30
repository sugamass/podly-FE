import Colors from "@/constants/Colors";
import { usePodcastStore } from "@/store/podcastStore";
import { useTrackPlayerStore } from "@/store/trackPlayerStore";
import { Ionicons } from "@expo/vector-icons";
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
import TrackPlayer, {
  Event,
  State,
  Track,
  usePlaybackState,
  useProgress,
} from "react-native-track-player";

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
  const [localIsPlaying, setLocalIsPlaying] = useState(false);
  const playbackState = usePlaybackState();
  const progress = useProgress();

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

  const { isInitialized, setupPlayer: initializePlayer } =
    useTrackPlayerStore();

  // Initialize TrackPlayer and add track
  useEffect(() => {
    const setupPlayerAndTrack = async () => {
      try {
        // First initialize the player
        await initializePlayer();

        // 🔧 FIX: 古いトラックをクリアしてから新しいトラックを追加
        await TrackPlayer.reset();

        // Then add the track
        const track: Track = {
          id: uri, // Use uri as unique id
          url: uri,
          title: "Audio Track",
          artist: "Unknown Artist",
          artwork: imageUrl,
        };

        await TrackPlayer.add(track);
        setIsLoading(false);
      } catch (error) {
        console.error("Error setting up player and track:", error);
        setIsLoading(false);
      }
    };

    setupPlayerAndTrack();

    // 🔧 FIX: コンポーネントのアンマウント時にクリーンアップ
    return () => {
      TrackPlayer.reset().catch(console.error);
    };
  }, [uri, imageUrl, initializePlayer]);

  // Listen to playback state changes - ONE TIME ONLY
  useEffect(() => {
    const listener = TrackPlayer.addEventListener(
      Event.PlaybackState,
      (data) => {
        const isCurrentlyPlaying = data.state === State.Playing;
        setLocalIsPlaying(isCurrentlyPlaying);
        // Only update global store when necessary
        if (isCurrentlyPlaying !== isPlaying) {
          setIsPlaying(isCurrentlyPlaying);
        }
      }
    );

    return () => {
      listener.remove();
    };
  }, []); // Empty dependency array - set up once only

  // Sync localIsPlaying with actual playback state
  useEffect(() => {
    if (playbackState.state !== undefined) {
      const isCurrentlyPlaying = playbackState.state === State.Playing;
      if (localIsPlaying !== isCurrentlyPlaying) {
        setLocalIsPlaying(isCurrentlyPlaying);
      }
    }
  }, [playbackState.state, localIsPlaying]);

  // Update store with current progress
  useEffect(() => {
    if (progress.position !== undefined) {
      setCurrentTime(progress.position);
    }
    if (progress.duration !== undefined) {
      setDuration(progress.duration);
    }
  }, [progress, setCurrentTime, setDuration]);

  // Handle isActive changes - separate from playback state
  useEffect(() => {
    if (!isInitialized || isLoading) return;

    const handleActiveChange = async () => {
      try {
        const currentState = await TrackPlayer.getPlaybackState();

        if (isActive && currentState.state !== State.Playing) {
          await TrackPlayer.play();
        } else if (!isActive && currentState.state === State.Playing) {
          await TrackPlayer.pause();
        }
      } catch (error) {
        console.error("Error handling active change:", error);
      }
    };

    // Add a small delay to prevent rapid state changes
    const timeout = setTimeout(handleActiveChange, 100);

    return () => clearTimeout(timeout);
  }, [isActive, isInitialized, isLoading]);

  // Update playback rate
  useEffect(() => {
    if (!isInitialized) return;

    TrackPlayer.setRate(playbackRate);
  }, [playbackRate, isInitialized]);

  const handlePlayPause = async () => {
    if (!isInitialized) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      // Get current state directly from TrackPlayer
      const currentState = await TrackPlayer.getPlaybackState();

      if (currentState.state === State.Playing) {
        await TrackPlayer.pause();
      } else {
        await TrackPlayer.play();
      }
    } catch (error) {
      console.error("Error toggling play/pause:", error);
    }
  };

  const handleSeek = async (position: number) => {
    if (!isInitialized || !progress.duration) return;

    const seekTime = (position / 100) * progress.duration;
    await TrackPlayer.seekTo(seekTime);
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

  const progressPercentage =
    progress.duration && progress.duration > 0
      ? (progress.position / progress.duration) * 100
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
      {/* Background Image */}
      <Image
        source={{ uri: imageUrl }}
        style={styles.backgroundImage}
        contentFit="cover"
      />

      {/* Dark Overlay for better contrast */}
      <View style={styles.overlay} />

      {/* Controls Overlay */}
      <View style={styles.controlsOverlay}>
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <Text style={styles.timeText}>
            {formatTime(progress.position || 0)}
          </Text>
          <View style={styles.progressBarContainer}>
            <TouchableOpacity
              style={styles.progressBar}
              onPress={(event) => {
                const { locationX } = event.nativeEvent;
                const progressBarWidth = width * 0.7;
                const newProgress = (locationX / progressBarWidth) * 100;
                handleSeek(Math.max(0, Math.min(100, newProgress)));
              }}
            >
              <View
                style={[
                  styles.progressFill,
                  { width: `${progressPercentage}%` },
                ]}
              />
              <View
                style={[
                  styles.progressThumb,
                  {
                    left: `${Math.max(0, Math.min(100, progressPercentage))}%`,
                  },
                ]}
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.timeText}>
            {formatTime(progress.duration || 0)}
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
              name={playbackState.state === State.Playing ? "pause" : "play"}
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
  controlsOverlay: {
    position: "absolute",
    bottom: 400,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
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
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 15,
  },
  timeText: {
    color: "white",
    fontSize: 14,
    minWidth: 45,
    textAlign: "center",
    fontWeight: "600",
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
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 15,
  },
  speedButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    minWidth: 60,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  speedText: {
    color: "white",
    fontSize: 15,
    fontWeight: "700",
  },
  playButton: {
    backgroundColor: Colors.dark.primary,
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  spacer: {
    width: 60,
  },
});
