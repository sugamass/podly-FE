import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';

interface AuthHeaderProps {
  isSignUp: boolean;
  onClose: () => void;
  allowClose?: boolean;
}

export const AuthHeader = ({ isSignUp, onClose, allowClose = true }: AuthHeaderProps) => (
  <View style={styles.headerContainer}>
    {allowClose && (
      <TouchableOpacity onPress={onClose} style={styles.closeButton}>
        <Ionicons name="close" size={24} color={Colors.dark.text} />
      </TouchableOpacity>
    )}
    
    <Text style={styles.title}>
      {isSignUp ? 'Podlyへようこそ' : 'おかえりなさい'}
    </Text>
    
    <Text style={styles.subtitle}>
      {isSignUp
        ? '新しいアカウントを作成してください'
        : 'アカウントにログインしてください'}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  headerContainer: {
    width: '100%',
    marginBottom: 32,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 8,
    marginBottom: 16,
  },
  title: {
    color: Colors.dark.text,
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    color: Colors.dark.subtext,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});