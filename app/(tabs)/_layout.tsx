import Colors from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
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
          title: 'TechCast',
          tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: 'Discover',
          tabBarIcon: ({ color }) => <Ionicons name="search" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: 'Record',
          tabBarIcon: ({ color }) => (
            <Ionicons
              name="mic"
              size={24}
              color={Colors.dark.text}
              style={{
                backgroundColor: Colors.dark.primary,
                borderRadius: 8,
                padding: 10,
              }}
            />
          ),
        }}
        listeners={() => ({
          tabPress: (e) => {
            // Prevent default action
            e.preventDefault();
            // Handle create action here
            // For now, we'll just prevent navigation
          },
        })}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Ionicons name="person" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}