import { AudioPlayerService } from "@/services/AudioPlayerService";
import { useEffect, useState } from "react";
import { Alert } from "react-native";

export const useBGMPlayer = () => {
  const audioPlayerService = new AudioPlayerService();
  const [currentPlayingBGM, setCurrentPlayingBGM] = useState<string | null>(
    null
  );
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const handleStateChange = (playing: boolean) => {
      console.log("bgm handleStateChange playing", playing);
      setIsPlaying(playing);
      // 一時停止時はcurrentPlayingBGMを保持（stopBGM関数でのみnullに設定）
    };

    audioPlayerService.setStateUpdateCallback(handleStateChange);

    return () => {
      audioPlayerService.setStateUpdateCallback(() => {});
    };
  }, []);

  useEffect(() => {
    return () => {
      if (currentPlayingBGM && isPlaying) {
        audioPlayerService.stopAndClear().catch(console.error);
      }
    };
  }, [currentPlayingBGM, isPlaying]);

  const playBGM = async (bgmId: string, bgmUrl: string, bgmName: string) => {
    try {
      console.log(
        `BGM playback attempt: ${bgmName} (${bgmId}) - URL: ${bgmUrl}`
      );

      if (isPlaying && currentPlayingBGM === bgmId) {
        console.log("Pausing current BGM");
        await audioPlayerService.pause();
        setIsPlaying(false);
      } else {
        const isCurrentTrack = audioPlayerService.isCurrentTrack(bgmId);
        console.log(`Is current track: ${isCurrentTrack}`);

        if (!isCurrentTrack) {
          console.log("Switching to new BGM track");

          // 楽観的UI更新：即座に状態を更新
          setCurrentPlayingBGM(bgmId);
          setIsPlaying(true);

          const success = await audioPlayerService.switchTrack({
            id: bgmId,
            url: bgmUrl,
            title: bgmName,
            artist: "BGM",
          });

          if (!success) {
            console.log("BGM track switch failed");
            // 失敗時は状態をロールバック
            setCurrentPlayingBGM(null);
            setIsPlaying(false);
            Alert.alert("エラー", "BGMの再生に失敗しました");
            return;
          }

          console.log("BGM track switch successful");
        } else {
          console.log("Playing existing BGM track");

          // 楽観的UI更新：即座に状態を更新
          setCurrentPlayingBGM(bgmId);
          setIsPlaying(true);

          await audioPlayerService.play();
        }
      }
    } catch (error) {
      console.error("BGM playback error:", error);
      // エラー時は状態をリセット
      setCurrentPlayingBGM(null);
      setIsPlaying(false);

      let errorMessage = "BGMの再生中にエラーが発生しました";
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

  const stopBGM = async () => {
    if (currentPlayingBGM) {
      await audioPlayerService.stopAndClear();
    }
    setCurrentPlayingBGM(null);
  };

  return {
    currentPlayingBGM,
    isPlaying,
    playBGM,
    stopBGM,
  };
};
