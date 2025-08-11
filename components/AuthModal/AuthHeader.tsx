import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AuthHeaderProps {
  isSignUp: boolean;
  onClose: () => void;
  allowClose?: boolean;
}

export const AuthHeader = ({ isSignUp, onClose, allowClose = true }: AuthHeaderProps) => (
  <View className="w-full mb-8">
    {allowClose && (
      <TouchableOpacity onPress={onClose} className="self-end p-2 mb-4">
        <Ionicons name="close" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    )}
    
    <Text className="text-white text-3xl font-bold mb-2 text-center">
      {isSignUp ? 'Podlyへようこそ' : 'おかえりなさい'}
    </Text>
    
    <Text className="text-[#A0A7B5] text-base text-center leading-6">
      {isSignUp
        ? '新しいアカウントを作成してください'
        : 'アカウントにログインしてください'}
    </Text>
  </View>
);