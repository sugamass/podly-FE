import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Colors from '@/constants/Colors';

interface EmptyDisplayProps {
  onRetry: () => void;
}

export const EmptyDisplay = ({ onRetry }: EmptyDisplayProps) => (
  <View style={styles.emptyContainer}>
    <Text style={styles.emptyText}>ポッドキャストが見つかりません</Text>
    <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
      <Text style={styles.retryText}>手動で再取得</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.dark.background,
  },
  emptyText: {
    color: Colors.dark.subtext,
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: Colors.dark.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: Colors.dark.text,
    fontWeight: 'bold',
  },
});