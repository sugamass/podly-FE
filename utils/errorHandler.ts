import { logger } from './logger';

/**
 * ホーム画面専用のエラークラス
 */
export class HomeScreenError extends Error {
  constructor(message: string, public originalError?: any) {
    super(message);
    this.name = 'HomeScreenError';
  }
}

/**
 * ホーム画面のエラーを統一的に処理する関数
 * @param error 発生したエラー
 * @returns ユーザーに表示するエラーメッセージ
 */
export const handleHomeScreenError = (error: any): string => {
  logger.error('Home screen error occurred', error);
  
  if (error instanceof HomeScreenError) {
    return error.message;
  }
  
  if (error?.message?.includes('Network') || error?.message?.includes('fetch')) {
    return 'ネットワークエラーが発生しました。接続を確認してください。';
  }
  
  if (error?.message?.includes('timeout')) {
    return 'リクエストがタイムアウトしました。しばらく待ってから再試行してください。';
  }
  
  if (error?.message?.includes('unauthorized') || error?.message?.includes('401')) {
    return '認証エラーが発生しました。再度ログインしてください。';
  }
  
  if (error?.message?.includes('forbidden') || error?.message?.includes('403')) {
    return 'アクセス権限がありません。';
  }
  
  if (error?.message?.includes('not found') || error?.message?.includes('404')) {
    return '要求されたリソースが見つかりません。';
  }
  
  return '予期しないエラーが発生しました。';
};

/**
 * エラーをキャッチして適切なメッセージを返すヘルパー関数
 * @param operation 実行する非同期処理
 * @param fallbackMessage エラー時のフォールバックメッセージ
 */
export const withErrorHandling = async <T>(
  operation: () => Promise<T>,
  fallbackMessage: string = '操作に失敗しました'
): Promise<T | null> => {
  try {
    return await operation();
  } catch (error) {
    const errorMessage = handleHomeScreenError(error);
    logger.error(fallbackMessage, error);
    throw new HomeScreenError(errorMessage, error);
  }
};