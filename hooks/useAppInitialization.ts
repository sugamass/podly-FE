import { useEffect, useState } from "react";
import { AudioPlayerService } from "@/services/AudioPlayerService";

export const useAppInitialization = () => {
  const audioPlayerService = new AudioPlayerService();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await audioPlayerService.initialize();
        setIsReady(true);
      } catch (error) {
        console.error("Failed to initialize app:", error);
        setIsReady(true); // エラーがあってもアプリを起動させる
      }
    };

    initializeApp();
  }, []);

  return { isReady };
};