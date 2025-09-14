import TrackPlayer, { Event } from "react-native-track-player";
import { DeviceEventEmitter } from "react-native";

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
      // トラック変更時の追加処理（自動進行用）
      if (event.track === null) {
        console.log('Track ended, no next track available');
      }
    }),
    TrackPlayer.addEventListener(Event.PlaybackQueueEnded, async (event) => {
      // キューの終了時（再生完了）にカスタムイベントを発火
      console.log('Playback queue ended:', event);
      DeviceEventEmitter.emit('trackPlaybackEnded');
    })
  );
};

// 🔧 FIX: サービス終了時のクリーンアップ関数
export const cleanupTrackPlayerService = () => {
  eventListeners.forEach((listener) => listener?.remove?.());
  eventListeners.length = 0;
};

export default TrackPlayerService;
