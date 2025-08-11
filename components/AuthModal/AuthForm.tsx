import React, { useEffect } from 'react';
import { View } from 'react-native';
import { AuthInput } from './AuthInput';
import { UseAuthFormReturn } from '@/hooks/useAuthForm';

interface AuthFormProps {
  isSignUp: boolean;
  formHook: UseAuthFormReturn;
}

export const AuthForm = ({ isSignUp, formHook }: AuthFormProps) => {
  const {
    formData,
    errors,
    usernameCheckLoading,
    usernameAvailable,
    updateField,
    checkUsername
  } = formHook;

  // ユーザー名のデバウンス処理
  useEffect(() => {
    if (!isSignUp) return;

    const timer = setTimeout(() => {
      if (formData.username.trim().length >= 3) {
        checkUsername(formData.username);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.username, isSignUp, checkUsername]);

  return (
    <View className="w-full">
      {isSignUp && (
        <AuthInput
          label="ユーザー名"
          value={formData.username}
          onChangeText={(text) => updateField('username', text)}
          error={errors.username}
          placeholder="ユーザー名を入力（3文字以上、英数字_のみ）"
          showUsernameStatus
          usernameCheckLoading={usernameCheckLoading}
          usernameAvailable={usernameAvailable}
        />
      )}
      
      <AuthInput
        label="メールアドレス"
        value={formData.email}
        onChangeText={(text) => updateField('email', text)}
        error={errors.email}
        keyboardType="email-address"
        placeholder="メールアドレスを入力"
      />
      
      <AuthInput
        label="パスワード"
        value={formData.password}
        onChangeText={(text) => updateField('password', text)}
        error={errors.password}
        secureTextEntry
        placeholder="パスワードを入力（6文字以上）"
      />
      
      {isSignUp && (
        <AuthInput
          label="パスワード確認"
          value={formData.confirmPassword}
          onChangeText={(text) => updateField('confirmPassword', text)}
          error={errors.confirmPassword}
          secureTextEntry
          placeholder="パスワードを再入力"
        />
      )}
    </View>
  );
};