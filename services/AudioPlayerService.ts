import TrackPlayer, {
  Capability,
  Event,
  RepeatMode,
  State,
  Track,
} from "react-native-track-player";
import { TrackPlayerService } from "./TrackPlayerService";
import { logger } from '../utils/logger';

export interface PodcastTrack {
  id: string;
  url: string;
  title: string;
  artist: string;
  artwork?: string;
  duration?: number;
}

class AudioPlayerService {
  private currentTrackId: string | null = null;
  private isInitialized: boolean = false;
  private isSwitching: boolean = false;
  private stateUpdateCallback: ((isPlaying: boolean) => void) | null = null;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // 既に初期化されているかチェック
      const activeTrackIndex = await TrackPlayer.getActiveTrackIndex().catch(
        () => null
      );

      if (activeTrackIndex === null) {
        // まだ初期化されていない場合のみセットアップ
        await TrackPlayer.setupPlayer({
          autoHandleInterruptions: true,
          autoUpdateMetadata: true,
          waitForBuffer: true,
        });

        // updateOptionsを設定（progressUpdateEventIntervalは不要）
        await TrackPlayer.updateOptions({
          capabilities: [
            Capability.Play,
            Capability.Pause,
            Capability.SkipToNext,
            Capability.SkipToPrevious,
            Capability.SeekTo,
          ],
          compactCapabilities: [
            Capability.Play,
            Capability.Pause,
            Capability.SeekTo,
          ],
        });
      }

      // TrackPlayerServiceを初期化してイベントリスナーを設定
      await TrackPlayerService();

      // 再生状態変更のイベントリスナーを追加
      this.setupStateListeners();

      await TrackPlayer.setRepeatMode(RepeatMode.Off);
      this.isInitialized = true;
    } catch (error) {
      logger.error("TrackPlayer setup failed", error, 'AudioPlayerService.initialize');
    }
  }

  async switchTrack(podcastTrack: PodcastTrack): Promise<boolean> {
    if (this.isSwitching) return false;
    this.isSwitching = true;

    try {
      await this.initialize();

      if (this.currentTrackId === podcastTrack.id) {
        this.isSwitching = false;
        return true;
      }

      await this.stopAndClear();

      const track: Track = {
        id: podcastTrack.id,
        url: podcastTrack.url,
        title: podcastTrack.title,
        artist: podcastTrack.artist,
        artwork: podcastTrack.artwork,
        duration: podcastTrack.duration,
      };

      await TrackPlayer.add(track);

      // スムーズな切り替えのため、少し待機してから再生
      await new Promise((resolve) => setTimeout(resolve, 50));
      await TrackPlayer.play();

      this.currentTrackId = podcastTrack.id;
      this.isSwitching = false;
      return true;
    } catch (error) {
      logger.error("Track switch failed", error, 'AudioPlayerService.switchTrack');
      this.isSwitching = false;
      return false;
    }
  }

  async stopAndClear(): Promise<void> {
    try {
      const state = await TrackPlayer.getPlaybackState();
      if (state.state !== State.None) {
        await TrackPlayer.stop();
      }
      await TrackPlayer.reset();
      this.currentTrackId = null;
    } catch (error) {
      logger.error("Stop and clear failed", error, 'AudioPlayerService.stop');
    }
  }

  async play(): Promise<void> {
    try {
      await TrackPlayer.play();
    } catch (error) {
      logger.error("Play failed", error, 'AudioPlayerService.play');
    }
  }

  async pause(): Promise<void> {
    try {
      await TrackPlayer.pause();
    } catch (error) {
      logger.error("Pause failed", error, 'AudioPlayerService.pause');
    }
  }

  async seekTo(position: number): Promise<void> {
    try {
      await TrackPlayer.seekTo(position);
    } catch (error) {
      logger.error("Seek failed", error, 'AudioPlayerService.seekTo');
    }
  }

  async setPlaybackRate(rate: number): Promise<void> {
    try {
      await TrackPlayer.setRate(rate);
    } catch (error) {
      logger.error("Set playback rate failed", error, 'AudioPlayerService.setPlaybackRate');
    }
  }

  getCurrentTrackId(): string | null {
    return this.currentTrackId;
  }

  isCurrentTrack(trackId: string): boolean {
    return this.currentTrackId === trackId;
  }

  setupStateListeners(): void {
    // 再生状態の変更を監視
    TrackPlayer.addEventListener(Event.PlaybackState, (data) => {
      // State.Playing は "playing" という文字列
      const isPlaying = data.state === State.Playing;
      if (this.stateUpdateCallback) {
        this.stateUpdateCallback(isPlaying);
      }
    });
  }

  setStateUpdateCallback(callback: (isPlaying: boolean) => void): void {
    this.stateUpdateCallback = callback;
  }

  async getPlaybackState(): Promise<boolean> {
    try {
      const state = await TrackPlayer.getPlaybackState();
      return state.state === State.Playing;
    } catch (error) {
      logger.error("Get playback state failed", error, 'AudioPlayerService.isPlaying');
      return false;
    }
  }

  async cleanup(): Promise<void> {
    try {
      await this.stopAndClear();
      this.stateUpdateCallback = null;
      this.isInitialized = false;
    } catch (error) {
      logger.error("Cleanup failed", error, 'AudioPlayerService.cleanup');
    }
  }
}

export { AudioPlayerService };
