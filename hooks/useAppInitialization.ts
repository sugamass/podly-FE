import { useEffect, useState } from "react";
import { audioPlayerService } from "@/services/AudioPlayerService";

export const useAppInitialization = () => {
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