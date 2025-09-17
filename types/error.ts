/**
 * アプリケーション全体で使用するエラーコード
 */
export type ErrorCode =
  | "network"          // ネットワーク接続エラー
  | "timeout"          // タイムアウトエラー
  | "unauthorized"     // 認証エラー (401)
  | "forbidden"        // 権限エラー (403)
  | "not_found"        // リソースが見つからない (404)
  | "conflict"         // データ競合エラー (409)
  | "rate_limit"       // レート制限エラー (429)
  | "validation"       // バリデーションエラー
  | "unknown";         // 不明なエラー

/**
 * アプリケーション統一エラーインターフェース
 */
export interface AppError extends Error {
  code: ErrorCode;
  retryable: boolean;
  cause?: unknown;
  context?: string;
}

/**
 * エラー状態管理用の型
 */
export interface ErrorState {
  uiErrorMessage: string | null;
  lastError: AppError | null;
  canRetry: boolean;
}