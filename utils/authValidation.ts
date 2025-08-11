export const VALIDATION_RULES = {
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: '有効なメールアドレスを入力してください'
  },
  password: {
    minLength: 6,
    message: 'パスワードは6文字以上で入力してください'
  },
  username: {
    minLength: 3,
    pattern: /^[a-zA-Z0-9_]+$/,
    message: 'ユーザー名は英数字とアンダースコアのみ使用可能です'
  }
} as const;

export const AUTH_ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'メールアドレスまたはパスワードが正しくありません',
  USER_ALREADY_REGISTERED: 'このメールアドレスは既に登録されています',
  EMAIL_NOT_CONFIRMED: 'メールアドレスが確認されていません。メールをご確認ください',
  USERNAME_ALREADY_EXISTS: 'このユーザー名は既に使用されています',
  PROFILE_CREATION_FAILED: 'サインアップは成功しましたが、プロフィールの作成でエラーが発生しました。ログイン後にプロフィールを設定してください。',
  ACCOUNT_CREATION_FAILED: 'アカウント作成中にエラーが発生しました。もう一度お試しください。',
  EMAIL_RATE_LIMIT: 'メール送信の制限に達しました。しばらく後にもう一度お試しください。',
  UNKNOWN_ERROR: '不明なエラーが発生しました'
} as const;

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export const getAuthErrorMessage = (error: Error): string => {
  switch (error.message) {
    case 'Invalid login credentials':
      return AUTH_ERROR_MESSAGES.INVALID_CREDENTIALS;
    case 'User already registered':
      return AUTH_ERROR_MESSAGES.USER_ALREADY_REGISTERED;
    case 'Email not confirmed':
      return AUTH_ERROR_MESSAGES.EMAIL_NOT_CONFIRMED;
    case 'このユーザー名は既に使用されています':
      return AUTH_ERROR_MESSAGES.USERNAME_ALREADY_EXISTS;
    case 'プロフィールの作成に失敗しました。もう一度お試しください。':
      return AUTH_ERROR_MESSAGES.PROFILE_CREATION_FAILED;
    default:
      // Supabaseの一般的なエラーの処理
      if (error.message.includes('duplicate key value')) {
        return AUTH_ERROR_MESSAGES.USERNAME_ALREADY_EXISTS;
      } else if (error.message.includes('violates foreign key constraint')) {
        return AUTH_ERROR_MESSAGES.ACCOUNT_CREATION_FAILED;
      } else if (error.message.includes('Email rate limit exceeded')) {
        return AUTH_ERROR_MESSAGES.EMAIL_RATE_LIMIT;
      } else {
        return error.message || AUTH_ERROR_MESSAGES.UNKNOWN_ERROR;
      }
  }
};