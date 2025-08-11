import React, { memo } from 'react';
import {
  View,
  Text,
  TextInput,
  KeyboardTypeOptions,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AuthInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  placeholder?: string;
  showUsernameStatus?: boolean;
  usernameCheckLoading?: boolean;
  usernameAvailable?: boolean | null;
}

export const AuthInput = memo(({
  label,
  value,
  onChangeText,
  error,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  placeholder,
  showUsernameStatus = false,
  usernameCheckLoading = false,
  usernameAvailable = null,
}: AuthInputProps) => {
  const getInputBorderClass = () => {
    if (error) return 'border-red-500';
    if (showUsernameStatus && value.length >= 3) {
      if (usernameAvailable === true) return 'border-green-500';
      if (usernameAvailable === false) return 'border-red-500';
    }
    return 'border-[#374151]';
  };

  return (
    <View className="mb-4">
      <Text className="text-white text-base font-medium mb-2">{label}</Text>
      <View className="relative">
        <TextInput
          className={`bg-[#1E2430] text-white p-4 rounded-xl border text-base ${getInputBorderClass()}`}
          placeholder={placeholder}
          placeholderTextColor="#6B7280"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
        />
        {showUsernameStatus && value.length >= 3 && (
          <View className="absolute right-4 top-4">
            {usernameCheckLoading ? (
              <ActivityIndicator size="small" color="#4F7CFF" />
            ) : usernameAvailable === true ? (
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            ) : usernameAvailable === false ? (
              <Ionicons name="close-circle" size={20} color="#EF4444" />
            ) : null}
          </View>
        )}
      </View>
      {error && <Text className="text-red-500 text-sm mt-1">{error}</Text>}
      {showUsernameStatus && value.length >= 3 && usernameAvailable === true && (
        <Text className="text-green-500 text-sm mt-1">このユーザー名は利用可能です</Text>
      )}
    </View>
  );
});