import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import Colors from '@/constants/Colors';

interface AuthToggleProps {
  isSignUp: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export const AuthToggle = ({ isSignUp, onToggle, disabled = false }: AuthToggleProps) => (
  <TouchableOpacity
    onPress={onToggle}
    disabled={disabled}
    style={styles.toggleButton}
  >
    <Text style={styles.toggleText}>
      {isSignUp
        ? 'すでにアカウントをお持ちですか？ ログイン'
        : 'アカウントをお持ちでない方は アカウント作成'}
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  toggleButton: {
    paddingVertical: 8,
  },
  toggleText: {
    color: Colors.dark.subtext,
    textAlign: 'center',
    fontSize: 14,
  },
});