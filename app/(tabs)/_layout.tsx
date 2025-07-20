import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { usePodcastStore } from "@/store/podcastStore";

export default function TabLayout() {
  const { setHomeTabFocused, savePlayingStateForTabSwitch } = usePodcastStore();

  const handleTabPress = (routeName: string) => {
    if (routeName === 'index') {
      // ホームタブに遷移する場合
      setHomeTabFocused(true);
    } else {
      // ホームタブから他のタブに遷移する場合
      savePlayingStateForTabSwitch();
      setHomeTabFocused(false);
    }
  };

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: Colors.dark.background,
          borderTopColor: Colors.dark.border,
        },
        tabBarActiveTintColor: Colors.dark.primary,
        tabBarInactiveTintColor: Colors.dark.inactive,
        tabBarShowLabel: false,
        headerStyle: {
          backgroundColor: Colors.dark.background,
        },
        headerTintColor: Colors.dark.text,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "TechCast",
          tabBarIcon: ({ color }) => (
            <Ionicons name="home" size={24} color={color} />
          ),
          headerShown: false,
        }}
        listeners={{
          tabPress: () => handleTabPress('index'),
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: "Discover",
          tabBarIcon: ({ color }) => (
            <Ionicons name="search" size={24} color={color} />
          ),
        }}
        listeners={{
          tabPress: () => handleTabPress('discover'),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: "Create",
          tabBarIcon: ({ color }) => (
            <Ionicons name="add-circle" size={28} color={color} />
          ),
          headerShown: false,
        }}
        listeners={{
          tabPress: () => handleTabPress('create'),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <Ionicons name="person" size={24} color={color} />
          ),
          headerShown: false,
        }}
        listeners={{
          tabPress: () => handleTabPress('profile'),
        }}
      />
    </Tabs>
  );
}
