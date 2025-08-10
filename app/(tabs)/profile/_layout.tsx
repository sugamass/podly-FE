import Colors from "@/constants/Colors";
import { Stack } from "expo-router";

export default function ProfileLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.dark.background,
        },
        headerTintColor: Colors.dark.text,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "プロフィール",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="edit"
        options={{
          title: "プロフィール編集",
          headerShown: false, // edit画面は独自のヘッダーを持っているため
        }}
      />
    </Stack>
  );
}