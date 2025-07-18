import TrackPlayer, { State, Track, RepeatMode } from 'react-native-track-player';

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

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      await TrackPlayer.setupPlayer({
        autoHandleInterruptions: true,
        autoUpdateMetadata: true,
      });
      await TrackPlayer.setRepeatMode(RepeatMode.Off);
      this.isInitialized = true;
    } catch (error) {
      console.log('TrackPlayer setup error:', error);
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
      await TrackPlayer.play();
      
      this.currentTrackId = podcastTrack.id;
      this.isSwitching = false;
      return true;
    } catch (error) {
      console.log('Track switch error:', error);
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
      console.log('Stop and clear error:', error);
    }
  }

  async play(): Promise<void> {
    try {
      await TrackPlayer.play();
    } catch (error) {
      console.log('Play error:', error);
    }
  }

  async pause(): Promise<void> {
    try {
      await TrackPlayer.pause();
    } catch (error) {
      console.log('Pause error:', error);
    }
  }

  async seekTo(position: number): Promise<void> {
    try {
      await TrackPlayer.seekTo(position);
    } catch (error) {
      console.log('Seek error:', error);
    }
  }

  async setPlaybackRate(rate: number): Promise<void> {
    try {
      await TrackPlayer.setRate(rate);
    } catch (error) {
      console.log('Set playback rate error:', error);
    }
  }

  getCurrentTrackId(): string | null {
    return this.currentTrackId;
  }

  isCurrentTrack(trackId: string): boolean {
    return this.currentTrackId === trackId;
  }

  async cleanup(): Promise<void> {
    try {
      await this.stopAndClear();
      this.isInitialized = false;
    } catch (error) {
      console.log('Cleanup error:', error);
    }
  }
}

export const audioPlayerService = new AudioPlayerService();