// 原稿作成API関連の型定義とサービス関数
// docs/script.yaml を参照して実装

// スキーマに基づく型定義
export interface ScriptData {
  speaker?: string;
  text?: string;
  caption?: string;
}

export interface PromptScriptData {
  prompt: string;
  script?: ScriptData[];
  reference?: string[];
  situation?: string;
}

export type SituationType =
  | "school"
  | "expert"
  | "interview"
  | "friends"
  | "radio_personality";

export interface PostCreateScriptRequest {
  prompt: string;
  previousScript?: PromptScriptData[];
  reference?: string[];
  isSearch?: boolean;
  wordCount?: number;
  situation?: SituationType;
}

export interface PostCreateScriptResponse {
  newScript: PromptScriptData;
  previousScript?: PromptScriptData[];
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

// 原稿作成API関数
export const createScript = async (
  requestData: PostCreateScriptRequest
): Promise<PostCreateScriptResponse> => {
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

    console.log("Creating script with request:", requestData);

    const response = await fetch(`${baseUrl}/script/create`, {
      method: "POST",
      headers,
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Script creation API error:", {
        status: response.status,
        statusText: response.statusText,
        errorText,
      });

      throw new Error(
        `Script creation failed: ${response.status} ${response.statusText}`
      );
    }

    const responseData: PostCreateScriptResponse = await response.json();

    console.log("Script created successfully:", responseData);

    return responseData;
  } catch (error) {
    console.error("Error in createScript:", error);

    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error("Unknown error occurred during script creation");
    }
  }
};
