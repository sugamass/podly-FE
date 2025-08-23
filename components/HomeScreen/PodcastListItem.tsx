import { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import AudioPlayer from '@/components/AudioPlayer';
import PodcastActions from '@/components/PodcastActions';
import PodcastInfo from '@/components/PodcastInfo';
import Colors from '@/constants/Colors';
import { UIPodcast } from '@/types/podcast';
import { logger } from '@/utils/logger';

interface PodcastListItemProps {
  item: UIPodcast;
  index: number;
  isActive: boolean;
  itemHeight: number;
  onCommentPress: (podcastId: string) => void;
}

export const PodcastListItem = memo(({ 
  item, 
  index, 
  isActive, 
  itemHeight, 
  onCommentPress 
}: PodcastListItemProps) => {
  logger.debug('Rendering podcast item', {
    id: item.id,
    title: item.title,
    imageUrl: item.imageUrl,
    index,
    isActive
  });

  return (
    <View style={[styles.podcastContainer, { height: itemHeight }]}>
      <AudioPlayer
        podcastId={item.id}
        imageUrl={item.imageUrl}
        isActive={isActive}
      />

      <View pointerEvents="box-none">
        <View pointerEvents="auto">
          <PodcastInfo
            title={item.title}
            host={{
              name: item.host.name,
              avatar: item.host.avatar || '',
              verified: item.host.verified
            }}
            duration={item.duration}
            description={item.description || ''}
            category={item.category || ''}
            tags={item.tags}
          />
        </View>

        <View pointerEvents="auto">
          <PodcastActions
            podcastId={item.id}
            hostId={item.host.id}
            hostAvatar={item.host.avatar || ''}
            likes={item.likes}
            comments={item.comments}
            shares={item.shares}
            onCommentPress={() => onCommentPress(item.id)}
            isLiked={item.isLiked}
            isSaved={item.isSaved}
          />
        </View>
      </View>
    </View>
  );
});

PodcastListItem.displayName = 'PodcastListItem';

const styles = StyleSheet.create({
  podcastContainer: {
    backgroundColor: Colors.dark.background,
  },
});