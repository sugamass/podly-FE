import Colors from "@/constants/Colors";
import { useAuth } from "@/hooks/useAuth";
import { podcasts } from "@/mocks/podcasts";
import { currentUser } from "@/mocks/users";
import { useAuthStore } from "@/store/authStore";
import { formatNumber } from "@/utils/formatNumber";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Alert,
  Dimensions,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");
const THUMBNAIL_SIZE = width / 2 - 20;

const tabs = [
  { id: "podcasts", icon: "headset", label: "Podcasts" },
  { id: "saved", icon: "bookmark", label: "Saved" },
  { id: "liked", icon: "heart", label: "Liked" },
  { id: "history", icon: "time", label: "History" },
];

export default function ProfileScreen() {
  const [activeTab, setActiveTab] = useState("podcasts");
  const [refreshing, setRefreshing] = useState(false);
  const { user, profile, isAuthenticated, signOut } = useAuth();
  const { initialize, loadProfile } = useAuthStore();

  // 画面フォーカス時にプロフィールを再読み込み
  useFocusEffect(
    useCallback(() => {
      if (user?.id) {
        refreshProfile();
      }
    }, [user?.id])
  );

  const refreshProfile = async () => {
    try {
      setRefreshing(true);
      // プロフィール情報を最新状態にする
      if (user?.id) {
        await loadProfile(user.id);
      }
    } catch (error) {
      console.error("Profile refresh error:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert("ログアウト", "ログアウトしてもよろしいですか？", [
      { text: "キャンセル", style: "cancel" },
      {
        text: "ログアウト",
        style: "destructive",
        onPress: async () => {
          try {
            await signOut();
          } catch (error) {
            Alert.alert("エラー", "ログアウトに失敗しました");
          }
        },
      },
    ]);
  };

  const handleEditProfile = () => {
    router.push("/edit-profile");
  };

  const renderPodcastItem = ({ item }: any) => {
    return (
      <TouchableOpacity style={styles.podcastCard}>
        <Image source={{ uri: item.imageUrl }} style={styles.podcastImage} />
        <View style={styles.podcastInfo}>
          <Text style={styles.podcastTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <View style={styles.podcastStats}>
            <Text style={styles.podcastDuration}>{item.duration}</Text>
            <Text style={styles.podcastLikes}>
              {formatNumber(item.likes)} likes
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // アプリレベルで認証チェックしているため、この画面では認証済みユーザーのみが表示される

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.settingsButton} onPress={handleSignOut}>
          <Ionicons name="log-out" size={24} color={Colors.dark.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.profileSection}>
        <Image
          source={{ uri: profile?.avatar_url || currentUser.avatar }}
          style={styles.avatar}
        />
        <Text style={styles.name}>
          {profile?.full_name ||
            profile?.username ||
            user?.email ||
            currentUser.fullName}
        </Text>
        <Text style={styles.username}>
          @
          {profile?.username ||
            user?.email?.split("@")[0] ||
            currentUser.username}
        </Text>

        <Text style={styles.bio}>{profile?.bio || currentUser.bio}</Text>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {formatNumber(currentUser.podcasts)}
            </Text>
            <Text style={styles.statLabel}>Podcasts</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {formatNumber(currentUser.followers)}
            </Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {formatNumber(currentUser.following)}
            </Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
          <Text style={styles.editButtonText}>プロフィールを編集</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabsContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tabButton,
              activeTab === tab.id && styles.activeTabButton,
            ]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Ionicons
              name={tab.icon as any}
              size={20}
              color={
                activeTab === tab.id
                  ? Colors.dark.primary
                  : Colors.dark.inactive
              }
            />
            <Text
              style={[
                styles.tabLabel,
                activeTab === tab.id && styles.activeTabLabel,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.contentContainer}>
        {activeTab === "podcasts" ? (
          <FlatList
            data={podcasts.slice(0, 4)}
            renderItem={renderPodcastItem}
            keyExtractor={(item) => item.id}
            numColumns={2}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.podcastGrid}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={refreshProfile}
                tintColor={Colors.dark.primary}
                colors={[Colors.dark.primary]}
              />
            }
          />
        ) : activeTab === "history" ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="time" size={50} color={Colors.dark.inactive} />
            <Text style={styles.emptyText}>
              Your listening history will appear here
            </Text>
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No {activeTab} podcasts yet</Text>
            <TouchableOpacity style={styles.browseButton}>
              <Text style={styles.browseButtonText}>Browse Podcasts</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 15,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.dark.card,
    justifyContent: "center",
    alignItems: "center",
  },
  profileSection: {
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
    borderWidth: 3,
    borderColor: Colors.dark.primary,
  },
  name: {
    color: Colors.dark.text,
    fontSize: 22,
    fontWeight: "bold",
  },
  username: {
    color: Colors.dark.subtext,
    fontSize: 16,
    marginBottom: 15,
  },
  bio: {
    color: Colors.dark.text,
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
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
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: Colors.dark.border,
  },
  editButton: {
    borderWidth: 1,
    borderColor: Colors.dark.primary,
    paddingVertical: 8,
    paddingHorizontal: 30,
    borderRadius: 20,
  },
  editButtonText: {
    color: Colors.dark.primary,
    fontWeight: "bold",
  },
  tabsContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.dark.primary,
  },
  tabLabel: {
    color: Colors.dark.inactive,
    marginTop: 4,
    fontSize: 12,
  },
  activeTabLabel: {
    color: Colors.dark.primary,
  },
  contentContainer: {
    flex: 1,
  },
  podcastGrid: {
    padding: 10,
  },
  podcastCard: {
    width: THUMBNAIL_SIZE,
    margin: 10,
    borderRadius: 12,
    backgroundColor: Colors.dark.card,
    overflow: "hidden",
  },
  podcastImage: {
    width: "100%",
    height: THUMBNAIL_SIZE,
  },
  podcastInfo: {
    padding: 10,
  },
  podcastTitle: {
    color: Colors.dark.text,
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 5,
  },
  podcastStats: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  podcastDuration: {
    color: Colors.dark.subtext,
    fontSize: 12,
  },
  podcastLikes: {
    color: Colors.dark.subtext,
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    color: Colors.dark.subtext,
    marginTop: 10,
    marginBottom: 20,
    textAlign: "center",
  },
  browseButton: {
    backgroundColor: Colors.dark.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  browseButtonText: {
    color: Colors.dark.text,
    fontWeight: "bold",
  },
});
