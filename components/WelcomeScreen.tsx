import { AuthModal } from "@/components/AuthModal";
import Colors from "@/constants/Colors";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface WelcomeScreenProps {
  showAuthModal: boolean;
  onCloseAuthModal: () => void;
}

export const WelcomeScreen = ({ showAuthModal, onCloseAuthModal }: WelcomeScreenProps) => {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.contentContainer}>
        <Text style={styles.title}>Podlyへようこそ</Text>
        <Text style={styles.subtitle}>
          このアプリを使用するには{"\n"}アカウントが必要です
        </Text>
      </View>
      <AuthModal
        visible={showAuthModal}
        forceSignUp={false}
        allowClose={false}
        onClose={onCloseAuthModal}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    color: Colors.dark.text,
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    color: Colors.dark.subtext,
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
  },
});