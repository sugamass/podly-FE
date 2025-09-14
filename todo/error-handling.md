## エラーハンドリング方針（簡潔版）

### 目的

- **一貫性**: I/O 由来の失敗を単一の型と文言に正規化
- **責務分離**: I/O は `services/`、状態は `store/`、表示は UI に集約
- **運用容易性**: ログは `utils/logger.ts` に一本化し、本番で外部送信に切替可能

### 原則

- 例外/失敗はすべて `AppError` 型に正規化
- 直接の `console.*` は禁止。`logger.debug/info/warn/error` を使用（絵文字禁止）
- ユーザー表示用文言は共通関数で整形（日本語メッセージ統一）

### 層ごとの責務

- **services/**: I/O 実行。エラーは `toAppError` で正規化して投げる
- **store/**: 例外を受け取り、`uiErrorMessage`/`lastError`/`canRetry` などに反映
- **UI**: `ErrorDisplay` 等でメッセージ表示し、`onRetry` を提供

### 型（要点）

```ts
// types/error.ts（例）
export type ErrorCode =
  | "network"
  | "timeout"
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "conflict"
  | "rate_limit"
  | "validation"
  | "unknown";

export interface AppError extends Error {
  code: ErrorCode;
  retryable: boolean;
  cause?: unknown;
  context?: string;
}
```

### 共通ヘルパー（要点）

```ts
// utils/errorHandler.ts（例）
export const toAppError = (e: unknown, context?: string) => AppError;
export const formatErrorMessage = (err: AppError) => string; // 日本語文言
export const withErrorHandling = async <T>(
  op: () => Promise<T>,
  context?: string
) => T;
```

### 実装指針

- **services**: `withErrorHandling(async () => { ...; if (error) throw toAppError(error, 'fetchX'); return data; }, 'fetchX')`
- **store**: `try { ... } catch (e) { set({ uiErrorMessage: formatErrorMessage(e as AppError), lastError: e as AppError }) }`
- **UI**: `uiErrorMessage` があれば `ErrorDisplay` を表示し、`retry` を渡す

### ログ方針

- 開発: `logger.*` が `console.*` に委譲
- 本番: `logger.error` 内で Sentry 等への送信に切替可能（PII に配慮）

### 認証・外部 API

- 認証系は `unauthorized`/`validation` に正規化し、必要に応じて `AuthModal` をトリガー
- 外部 API（原稿/音声生成）は 429/5xx を `rate_limit`/`timeout`/`unknown` にマッピング

### 導入手順（最小）

1. `types/error.ts` を追加
2. `utils/errorHandler.ts` に `toAppError/formatErrorMessage/withErrorHandling` を実装
3. `services/*` を `withErrorHandling` + `toAppError` に統一
4. `store/*` で `formatErrorMessage` を使って UI 文言化
5. 直書きの `console.*` を `logger.*` に置換

### ルール適合

- I/O は必ず `services/` 経由、ストアは状態反映のみ
- ログ/エラーメッセージは絵文字禁止
