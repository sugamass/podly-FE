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

  const [activePodcastIndex, setActivePodcastIndex] = useState<number>(0);
  const [showComments, setShowComments] = useState<boolean>(false);
  const [selectedPodcastId, setSelectedPodcastId] = useState<string>("");
  const [tabBarHeight, setTabBarHeight] = useState<number>(0);
  const flatListRef = useRef<FlatList>(null);
  const safeAreaInsets = useSafeAreaInsets();

  useAudioPlayerSync({
    flatListRef,
    setActivePodcastIndex,
    activePodcastIndex,
  });

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
    <View className="flex-1 bg-background" onLayout={handleContainerLayout}>
      <StatusBar style="light" />

      <View
        className="absolute left-0 right-0 z-10 flex-row justify-center"
        style={{ top: 50 }}
      >
        <TouchableOpacity
          className="items-center"
          style={{ paddingHorizontal: 20, paddingVertical: 10 }}
        >
          <Text className="text-white text-base font-bold">おすすめ</Text>
          <View className="h-0.5 w-5 mt-1 bg-primary" />
        </TouchableOpacity>
        <TouchableOpacity
          className="items-center"
          style={{ paddingHorizontal: 20, paddingVertical: 10 }}
        >
          <Text className="text-base text-subtext">フォロー中</Text>
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
            <View className="p-5 items-center">
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
