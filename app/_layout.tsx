import { LoadingScreen } from "@/components/LoadingScreen";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import Colors from "@/constants/Colors";
import { useAppInitialization } from "@/hooks/useAppInitialization";
import { useAppStateHandler } from "@/hooks/useAppStateHandler";
import { useAuth } from "@/hooks/useAuth";
import { useAuthModal } from "@/hooks/useAuthModal";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";

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
    return <LoadingScreen />;
  }

  // If user is not authenticated, show welcome screen
  if (!isAuthenticated) {
    return (
      <WelcomeScreen
        showAuthModal={showAuthModal}
        onCloseAuthModal={() => {
          // 認証が完了するまでモーダルを閉じることはできません
          if (isAuthenticated) {
            setShowAuthModal(false);
          }
        }}
      />
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
