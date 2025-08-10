import Colors from "@/constants/Colors";
import { Stack } from "expo-router";

export default function CreateLayout() {
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
          title: "原稿作成",
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="audio"
        options={{
          title: "音声生成",
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="publish"
        options={{
          title: "公開設定",
          headerShown: true,
        }}
      />
    </Stack>
  );
}