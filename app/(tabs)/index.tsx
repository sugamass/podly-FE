import CommentModal from "@/components/CommentModal";
import { EmptyDisplay } from "@/components/HomeScreen/EmptyDisplay";
import { ErrorDisplay } from "@/components/HomeScreen/ErrorDisplay";
import { LoadingDisplay } from "@/components/HomeScreen/LoadingDisplay";
import { PodcastListItem } from "@/components/HomeScreen/PodcastListItem";
import Colors from "@/constants/Colors";
import { useAudioPlayerSync } from "@/hooks/useAudioPlayerSync";
import { useHomeScreenInitialization } from "@/hooks/useHomeScreenInitialization";
import { usePodcastStore } from "@/store/podcastStore";
import { UIPodcast } from "@/types/podcast";
import { logger } from "@/utils/logger";
import { getItemHeight } from "@/utils/screenUtils";
import { StatusBar } from "expo-status-bar";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function FeedScreen() {
  const {
    podcasts,
    switchToPodcast,
    hasNextPage,
    loadMorePodcasts,
    refreshPodcasts,
    useSupabaseData,
  } = usePodcastStore();

  // カスタムフックを使用
  const { isLoading, error } = useHomeScreenInitialization();
  useAudioPlayerSync();

  const [activePodcastIndex, setActivePodcastIndex] = useState<number>(0);
  const [showComments, setShowComments] = useState<boolean>(false);
  const [selectedPodcastId, setSelectedPodcastId] = useState<string>("");
  const [tabBarHeight, setTabBarHeight] = useState<number>(0);
  const flatListRef = useRef<FlatList>(null);
  const safeAreaInsets = useSafeAreaInsets();

  const itemHeight = useMemo(() => {
    const height = getItemHeight(safeAreaInsets, tabBarHeight);
    return height;
  }, [safeAreaInsets, tabBarHeight]);

  // コンテナの高さを測定してタブバーの高さを算出
  const handleContainerLayout = useCallback(
    (event: any) => {
      const { height: containerHeight } = event.nativeEvent.layout;
      const { height: windowHeight } = Dimensions.get("window");

      const calculatedTabBarHeight =
        windowHeight - containerHeight - safeAreaInsets.top;
      const finalTabBarHeight = Math.max(0, calculatedTabBarHeight);

      logger.debug("Container layout calculated", {
        windowHeight,
        containerHeight,
        safeAreaTop: safeAreaInsets.top,
        safeAreaBottom: safeAreaInsets.bottom,
        calculatedTabBarHeight,
        finalTabBarHeight,
      });

      setTabBarHeight(finalTabBarHeight);
    },
    [safeAreaInsets.top, safeAreaInsets.bottom]
  );

  // 初期化とプレイヤー同期はカスタムフックで処理される

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

  const handleRefresh = useCallback(async () => {
    await refreshPodcasts();
  }, [refreshPodcasts]);

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isLoading && useSupabaseData) {
      loadMorePodcasts();
    }
  }, [hasNextPage, isLoading, useSupabaseData, loadMorePodcasts]);

  const renderItem = useCallback(
    ({ item, index }: { item: UIPodcast; index: number }) => (
      <PodcastListItem
        item={item}
        index={index}
        isActive={index === activePodcastIndex}
        itemHeight={itemHeight}
        onCommentPress={handleCommentPress}
      />
    ),
    [activePodcastIndex, handleCommentPress, itemHeight]
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

      {error && (
        <ErrorDisplay
          error={error}
          useSupabaseData={useSupabaseData}
          podcastsLength={podcasts.length}
          isLoading={isLoading}
          onRetry={handleRefresh}
        />
      )}

      {/* ローディング表示（データが空で読み込み中の場合） */}
      {isLoading && podcasts.length === 0 && <LoadingDisplay />}

      {/* データが空でローディングも完了している場合 */}
      {!isLoading && podcasts.length === 0 && !error && (
        <EmptyDisplay onRetry={handleRefresh} />
      )}

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
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={isLoading && podcasts.length > 0}
            onRefresh={handleRefresh}
            tintColor={Colors.dark.primary}
            colors={[Colors.dark.primary]}
          />
        }
        getItemLayout={(_, index) => ({
          length: itemHeight,
          offset: itemHeight * index,
          index,
        })}
        ListFooterComponent={
          isLoading && hasNextPage ? (
            <View style={styles.loadingFooter}>
              <ActivityIndicator size="small" color={Colors.dark.primary} />
            </View>
          ) : null
        }
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
  loadingFooter: {
    padding: 20,
    alignItems: "center",
  },
});
