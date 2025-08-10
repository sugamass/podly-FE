import { AuthModal } from "@/components/AuthModal";
import Colors from "@/constants/Colors";
import { useAuth } from "@/hooks/useAuth";
import { useAuthModal } from "@/hooks/useAuthModal";
import { useAppInitialization } from "@/hooks/useAppInitialization";
import { useAppStateHandler } from "@/hooks/useAppStateHandler";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
  });

  const { initialized, isAuthenticated } = useAuth();
  const { showAuthModal, setShowAuthModal } = useAuthModal();
  const { isReady } = useAppInitialization();
  
  // アプリ状態変更のハンドリング
  useAppStateHandler();

  useEffect(() => {
    if (error) {
      console.error(error);
      throw error;
    }
  }, [error]);

  useEffect(() => {
    if (loaded && initialized) {
      SplashScreen.hideAsync();
    }
  }, [loaded, initialized]);

  if (!loaded || !initialized || !isReady) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: Colors.dark.background,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color={Colors.dark.primary} />
        <Text style={{ color: Colors.dark.text, marginTop: 16 }}>
          アプリを初期化中...
        </Text>
      </View>
    );
  }

  // If user is not authenticated, show auth modal over everything
  if (!isAuthenticated) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.dark.background }}>
        <StatusBar style="light" />
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
          }}
        >
          <Text
            style={{
              color: Colors.dark.text,
              fontSize: 24,
              fontWeight: "bold",
              marginBottom: 10,
              textAlign: "center",
            }}
          >
            Podlyへようこそ
          </Text>
          <Text
            style={{
              color: Colors.dark.subtext,
              textAlign: "center",
              marginBottom: 20,
              lineHeight: 20,
            }}
          >
            このアプリを使用するには{"\n"}アカウントが必要です
          </Text>
        </View>
        <AuthModal
          visible={showAuthModal}
          forceSignUp={false}
          allowClose={false}
          onClose={() => {
            // 認証が完了するまでモーダルを閉じることはできません
            if (isAuthenticated) {
              setShowAuthModal(false);
            }
          }}
        />
      </View>
    );
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: Colors.dark.background,
          },
          headerTintColor: Colors.dark.text,
          headerShadowVisible: false,
          contentStyle: {
            backgroundColor: Colors.dark.background,
          },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: "modal" }} />
      </Stack>
    </>
  );
}
