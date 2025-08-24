import { useState, useEffect } from "react";
import { Alert } from "react-native";
import { AudioPlayerService } from "@/services/AudioPlayerService";

export const useAudioPlayer = () => {
  const audioPlayerService = new AudioPlayerService();
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // AudioPlayerServiceの状態変更を監視
  useEffect(() => {
    const handleStateChange = (playing: boolean) => {
      setIsPlaying(playing);
      // 再生状態のみ更新し、currentPlayingIdは明示的な停止時のみリセット
    };

    audioPlayerService.setStateUpdateCallback(handleStateChange);

    return () => {
      audioPlayerService.setStateUpdateCallback(() => {});
    };
  }, []);

  // コンポーネントアンマウント時のクリーンアップ
  useEffect(() => {
    return () => {
      if (currentPlayingId && isPlaying) {
        audioPlayerService.stopAndClear().catch(console.error);
      }
    };
  }, [currentPlayingId, isPlaying]);

  const playSection = async (sectionId: string, fullAudioUrl: string | null) => {
    try {
      console.log(
        `Audio playback attempt: ${sectionId} - URL: ${fullAudioUrl}`
      );

      if (sectionId === "full-podcast") {
        // 全体音声の再生
        if (isPlaying && currentPlayingId === sectionId) {
          console.log("Pausing current audio");
          await audioPlayerService.pause();
          setIsPlaying(false);
        } else {
          // 再生
          if (fullAudioUrl) {
            const isCurrentTrack = audioPlayerService.isCurrentTrack("full-podcast");
            console.log(`Is current track: ${isCurrentTrack}`);

            if (!isCurrentTrack) {
              console.log("Switching to new audio track");

              // 楽観的UI更新：即座に状態を更新
              setCurrentPlayingId(sectionId);
              setIsPlaying(true);

              const success = await audioPlayerService.switchTrack({
                id: "full-podcast",
                url: fullAudioUrl,
                title: "ポッドキャスト全体",
                artist: "Generated Audio",
              });

              if (!success) {
                console.log("Audio track switch failed");
                // 失敗時は状態をロールバック
                setCurrentPlayingId(null);
                setIsPlaying(false);
                Alert.alert("エラー", "音声の再生に失敗しました");
                return;
              }

              console.log("Audio track switch successful");
            } else {
              console.log("Playing existing audio track");

              // 楽観的UI更新：即座に状態を更新
              setCurrentPlayingId(sectionId);
              setIsPlaying(true);

              await audioPlayerService.play();
            }
          } else {
            Alert.alert("エラー", "再生可能な音声がありません");
          }
        }
      } else {
        // セクション別音声再生（既存のロジック）
        if (currentPlayingId === sectionId) {
          setCurrentPlayingId(null);
          // TODO: 再生停止
        } else {
          setCurrentPlayingId(sectionId);
          // TODO: 該当セクションの音声再生
          console.log(`Playing section: ${sectionId}`);
        }
      }
    } catch (error) {
      console.error("Audio playback error:", error);
      // エラー時は状態をリセット
      setCurrentPlayingId(null);
      setIsPlaying(false);

      // エラーの詳細な処理
      let errorMessage = "音声の再生中にエラーが発生しました";
      if (error instanceof Error) {
        console.error("Error details:", error.message);
        if (
          error.message.includes("network") ||
          error.message.includes("fetch") ||
          error.message.includes("Network")
        ) {
          errorMessage =
            "ネットワークエラーが発生しました。インターネット接続を確認してください";
        } else if (
          error.message.includes("codec") ||
          error.message.includes("format") ||
          error.message.includes("unsupported")
        ) {
          errorMessage = "音声ファイルの形式が対応していません";
        } else if (
          error.message.includes("url") ||
          error.message.includes("URL")
        ) {
          errorMessage = "音声ファイルのURLが無効です";
        }
      }

      Alert.alert("再生エラー", errorMessage);
    }
  };

  const stopAudio = async () => {
    if (currentPlayingId) {
      await audioPlayerService.stopAndClear();
    }
    setCurrentPlayingId(null);
    setIsPlaying(false);
  };

  const clearPlayback = async () => {
    if (currentPlayingId) {
      await audioPlayerService.stopAndClear();
    }
    setCurrentPlayingId(null);
    setIsPlaying(false);
  };

  return {
    currentPlayingId,
    isPlaying,
    playSection,
    stopAudio,
    clearPlayback,
  };
};