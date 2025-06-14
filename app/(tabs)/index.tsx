import AudioPlayer from "@/components/AudioPlayer";
import CommentModal from "@/components/CommentModal";
import PodcastActions from "@/components/PodcastActions";
import PodcastInfo from "@/components/PodcastInfo";
import Colors from "@/constants/Colors";
import { usePodcastStore } from "@/store/podcastStore";
import { StatusBar } from "expo-status-bar";
import React, { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { height } = Dimensions.get("window");

export default function FeedScreen() {
  const { podcasts, currentPodcastIndex, setCurrentPodcastIndex } =
    usePodcastStore();
  const [activePodcastIndex, setActivePodcastIndex] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [selectedPodcastId, setSelectedPodcastId] = useState("");
  const flatListRef = useRef<FlatList>(null);

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50,
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setActivePodcastIndex(viewableItems[0].index);
      setCurrentPodcastIndex(viewableItems[0].index);
    }
  }).current;

  const handleCommentPress = (podcastId: string) => {
    setSelectedPodcastId(podcastId);
    setShowComments(true);
  };

  const renderItem = ({ item, index }: any) => {
    return (
      <View style={styles.podcastContainer}>
        <AudioPlayer
          uri={item.audioUrl}
          imageUrl={item.imageUrl}
          isActive={index === activePodcastIndex}
        />

        <PodcastInfo
          title={item.title}
          host={item.host}
          duration={item.duration}
          description={item.description}
          category={item.category}
          tags={item.tags}
        />

        <PodcastActions
          podcastId={item.id}
          hostId={item.host.id}
          hostAvatar={item.host.avatar}
          likes={item.likes}
          comments={item.comments}
          shares={item.shares}
          onCommentPress={() => handleCommentPress(item.id)}
        />
      </View>
    );
  };

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
});
