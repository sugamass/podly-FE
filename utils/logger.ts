/**
 * Development-only logging utility
 * 本番環境でのパフォーマンス向上のためデバッグログを環境分離
 */

export const logger = {
  debug: (message: string, data?: any) => {
    if (__DEV__) {
      console.log(`[DEBUG] ${message}`, data || '');
    }
  },
  
  info: (message: string, data?: any) => {
    if (__DEV__) {
      console.log(`[INFO] ${message}`, data || '');
    }
  },
  
  warn: (message: string, data?: any) => {
    if (__DEV__) {
      console.warn(`[WARN] ${message}`, data || '');
    }
  },
  
  error: (message: string, error?: any) => {
    if (__DEV__) {
      console.error(`[ERROR] ${message}`, error || '');
    } else {
      // 本番環境でも重要なエラーはログに残す（必要に応じて）
      // 外部ログサービスへの送信等
    }
  }
};