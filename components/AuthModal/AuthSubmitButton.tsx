import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import Colors from '@/constants/Colors';

interface AuthSubmitButtonProps {
  isSignUp: boolean;
  isLoading: boolean;
  onPress: () => void;
}

export const AuthSubmitButton = ({ isSignUp, isLoading, onPress }: AuthSubmitButtonProps) => (
  <TouchableOpacity
    style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
    onPress={onPress}
    disabled={isLoading}
  >
    {isLoading ? (
      <ActivityIndicator color={Colors.dark.text} />
    ) : (
      <Text style={styles.submitButtonText}>
        {isSignUp ? 'アカウント作成' : 'ログイン'}
      </Text>
    )}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  submitButton: {
    backgroundColor: Colors.dark.primary,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    marginTop: 8,
  },
  submitButtonDisabled: {
    backgroundColor: Colors.dark.inactive,
  },
  submitButtonText: {
    color: Colors.dark.text,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 18,
  },
});