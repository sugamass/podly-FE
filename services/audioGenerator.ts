// 音声生成API関連の型定義とサービス関数
// docs/audio.yaml を参照して実装

// スキーマに基づく型定義
export interface ScriptData {
  speaker: string;
  text: string;
  caption: string;
}

export interface AudioPreviewRequest {
  script: ScriptData[];
  tts: string;
  voices: string[];
  speakers: string[];
  scriptId?: string;
}

export interface AudioPreviewResponse {
  audioUrl?: string;
  separatedAudioUrls?: string[];
  scriptId?: string;
}

// APIエラーレスポンス型
export interface ApiError {
  message: string;
  status: number;
}

// 環境変数からAPIベースURLを取得
const getApiBaseUrl = (): string => {
  const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (!baseUrl) {
    throw new Error("EXPO_PUBLIC_API_BASE_URL environment variable is not set");
  }
  return baseUrl;
};

// APIキーを取得（必要に応じて）
const getApiKey = (): string | null => {
  return process.env.EXPO_PUBLIC_API_KEY || null;
};

// 音声生成API関数
export const generateAudioPreview = async (
  requestData: AudioPreviewRequest
): Promise<AudioPreviewResponse> => {
  try {
    const baseUrl = getApiBaseUrl();
    const apiKey = getApiKey();

    // リクエストヘッダーの設定
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (apiKey) {
      headers["Authorization"] = `Bearer ${apiKey}`;
    }

    console.log("Generating audio preview with request:", requestData);

    const response = await fetch(`${baseUrl}/audio/preview`, {
      method: "POST",
      headers,
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Audio generation API error:", {
        status: response.status,
        statusText: response.statusText,
        errorText,
      });

      throw new Error(
        `Audio generation failed: ${response.status} ${response.statusText}`
      );
    }

    const responseData: AudioPreviewResponse = await response.json();

    console.log("Audio generated successfully:", responseData);

    return responseData;
  } catch (error) {
    console.error("Error in generateAudioPreview:", error);

    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error("Unknown error occurred during audio generation");
    }
  }
};
