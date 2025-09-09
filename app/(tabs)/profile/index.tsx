import { ProfileMenuModal } from "@/components/ProfileMenuModal";
import { useAuth } from "@/hooks/useAuth";
import { podcasts } from "@/mocks/podcasts";
import { currentUser } from "@/mocks/users";
import { useAuthStore } from "@/store/authStore";
import { usePodcastStore } from "@/store/podcastStore";
import { formatNumber } from "@/utils/formatNumber";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  Dimensions,
  FlatList,
  RefreshControl,
  SafeAreaView,
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
  const [showMenuModal, setShowMenuModal] = useState(false);
  const { user, profile, isAuthenticated, signOut } = useAuth();
  const { initialize, loadProfile, loadUserStatistics, statistics } = useAuthStore();
  const {
    podcasts: allPodcasts,
    savedPodcasts,
    likedPodcasts,
  } = usePodcastStore();

  // タブに応じたポッドキャストデータを取得
  const getDisplayPodcasts = () => {
    switch (activeTab) {
      case "podcasts":
        return podcasts.slice(0, 4); // モックデータを使用（マイポッドキャスト）
      case "saved":
        return allPodcasts
          .filter((podcast) => savedPodcasts.has(podcast.id))
          .slice(0, 4);
      case "liked":
        return allPodcasts
          .filter((podcast) => likedPodcasts.has(podcast.id))
          .slice(0, 4);
      default:
        return [];
    }
  };

  const displayPodcasts = getDisplayPodcasts();

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
      // プロフィール情報と統計情報を最新状態にする
      if (user?.id) {
        await loadProfile(user.id);
        await loadUserStatistics(user.id);
      }
    } catch (error) {
      console.error("Profile refresh error:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleEditProfile = () => {
    router.push("/profile/edit");
  };

  const renderPodcastItem = ({ item }: any) => {
    return (
      <TouchableOpacity 
        className="m-3 rounded-xl bg-[#1E2430] overflow-hidden"
        style={{ width: THUMBNAIL_SIZE }}
      >
        <Image 
          source={{ uri: item.imageUrl }} 
          className="w-full"
          style={{ height: THUMBNAIL_SIZE }}
        />
        <View className="p-3">
          <Text className="text-white text-sm font-bold mb-1" numberOfLines={2}>
            {item.title}
          </Text>
          <View className="flex-row justify-between">
            <Text className="text-[#A0A7B5] text-xs">{item.duration}</Text>
            <Text className="text-[#A0A7B5] text-xs">
              {formatNumber(item.likes)} likes
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // アプリレベルで認証チェックしているため、この画面では認証済みユーザーのみが表示される

  return (
    <SafeAreaView className="flex-1 bg-[#121620]">
      <View className="flex-row items-center justify-between px-5 pt-2 pb-2">
        <View className="w-6" />
        <TouchableOpacity
          className="p-2 rounded-lg"
          onPress={() => setShowMenuModal(true)}
        >
          <Ionicons name="menu" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View className="items-center px-5 mb-4">
        <Image
          source={
            profile?.avatar_url 
              ? { uri: profile.avatar_url }
              : currentUser.avatar 
                ? { uri: currentUser.avatar }
                : require('@/assets/images/defaultAvatar.png')
          }
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            marginBottom: 12,
            borderWidth: 2,
            borderColor: '#4F7CFF',
          }}
          onError={(error) => {
            console.error('Avatar image loading error:', error);
          }}
        />
        <Text className="text-white text-xl font-bold">
          {profile?.display_name ||
            profile?.username ||
            user?.email ||
            currentUser.fullName}
        </Text>
        <Text className="text-[#A0A7B5] text-sm mb-6">
          @
          {profile?.username ||
            user?.email?.split("@")[0] ||
            currentUser.username}
        </Text>

        <View className="flex-row justify-around w-full mb-4">
          <View className="items-center">
            <Text className="text-white text-base font-bold">
              {formatNumber(statistics?.podcasts || 0)}
            </Text>
            <Text className="text-[#A0A7B5] text-xs">Podcasts</Text>
          </View>
          <View className="w-px h-6 bg-[#1E2430]" />
          <View className="items-center">
            <Text className="text-white text-base font-bold">
              {formatNumber(statistics?.followers || 0)}
            </Text>
            <Text className="text-[#A0A7B5] text-xs">Followers</Text>
          </View>
          <View className="w-px h-6 bg-[#1E2430]" />
          <View className="items-center">
            <Text className="text-white text-base font-bold">
              {formatNumber(statistics?.following || 0)}
            </Text>
            <Text className="text-[#A0A7B5] text-xs">Following</Text>
          </View>
        </View>

        <TouchableOpacity 
          className="border border-[#4F7CFF] py-2 px-6 rounded-full"
          onPress={handleEditProfile}
        >
          <Text className="text-[#4F7CFF] font-bold">プロフィールを編集</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-row border-b border-[#1E2430]">
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            className={`flex-1 items-center py-3 ${
              activeTab === tab.id ? 'border-b-2 border-[#4F7CFF]' : ''
            }`}
            onPress={() => setActiveTab(tab.id)}
          >
            <Ionicons
              name={tab.icon as any}
              size={20}
              color={activeTab === tab.id ? '#4F7CFF' : '#A0A7B5'}
            />
            <Text
              className={`mt-1 text-xs ${
                activeTab === tab.id ? 'text-[#4F7CFF]' : 'text-[#A0A7B5]'
              }`}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View className="flex-1">
        {activeTab === "podcasts" ||
        activeTab === "saved" ||
        activeTab === "liked" ? (
          displayPodcasts.length > 0 ? (
            <FlatList
              data={displayPodcasts as any} // TODO anyを削除
              renderItem={renderPodcastItem}
              keyExtractor={(item) => item.id}
              numColumns={2}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ padding: 8 }}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={refreshProfile}
                  tintColor="#4F7CFF"
                  colors={["#4F7CFF"]}
                />
              }
            />
          ) : (
            <View className="flex-1 justify-center items-center p-5">
              <Ionicons
                name={
                  activeTab === "podcasts"
                    ? "headset"
                    : activeTab === "saved"
                    ? "bookmark"
                    : "heart"
                }
                size={50}
                color="#A0A7B5"
              />
              <Text className="text-[#A0A7B5] mt-3 mb-5 text-center">
                {activeTab === "podcasts"
                  ? "You haven't created any podcasts yet"
                  : activeTab === "saved"
                  ? "No saved podcasts yet"
                  : "No liked podcasts yet"}
              </Text>
              <TouchableOpacity className="bg-[#4F7CFF] py-3 px-5 rounded-full">
                <Text className="text-white font-bold">Browse Podcasts</Text>
              </TouchableOpacity>
            </View>
          )
        ) : activeTab === "history" ? (
          <View className="flex-1 justify-center items-center p-5">
            <Ionicons name="time" size={50} color="#A0A7B5" />
            <Text className="text-[#A0A7B5] mt-3 text-center">
              Your listening history will appear here
            </Text>
          </View>
        ) : (
          <View className="flex-1 justify-center items-center p-5">
            <Text className="text-[#A0A7B5] mb-5 text-center">No {activeTab} content yet</Text>
            <TouchableOpacity className="bg-[#4F7CFF] py-3 px-5 rounded-full">
              <Text className="text-white font-bold">Browse Podcasts</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <ProfileMenuModal
        visible={showMenuModal}
        onClose={() => setShowMenuModal(false)}
      />
    </SafeAreaView>
  );
}

