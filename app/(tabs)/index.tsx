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
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import TrackPlayer from "react-native-track-player";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getItemHeight, getScreenDimensions } from "@/utils/screenUtils";
import { audioPlayerService } from "@/services/AudioPlayerService";

const { width } = Dimensions.get("window");

export default function FeedScreen() {
  const { 
    podcasts, 
    switchToPodcast, 
    isLoading, 
    error, 
    hasNextPage,
    loadMorePodcasts,
    refreshPodcasts,
    useSupabaseData,
    tryAutoResumeOnTabFocus,
    setIsPlaying
  } = usePodcastStore();
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
    console.log('📱 App initialization:', {
      useSupabaseData,
      podcastsLength: podcasts.length,
      isLoading,
      error
    });
    
    // Supabaseデータを取得（デフォルトで有効） - 一度だけ実行
    if (useSupabaseData && podcasts.length === 0 && !isLoading && !error) {
      console.log('🔄 Triggering refresh podcasts...');
      refreshPodcasts().catch(err => {
        console.error('❌ Refresh podcasts failed:', err);
      });
    }
  }, [useSupabaseData, refreshPodcasts]); // 依存配列を簡素化
  
  // ポッドキャストが読み込まれた後の処理
  useEffect(() => {
    if (podcasts.length > 0) {
      console.log('🎵 Podcasts loaded, switching to first podcast');
      switchToPodcast(0);
    }
  }, [podcasts.length, switchToPodcast]);

  // AudioPlayerServiceの状態同期を設定
  useEffect(() => {
    audioPlayerService.setStateUpdateCallback(setIsPlaying);
    
    return () => {
      audioPlayerService.setStateUpdateCallback(() => {});
    };
  }, [setIsPlaying]);

  useFocusEffect(
    React.useCallback(() => {
      // ホームタブにフォーカスした時の処理
      console.log('🏠 Home tab focused - attempting auto resume');
      tryAutoResumeOnTabFocus();
      
      return () => {
        // ホームタブからフォーカスが外れた時の処理
        console.log('🏠 Home tab unfocused - pausing audio');
        TrackPlayer.pause().catch((error) => {
          console.error("音声停止エラー:", error);
        });
      };
    }, [tryAutoResumeOnTabFocus])
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

  const handleRefresh = useCallback(async () => {
    await refreshPodcasts();
  }, [refreshPodcasts]);

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isLoading && useSupabaseData) {
      loadMorePodcasts();
    }
  }, [hasNextPage, isLoading, useSupabaseData, loadMorePodcasts]);

  const renderItem = useCallback(
    ({ item, index }: any) => {
      console.log("🎵 Rendering podcast item:", {
        id: item.id,
        title: item.title,
        imageUrl: item.imageUrl,
        index,
        isActive: index === activePodcastIndex
      });
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

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.debugText}>
            デバッグ情報: useSupabaseData={useSupabaseData ? 'true' : 'false'}, 
            podcasts={podcasts.length}, isLoading={isLoading ? 'true' : 'false'}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <Text style={styles.retryText}>再試行</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ローディング表示（データが空で読み込み中の場合） */}
      {isLoading && podcasts.length === 0 && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.dark.primary} />
          <Text style={styles.loadingText}>ポッドキャストを読み込み中...</Text>
        </View>
      )}

      {/* データが空でローディングも完了している場合 */}
      {!isLoading && podcasts.length === 0 && !error && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>ポッドキャストが見つかりません</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <Text style={styles.retryText}>手動で再取得</Text>
          </TouchableOpacity>
        </View>
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
  errorContainer: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    zIndex: 20,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 20,
    marginHorizontal: 20,
    borderRadius: 8,
  },
  errorText: {
    color: Colors.dark.text,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
  },
  debugText: {
    color: Colors.dark.subtext,
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: Colors.dark.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: Colors.dark.text,
    fontWeight: 'bold',
  },
  loadingFooter: {
    padding: 20,
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.dark.background,
  },
  loadingText: {
    color: Colors.dark.text,
    marginTop: 10,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.dark.background,
  },
  emptyText: {
    color: Colors.dark.subtext,
    fontSize: 18,
    textAlign: 'center',
  },
});
