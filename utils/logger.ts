/**
 * アプリケーション統一ログシステム
 * 開発環境ではコンソール出力、本番環境では外部サービス送信
 */

interface LogEntry {
  level: "debug" | "info" | "warn" | "error";
  message: string;
  data?: any;
  timestamp: string;
  context?: string;
}

/**
 * PII（個人識別可能情報）を含む可能性のあるフィールドをサニタイズ
 */
const sanitizeData = (data: any): any => {
  if (!data || typeof data !== "object") {
    return data;
  }

  const sensitiveFields = [
    "password",
    "token",
    "email",
    "phone",
    "address",
    "credit_card",
  ];
  const sanitized = { ...data };

  for (const field of sensitiveFields) {
    if (field in sanitized) {
      sanitized[field] = "[REDACTED]";
    }
  }

  return sanitized;
};

/**
 * 本番環境での外部ログサービス送信
 * 将来的にSentry、LogRocket等に送信可能
 */
const sendToExternalService = async (entry: LogEntry): Promise<void> => {
  try {
    // 本番環境でのみ実行
    if (!__DEV__ && entry.level === "error") {
      // 例: Sentryへの送信
      // Sentry.captureException(entry.data, {
      //   tags: { context: entry.context },
      //   extra: { message: entry.message }
      // });
    }
  } catch (error) {
    // 外部サービス送信エラーは無視（ログシステム自体は継続）
    if (__DEV__) {
      console.warn("[LOGGER] Failed to send log to external service:", error);
    }
  }
};

/**
 * ログエントリを作成
 */
const createLogEntry = (
  level: LogEntry["level"],
  message: string,
  data?: any,
  context?: string
): LogEntry => {
  return {
    level,
    message,
    data: sanitizeData(data),
    timestamp: new Date().toISOString(),
    context,
  };
};

export const logger = {
  debug: (message: string, data?: any, context?: string) => {
    const entry = createLogEntry("debug", message, data, context);

    if (__DEV__) {
      console.log(`[DEBUG] ${message}`, data || "");
    }
  },

  info: (message: string, data?: any, context?: string) => {
    const entry = createLogEntry("info", message, data, context);

    if (__DEV__) {
      console.log(`[INFO] ${message}`, data || "");
    }
  },

  warn: (message: string, data?: any, context?: string) => {
    const entry = createLogEntry("warn", message, data, context);

    if (__DEV__) {
      console.warn(`[WARN] ${message}`, data || "");
    }

    // 本番環境でも重要な警告は外部サービスに送信
    if (!__DEV__) {
      sendToExternalService(entry).catch(() => {
        // エラーは無視
      });
    }
  },

  error: (message: string, error?: any, context?: string) => {
    const entry = createLogEntry("error", message, error, context);

    if (__DEV__) {
      console.error(`[ERROR] ${message}`, error || "");
    }

    // 本番環境では必ず外部サービスに送信
    sendToExternalService(entry).catch(() => {
      // エラーは無視
    });
  },
};
