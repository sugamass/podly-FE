import TrackPlayer from "react-native-track-player";
import TrackPlayerService from "./services/TrackPlayerService";

// Register TrackPlayer service
TrackPlayer.registerPlaybackService(() => TrackPlayerService);

// Import and register the Expo router entry
import "expo-router/entry";
