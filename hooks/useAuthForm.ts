import { useState, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';

export interface AuthFormData {
  email: string;
  password: string;
  confirmPassword: string;
  username: string;
}

export interface AuthFormState {
  formData: AuthFormData;
  errors: Record<string, string>;
  isLoading: boolean;
  usernameCheckLoading: boolean;
  usernameAvailable: boolean | null;
}

export interface UseAuthFormReturn extends AuthFormState {
  updateField: (field: keyof AuthFormData, value: string) => void;
  validate: () => { isValid: boolean; errors: Record<string, string> };
  setIsLoading: (loading: boolean) => void;
  setErrors: (errors: Record<string, string>) => void;
  resetForm: () => void;
  checkUsername: (username: string) => Promise<void>;
}

export const useAuthForm = (isSignUp: boolean): UseAuthFormReturn => {
  const [formData, setFormData] = useState<AuthFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    username: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [usernameCheckLoading, setUsernameCheckLoading] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);

  const { checkUsernameAvailability } = useAuthStore();

  const updateField = useCallback((field: keyof AuthFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // フィールド更新時にエラーをクリア
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  const validate = useCallback((): { isValid: boolean; errors: Record<string, string> } => {
    const validationErrors: Record<string, string> = {};

    // メール検証
    if (!formData.email.trim()) {
      validationErrors.email = 'メールアドレスを入力してください';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        validationErrors.email = '有効なメールアドレスを入力してください';
      }
    }

    // パスワード検証
    if (!formData.password.trim()) {
      validationErrors.password = 'パスワードを入力してください';
    } else if (formData.password.length < 6) {
      validationErrors.password = 'パスワードは6文字以上で入力してください';
    }

    if (isSignUp) {
      // ユーザー名検証
      if (!formData.username.trim()) {
        validationErrors.username = 'ユーザー名を入力してください';
      } else if (formData.username.trim().length < 3) {
        validationErrors.username = 'ユーザー名は3文字以上で入力してください';
      } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username.trim())) {
        validationErrors.username = 'ユーザー名は英数字とアンダースコアのみ使用可能です';
      }

      if (usernameAvailable === false) {
        validationErrors.username = 'このユーザー名は既に使用されています';
      }

      if (usernameAvailable === null && formData.username.trim().length >= 3) {
        validationErrors.username = 'ユーザー名の確認が完了していません。しばらくお待ちください';
      }

      // パスワード確認
      if (formData.password !== formData.confirmPassword) {
        validationErrors.confirmPassword = 'パスワードが一致しません';
      }
    }

    return {
      isValid: Object.keys(validationErrors).length === 0,
      errors: validationErrors
    };
  }, [formData, isSignUp, usernameAvailable]);

  const checkUsername = useCallback(async (usernameToCheck: string) => {
    if (!usernameToCheck.trim() || usernameToCheck.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    setUsernameCheckLoading(true);
    try {
      const available = await checkUsernameAvailability(usernameToCheck);
      setUsernameAvailable(available);
    } catch (error) {
      console.error('Username check error:', error);
      setUsernameAvailable(null);
    } finally {
      setUsernameCheckLoading(false);
    }
  }, [checkUsernameAvailability]);

  const resetForm = useCallback(() => {
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      username: ''
    });
    setErrors({});
    setUsernameAvailable(null);
    setIsLoading(false);
    setUsernameCheckLoading(false);
  }, []);

  return {
    formData,
    errors,
    isLoading,
    usernameCheckLoading,
    usernameAvailable,
    updateField,
    validate,
    setIsLoading,
    setErrors,
    resetForm,
    checkUsername
  };
};