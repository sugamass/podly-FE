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
  onTogglePlayPause?: () => void;
}

const { width, height } = Dimensions.get("window");

export default function AudioPlayer({
  uri,
  imageUrl,
  isActive,
  onTogglePlayPause,
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

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.dark.primary} />
        <Text style={styles.loadingText}>Loading audio...</Text>
      </View>
    );
  }

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
      {playbackState.state === State.Paused && (
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
