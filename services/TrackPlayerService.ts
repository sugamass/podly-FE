import TrackPlayer, { Event } from "react-native-track-player";

// 🔧 FIX: イベントリスナーの参照を保持
const eventListeners: any[] = [];

export const TrackPlayerService = async () => {
  // 古いリスナーをクリーンアップ
  eventListeners.forEach((listener) => listener?.remove?.());
  eventListeners.length = 0;

  eventListeners.push(
    // Remote control events
    TrackPlayer.addEventListener(Event.RemotePlay, () => TrackPlayer.play()),
    TrackPlayer.addEventListener(Event.RemotePause, () => TrackPlayer.pause()),
    TrackPlayer.addEventListener(Event.RemoteStop, () => TrackPlayer.stop()),
    TrackPlayer.addEventListener(Event.RemoteSeek, (event) =>
      TrackPlayer.seekTo(event.position)
    ),
    TrackPlayer.addEventListener(Event.RemoteNext, () =>
      TrackPlayer.skipToNext()
    ),
    TrackPlayer.addEventListener(Event.RemotePrevious, () =>
      TrackPlayer.skipToPrevious()
    ),
    // Playback state events
    TrackPlayer.addEventListener(Event.PlaybackState, (event) => {
      // Handle playback state changes
      console.log('Playback state changed:', event.state);
    }),
    TrackPlayer.addEventListener(Event.PlaybackActiveTrackChanged, (event) => {
      // Handle active track changes
      console.log('Active track changed:', event.index);
    })
  );
};

// 🔧 FIX: サービス終了時のクリーンアップ関数
export const cleanupTrackPlayerService = () => {
  eventListeners.forEach((listener) => listener?.remove?.());
  eventListeners.length = 0;
};

export default TrackPlayerService;
