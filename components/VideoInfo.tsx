import Colors from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface VideoInfoProps {
  username: string;
  description: string;
  music: string;
}

export default function VideoInfo({ username, description, music }: VideoInfoProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.username}>@{username}</Text>
      <Text style={styles.description}>{description}</Text>
      <View style={styles.musicContainer}>
        <Ionicons name="musical-notes" size={16} color={Colors.dark.text} />
        <Text style={styles.musicText}>{music}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    left: 10,
    maxWidth: '70%',
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 8,
  },
  username: {
    color: Colors.dark.text,
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
  },
  description: {
    color: Colors.dark.text,
    marginBottom: 8,
  },
  musicContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  musicText: {
    color: Colors.dark.text,
    marginLeft: 5,
  },
});