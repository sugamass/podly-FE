import Colors from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function CreateScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create New Podcast</Text>
      
      <View style={styles.optionsContainer}>
        <TouchableOpacity style={styles.option}>
          <LinearGradient
            colors={[Colors.dark.primary, Colors.dark.secondary]}
            style={styles.iconContainer}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="mic" size={30} color={Colors.dark.text} />
          </LinearGradient>
          <Text style={styles.optionText}>Record</Text>
          <Text style={styles.optionDescription}>Start a new recording</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.option}>
          <LinearGradient
            colors={[Colors.dark.highlight, Colors.dark.primary]}
            style={styles.iconContainer}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="cloud-upload" size={30} color={Colors.dark.text} />
          </LinearGradient>
          <Text style={styles.optionText}>Upload</Text>
          <Text style={styles.optionDescription}>Import existing audio</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.option}>
          <LinearGradient
            colors={[Colors.dark.secondary, Colors.dark.highlight]}
            style={styles.iconContainer}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="headset" size={30} color={Colors.dark.text} />
          </LinearGradient>
          <Text style={styles.optionText}>Studio</Text>
          <Text style={styles.optionDescription}>Professional tools</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>Tips for Great Podcasts</Text>
        <View style={styles.tipItem}>
          <Text style={styles.tipNumber}>1</Text>
          <Text style={styles.tipText}>Find a quiet space with minimal background noise</Text>
        </View>
        <View style={styles.tipItem}>
          <Text style={styles.tipNumber}>2</Text>
          <Text style={styles.tipText}>Prepare an outline of topics to cover</Text>
        </View>
        <View style={styles.tipItem}>
          <Text style={styles.tipNumber}>3</Text>
          <Text style={styles.tipText}>Keep episodes between 10-25 minutes for optimal engagement</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
    padding: 20,
  },
  title: {
    color: Colors.dark.text,
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 30,
    textAlign: 'center',
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 40,
  },
  option: {
    alignItems: 'center',
    width: '30%',
  },
  iconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  optionText: {
    color: Colors.dark.text,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  optionDescription: {
    color: Colors.dark.subtext,
    fontSize: 12,
    textAlign: 'center',
  },
  infoContainer: {
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 20,
  },
  infoTitle: {
    color: Colors.dark.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.dark.primary,
    color: Colors.dark.text,
    textAlign: 'center',
    lineHeight: 24,
    marginRight: 10,
    fontWeight: 'bold',
  },
  tipText: {
    color: Colors.dark.text,
    flex: 1,
  },
});