import AudioPlayer from "@/components/AudioPlayer";
import CommentModal from "@/components/CommentModal";
import PodcastActions from "@/components/PodcastActions";
import PodcastInfo from "@/components/PodcastInfo";
import Colors from "@/constants/Colors";
import { usePodcastStore } from "@/store/podcastStore";
import { useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import TrackPlayer from "react-native-track-player";

const { height } = Dimensions.get("window");

export default function FeedScreen() {
  const { podcasts } = usePodcastStore();
  const [activePodcastIndex, setActivePodcastIndex] = useState<number>(0);
  const [showComments, setShowComments] = useState<boolean>(false);
  const [selectedPodcastId, setSelectedPodcastId] = useState<string>("");
  const flatListRef = useRef<FlatList>(null);

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
      setActivePodcastIndex(viewableItems[0].index);
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
        <View style={styles.podcastContainer}>
          <AudioPlayer
            uri={item.audioUrl}
            imageUrl={item.imageUrl}
            isActive={index === activePodcastIndex}
          />

          <View pointerEvents="box-none" style={styles.overlayContent}>
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
    [activePodcastIndex, handleCommentPress] // 依存配列に activePodcastIndex と handleCommentPress を指定
  );

  return (
    <View style={styles.container}>
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
        snapToInterval={height}
        snapToAlignment="start"
        decelerationRate="fast"
        viewabilityConfig={viewabilityConfig}
        onViewableItemsChanged={onViewableItemsChanged}
        removeClippedSubviews={true}
        maxToRenderPerBatch={1}
        windowSize={3}
        initialNumToRender={1}
        initialScrollIndex={0}
        // getItemLayout={(_, index) => ({
        //   length: height,
        //   offset: height * index,
        //   index,
        // })}
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
    height,
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
  overlayContent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "space-between",
    padding: 10,
  },
});
