import { logger } from './logger';
import { AppError, ErrorCode } from '../types/error';

/**
 * 任意のエラーをAppErrorに正規化する関数
 * @param error 発生したエラー
 * @param context エラーが発生したコンテキスト
 * @returns 正規化されたAppError
 */
export const toAppError = (error: unknown, context?: string): AppError => {
  // 既にAppErrorの場合はそのまま返す
  if (isAppError(error)) {
    return error;
  }

  let code: ErrorCode = 'unknown';
  let retryable = false;
  let message = '予期しないエラーが発生しました';

  if (error instanceof Error) {
    const errorMessage = error.message.toLowerCase();
    
    // ネットワーク関連
    if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      code = 'network';
      retryable = true;
      message = 'ネットワークエラーが発生しました。接続を確認してください。';
    }
    // タイムアウト
    else if (errorMessage.includes('timeout')) {
      code = 'timeout';
      retryable = true;
      message = 'リクエストがタイムアウトしました。しばらく待ってから再試行してください。';
    }
    // 認証エラー
    else if (errorMessage.includes('unauthorized') || errorMessage.includes('401')) {
      code = 'unauthorized';
      retryable = false;
      message = '認証エラーが発生しました。再度ログインしてください。';
    }
    // 権限エラー
    else if (errorMessage.includes('forbidden') || errorMessage.includes('403')) {
      code = 'forbidden';
      retryable = false;
      message = 'アクセス権限がありません。';
    }
    // リソースが見つからない
    else if (errorMessage.includes('not found') || errorMessage.includes('404')) {
      code = 'not_found';
      retryable = false;
      message = '要求されたリソースが見つかりません。';
    }
    // データ競合
    else if (errorMessage.includes('conflict') || errorMessage.includes('409')) {
      code = 'conflict';
      retryable = true;
      message = 'データの競合が発生しました。もう一度お試しください。';
    }
    // レート制限
    else if (errorMessage.includes('rate limit') || errorMessage.includes('429')) {
      code = 'rate_limit';
      retryable = true;
      message = 'リクエストが制限されています。しばらく待ってから再試行してください。';
    }
    // バリデーションエラー
    else if (errorMessage.includes('validation') || errorMessage.includes('invalid')) {
      code = 'validation';
      retryable = false;
      message = '入力内容に問題があります。確認してください。';
    }
    // その他のエラーメッセージがある場合はそれを使用
    else if (error.message) {
      message = error.message;
    }
  }

  // HTTPレスポンスエラーの処理
  if (typeof error === 'object' && error !== null && 'status' in error) {
    const status = (error as any).status;
    switch (status) {
      case 401:
        code = 'unauthorized';
        retryable = false;
        message = '認証エラーが発生しました。再度ログインしてください。';
        break;
      case 403:
        code = 'forbidden';
        retryable = false;
        message = 'アクセス権限がありません。';
        break;
      case 404:
        code = 'not_found';
        retryable = false;
        message = '要求されたリソースが見つかりません。';
        break;
      case 409:
        code = 'conflict';
        retryable = true;
        message = 'データの競合が発生しました。もう一度お試しください。';
        break;
      case 429:
        code = 'rate_limit';
        retryable = true;
        message = 'リクエストが制限されています。しばらく待ってから再試行してください。';
        break;
      case 500:
      case 502:
      case 503:
      case 504:
        code = 'network';
        retryable = true;
        message = 'サーバーエラーが発生しました。しばらく待ってから再試行してください。';
        break;
    }
  }

  const appError: AppError = {
    name: 'AppError',
    message,
    code,
    retryable,
    cause: error,
    context,
  };

  return appError;
};

/**
 * AppErrorかどうかを判定する型ガード
 */
export const isAppError = (error: unknown): error is AppError => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'retryable' in error &&
    typeof (error as any).code === 'string' &&
    typeof (error as any).retryable === 'boolean'
  );
};

/**
 * AppErrorをユーザー向けメッセージに変換する関数
 * @param error AppError
 * @returns 日本語のユーザー向けメッセージ
 */
export const formatErrorMessage = (error: AppError): string => {
  return error.message;
};

/**
 * 非同期処理をエラーハンドリングでラップするヘルパー関数
 * @param operation 実行する非同期処理
 * @param context エラーが発生したコンテキスト
 * @returns 処理結果
 */
export const withErrorHandling = async <T>(
  operation: () => Promise<T>,
  context?: string
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    const appError = toAppError(error, context);
    logger.error(`Error in ${context || 'operation'}`, appError);
    throw appError;
  }
};

/**
 * エラーハンドリング用のRetry機能付きヘルパー関数
 * @param operation 実行する非同期処理
 * @param context エラーが発生したコンテキスト
 * @param maxRetries 最大リトライ回数
 * @param retryDelay リトライ間隔（ミリ秒）
 * @returns 処理結果
 */
export const withRetryHandling = async <T>(
  operation: () => Promise<T>,
  context?: string,
  maxRetries: number = 3,
  retryDelay: number = 1000
): Promise<T> => {
  let lastError: AppError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = toAppError(error, context);
      
      // リトライ不可能なエラーまたは最後の試行の場合は即座に投げる
      if (!lastError.retryable || attempt === maxRetries) {
        logger.error(`Error in ${context || 'operation'} (attempt ${attempt + 1}/${maxRetries + 1})`, lastError);
        throw lastError;
      }
      
      // リトライ可能なエラーの場合は待機してから次の試行
      logger.warn(`Retryable error in ${context || 'operation'} (attempt ${attempt + 1}/${maxRetries + 1})`, lastError);
      await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
    }
  }
  
  throw lastError!;
};