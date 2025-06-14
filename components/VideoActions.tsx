import Colors from "@/constants/Colors";
import { User } from "@/mocks/users";
import { formatNumber } from "@/utils/formatNumber";
import { Image } from "expo-image";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ProfileHeaderProps {
  user: User;
  isCurrentUser?: boolean;
}

export default function ProfileHeader({
  user,
  isCurrentUser = false,
}: ProfileHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.userInfo}>
        <Image source={{ uri: user.avatar }} style={styles.avatar} />
        <Text style={styles.username}>@{user.username}</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{formatNumber(user.following)}</Text>
          <Text style={styles.statLabel}>Following</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{formatNumber(user.followers)}</Text>
          <Text style={styles.statLabel}>Followers</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{formatNumber(user.likes)}</Text>
          <Text style={styles.statLabel}>Likes</Text>
        </View>
      </View>

      <View style={styles.bioContainer}>
        <Text style={styles.bio}>{user.bio}</Text>
      </View>

      <View style={styles.actionContainer}>
        {isCurrentUser ? (
          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.followButton}>
              <Text style={styles.followButtonText}>Follow</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.messageButton}>
              <Text style={styles.messageButtonText}>Message</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: Colors.dark.background,
  },
  userInfo: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: Colors.dark.primary,
  },
  username: {
    color: Colors.dark.text,
    fontSize: 18,
    fontWeight: "bold",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    color: Colors.dark.text,
    fontSize: 18,
    fontWeight: "bold",
  },
  statLabel: {
    color: Colors.dark.subtext,
    fontSize: 14,
  },
  bioContainer: {
    marginBottom: 20,
  },
  bio: {
    color: Colors.dark.text,
    textAlign: "center",
  },
  actionContainer: {
    alignItems: "center",
  },
  editButton: {
    borderWidth: 1,
    borderColor: Colors.dark.border,
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 8,
  },
  editButtonText: {
    color: Colors.dark.text,
    fontWeight: "bold",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
  },
  followButton: {
    backgroundColor: Colors.dark.primary,
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginRight: 10,
  },
  followButtonText: {
    color: Colors.dark.text,
    fontWeight: "bold",
  },
  messageButton: {
    borderWidth: 1,
    borderColor: Colors.dark.border,
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  messageButtonText: {
    color: Colors.dark.text,
    fontWeight: "bold",
  },
});
