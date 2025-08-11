import React from 'react';
import { TouchableOpacity, Text } from 'react-native';

interface AuthToggleProps {
  isSignUp: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export const AuthToggle = ({ isSignUp, onToggle, disabled = false }: AuthToggleProps) => (
  <TouchableOpacity
    onPress={onToggle}
    disabled={disabled}
    className="py-2"
  >
    <Text className="text-[#A0A7B5] text-center text-sm">
      {isSignUp
        ? 'すでにアカウントをお持ちですか？ ログイン'
        : 'アカウントをお持ちでない方は アカウント作成'}
    </Text>
  </TouchableOpacity>
);