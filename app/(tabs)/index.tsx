import AudioPlayer from "@/components/AudioPlayer";
import CommentModal from "@/components/CommentModal";
import PodcastActions from "@/components/PodcastActions";
import PodcastInfo from "@/components/PodcastInfo";
import Colors from "@/constants/Colors";
import { usePodcastStore } from "@/store/podcastStore";
import { useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useRef, useState, useEffect, useMemo } from "react";
import {
  Dimensions,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import TrackPlayer from "react-native-track-player";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getItemHeight, getScreenDimensions } from "@/utils/screenUtils";

const { width } = Dimensions.get("window");

export default function FeedScreen() {
  const { podcasts, switchToPodcast } = usePodcastStore();
  const [activePodcastIndex, setActivePodcastIndex] = useState<number>(0);
  const [showComments, setShowComments] = useState<boolean>(false);
  const [selectedPodcastId, setSelectedPodcastId] = useState<string>("");
  const [tabBarHeight, setTabBarHeight] = useState<number>(0);
  const flatListRef = useRef<FlatList>(null);
  const safeAreaInsets = useSafeAreaInsets();

  const itemHeight = useMemo(() => {
    const height = getItemHeight(safeAreaInsets, tabBarHeight);
    console.log('📏 Item Height:', height, 'Tab Bar Height:', tabBarHeight);
    return height;
  }, [safeAreaInsets, tabBarHeight]);

  // コンテナの高さを測定してタブバーの高さを算出
  const handleContainerLayout = useCallback((event: any) => {
    const { height: containerHeight } = event.nativeEvent.layout;
    const { height: windowHeight } = Dimensions.get('window');
    
    // コンテナの高さと画面の高さの差からタブバーの高さを算出
    const calculatedTabBarHeight = windowHeight - containerHeight - safeAreaInsets.top;
    const finalTabBarHeight = Math.max(0, calculatedTabBarHeight);
    
    console.log('🔍 Height Debug:', {
      windowHeight,
      containerHeight,
      safeAreaTop: safeAreaInsets.top,
      safeAreaBottom: safeAreaInsets.bottom,
      calculatedTabBarHeight,
      finalTabBarHeight
    });
    
    setTabBarHeight(finalTabBarHeight);
  }, [safeAreaInsets.top, safeAreaInsets.bottom]);

  useEffect(() => {
    switchToPodcast(0);
  }, [switchToPodcast]);

  useFocusEffect(
    React.useCallback(() => {
      return () => {
        TrackPlayer.pause().catch((error) => {
          console.error("音声停止エラー:", error);
        });
      };
    }, [])
  );

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50,
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      const newIndex = viewableItems[0].index;
      setActivePodcastIndex(newIndex);
      switchToPodcast(newIndex);
    }
  }).current;

  const handleCommentPress = useCallback((podcastId: string) => {
    setSelectedPodcastId(podcastId);
    setShowComments(true);
  }, []);

  const renderItem = useCallback(
    ({ item, index }: any) => {
      console.log("item", item);
      console.log("index", index);
      return (
        <View style={[styles.podcastContainer, { height: itemHeight }]}>
          <AudioPlayer
            podcastId={item.id}
            imageUrl={item.imageUrl}
            isActive={index === activePodcastIndex}
          />

          <View pointerEvents="box-none">
            <View pointerEvents="auto">
              <PodcastInfo
                title={item.title}
                host={item.host}
                duration={item.duration}
                description={item.description}
                category={item.category}
                tags={item.tags}
              />
            </View>

            <View pointerEvents="auto">
              <PodcastActions
                podcastId={item.id}
                hostId={item.host.id}
                hostAvatar={item.host.avatar}
                likes={item.likes}
                comments={item.comments}
                shares={item.shares}
                onCommentPress={() => handleCommentPress(item.id)}
                isLiked={item.isLiked}
                isSaved={item.isSaved}
              />
            </View>
          </View>
        </View>
      );
    },
    [activePodcastIndex, handleCommentPress, itemHeight] // 依存配列に itemHeight を追加
  );

  return (
    <View style={styles.container} onLayout={handleContainerLayout}>
      <StatusBar style="light" />

      <View style={styles.tabsContainer}>
        <TouchableOpacity style={styles.tabButton}>
          <Text style={[styles.tabText, styles.activeTabText]}>For You</Text>
          <View style={styles.activeTabIndicator} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabButton}>
          <Text style={styles.tabText}>Following</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={podcasts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={itemHeight}
        snapToAlignment="start"
        decelerationRate="fast"
        viewabilityConfig={viewabilityConfig}
        onViewableItemsChanged={onViewableItemsChanged}
        removeClippedSubviews={true}
        maxToRenderPerBatch={1}
        windowSize={3}
        initialNumToRender={1}
        initialScrollIndex={0}
        getItemLayout={(_, index) => ({
          length: itemHeight,
          offset: itemHeight * index,
          index,
        })}
      />

      {showComments && (
        <CommentModal
          visible={showComments}
          onClose={() => setShowComments(false)}
          podcastId={selectedPodcastId}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  podcastContainer: {
    backgroundColor: Colors.dark.background,
  },
  tabsContainer: {
    position: "absolute",
    top: 50,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: "row",
    justifyContent: "center",
  },
  tabButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: "center",
  },
  tabText: {
    color: Colors.dark.subtext,
    fontSize: 16,
  },
  activeTabText: {
    color: Colors.dark.text,
    fontWeight: "bold",
  },
  activeTabIndicator: {
    height: 2,
    width: 20,
    backgroundColor: Colors.dark.primary,
    marginTop: 5,
  },
});
