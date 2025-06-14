import Colors from "@/constants/Colors";
import { VideoView, useVideoPlayer } from "expo-video";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Platform,
  StyleSheet,
  View,
} from "react-native";

interface VideoPlayerProps {
  uri: string;
  isActive: boolean;
}

const { width, height } = Dimensions.get("window");

export default function VideoPlayer({ uri, isActive }: VideoPlayerProps) {
  const [isLoading, setIsLoading] = useState(true);

  const player = useVideoPlayer(uri, (player) => {
    player.loop = true;
    player.muted = false;
  });

  useEffect(() => {
    if (isActive) {
      player.play();
    } else {
      player.pause();
    }
  }, [isActive, player]);

  useEffect(() => {
    const subscription = player.addListener("statusChange", (status) => {
      if (status.status === "readyToPlay") {
        setIsLoading(false);
      }
    });

    return () => {
      subscription?.remove();
    };
  }, [player]);

  return (
    <View style={styles.container}>
      <VideoView
        player={player}
        style={styles.video}
        allowsFullscreen={false}
        allowsPictureInPicture={false}
        contentFit="cover"
      />

      {isLoading && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={Colors.dark.primary} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width,
    height: Platform.OS === "web" ? height - 100 : height,
    backgroundColor: Colors.dark.background,
  },
  video: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
});
