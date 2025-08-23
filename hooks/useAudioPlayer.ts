import { useState, useEffect } from "react";
import { Alert } from "react-native";
import { audioPlayerService } from "@/services/AudioPlayerService";

export const useAudioPlayer = () => {
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // AudioPlayerServiceの状態変更を監視
  useEffect(() => {
    const handleStateChange = (playing: boolean) => {
      setIsPlaying(playing);
      if (!playing) {
        setCurrentPlayingId(null);
      }
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
      if (sectionId === "full-podcast") {
        // 全体音声の再生
        if (isPlaying && currentPlayingId === sectionId) {
          // 停止
          await audioPlayerService.pause();
        } else {
          // 再生
          if (fullAudioUrl) {
            const isCurrentTrack = audioPlayerService.isCurrentTrack("full-podcast");

            if (!isCurrentTrack) {
              // 新しいトラックに切り替え
              const success = await audioPlayerService.switchTrack({
                id: "full-podcast",
                url: fullAudioUrl,
                title: "ポッドキャスト全体",
                artist: "Generated Audio",
              });

              if (success) {
                setCurrentPlayingId(sectionId);
              } else {
                Alert.alert("エラー", "音声の再生に失敗しました");
              }
            } else {
              // 既に同じトラック、再生開始
              await audioPlayerService.play();
              setCurrentPlayingId(sectionId);
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
      setCurrentPlayingId(null);
      setIsPlaying(false);

      // エラーの詳細な処理
      let errorMessage = "音声の再生中にエラーが発生しました";
      if (error instanceof Error) {
        if (
          error.message.includes("network") ||
          error.message.includes("fetch")
        ) {
          errorMessage =
            "ネットワークエラーが発生しました。インターネット接続を確認してください";
        } else if (
          error.message.includes("codec") ||
          error.message.includes("format")
        ) {
          errorMessage = "音声ファイルの形式が対応していません";
        }
      }

      Alert.alert("再生エラー", errorMessage);
    }
  };

  const clearPlayback = async () => {
    if (currentPlayingId) {
      await audioPlayerService.stopAndClear();
    }
    setCurrentPlayingId(null);
  };

  return {
    currentPlayingId,
    isPlaying,
    playSection,
    clearPlayback,
  };
};