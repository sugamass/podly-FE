# components/AudioPlayer.tsx リファクタリング計画

## 📋 現在の問題点

### 1. デバッグ情報の本番環境混入（行72-85）
**問題**: console.logとデバッグ表示が本番環境に残存
```typescript
{/* デバッグ情報表示 */}
{__DEV__ && (
  <View style={styles.debugInfo}>
    <Text style={styles.debugText}>
      Debug: isCurrentPodcast={String(isCurrentPodcast)} 
      isActive={String(isActive)} 
      isPlaying={String(isPlaying)} 
      manuallyPaused={String(manuallyPaused)}
    </Text>
  </View>
)}

console.log('AudioPlayer render:', {
  podcastId: podcast.id,
  isCurrentPodcast,
  isActive,
  isPlaying,
  // 長いデバッグ情報...
});
```

### 2. 複雑な状態管理
**問題**: 複数の状態が相互依存している
```typescript
const [imageError, setImageError] = useState(false);
const [imageLoaded, setImageLoaded] = useState(false); 
const [showPauseIcon, setShowPauseIcon] = useState(false);
```

### 3. 複雑な画像URL生成ロジック
**問題**: 条件分岐が多く、理解が困難
```typescript
const getImageUrl = (url: string | null) => {
  if (!url) return 'https://picsum.photos/300/300?random=' + Math.random();
  if (url.startsWith('http')) return url;
  return `${supabaseUrl}/storage/v1/object/public/podcast-thumbnails/${url}`;
};
```

### 4. 長い条件式（行129-131）
**問題**: アイコン表示ロジックが複雑
```typescript
const shouldShowPauseIcon = isCurrentPodcast && isActive && isPlaying && !manuallyPaused;
```

### 5. インラインスタイル定義
**問題**: 再利用性が低く、保守が困難

## 🛠️ リファクタリング提案

### Phase 1: デバッグ機能の環境分離
```typescript
// utils/debugLogger.ts
export const debugLogger = {
  audioPlayer: (data: any) => {
    if (__DEV__) {
      console.log('[AudioPlayer]', data);
    }
  }
};

// components/AudioPlayer/DebugOverlay.tsx  
interface DebugOverlayProps {
  isCurrentPodcast: boolean;
  isActive: boolean;
  isPlaying: boolean;
  manuallyPaused: boolean;
}

export const DebugOverlay = ({ 
  isCurrentPodcast, 
  isActive, 
  isPlaying, 
  manuallyPaused 
}: DebugOverlayProps) => {
  if (!__DEV__) return null;
  
  return (
    <View style={styles.debugOverlay}>
      <Text style={styles.debugText}>
        Current: {String(isCurrentPodcast)} | Active: {String(isActive)} | 
        Playing: {String(isPlaying)} | Paused: {String(manuallyPaused)}
      </Text>
    </View>
  );
};
```

### Phase 2: カスタムフックへの状態分離
```typescript
// hooks/useImageState.ts
export const useImageState = (imageUrl: string | null) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const processedImageUrl = useMemo(() => {
    if (!imageUrl) {
      return `https://picsum.photos/300/300?random=${Math.random()}`;
    }
    
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    
    return `${supabaseUrl}/storage/v1/object/public/podcast-thumbnails/${imageUrl}`;
  }, [imageUrl]);
  
  const resetImageState = useCallback(() => {
    setImageError(false);
    setImageLoaded(false);
  }, []);
  
  return {
    processedImageUrl,
    imageError,
    imageLoaded,
    setImageError,
    setImageLoaded,
    resetImageState
  };
};

// hooks/usePlaybackStatus.ts
export const usePlaybackStatus = (
  isCurrentPodcast: boolean,
  isActive: boolean,
  isPlaying: boolean,
  manuallyPaused: boolean
) => {
  const shouldShowPauseIcon = useMemo(() => {
    return isCurrentPodcast && isActive && isPlaying && !manuallyPaused;
  }, [isCurrentPodcast, isActive, isPlaying, manuallyPaused]);
  
  const playbackState = useMemo(() => {
    if (!isCurrentPodcast || !isActive) return 'stopped';
    if (manuallyPaused) return 'paused';
    if (isPlaying) return 'playing';
    return 'ready';
  }, [isCurrentPodcast, isActive, isPlaying, manuallyPaused]);
  
  return {
    shouldShowPauseIcon,
    playbackState
  };
};

// hooks/usePauseIconAnimation.ts
export const usePauseIconAnimation = (shouldShow: boolean) => {
  const [showPauseIcon, setShowPauseIcon] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    if (shouldShow) {
      setShowPauseIcon(true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
      
      const timer = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start(() => setShowPauseIcon(false));
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [shouldShow, fadeAnim]);
  
  return { showPauseIcon, fadeAnim };
};
```

### Phase 3: UIコンポーネントの分離
```typescript
// components/AudioPlayer/PodcastImage.tsx
interface PodcastImageProps {
  imageUrl: string;
  imageError: boolean;
  imageLoaded: boolean;
  onLoad: () => void;
  onError: () => void;
  style?: ViewStyle;
}

export const PodcastImage = memo(({ 
  imageUrl, 
  imageError, 
  imageLoaded, 
  onLoad, 
  onError,
  style 
}: PodcastImageProps) => {
  if (imageError) {
    return (
      <View style={[styles.imageContainer, style]}>
        <View style={styles.imagePlaceholder}>
          <Ionicons name="image-outline" size={40} color={Colors.dark.subtext} />
        </View>
      </View>
    );
  }
  
  return (
    <View style={[styles.imageContainer, style]}>
      <Image
        source={{ uri: imageUrl }}
        style={styles.image}
        onLoad={onLoad}
        onError={onError}
      />
      {!imageLoaded && (
        <View style={styles.imageLoader}>
          <ActivityIndicator size="small" color={Colors.dark.primary} />
        </View>
      )}
    </View>
  );
});

// components/AudioPlayer/PlaybackOverlay.tsx
interface PlaybackOverlayProps {
  showPauseIcon: boolean;
  fadeAnim: Animated.Value;
}

export const PlaybackOverlay = memo(({ showPauseIcon, fadeAnim }: PlaybackOverlayProps) => {
  if (!showPauseIcon) return null;
  
  return (
    <Animated.View style={[styles.pauseIconOverlay, { opacity: fadeAnim }]}>
      <View style={styles.pauseIconContainer}>
        <Ionicons name="pause" size={32} color={Colors.dark.text} />
      </View>
    </Animated.View>
  );
});

// components/AudioPlayer/PodcastMeta.tsx
interface PodcastMetaProps {
  title: string;
  creator: string;
}

export const PodcastMeta = memo(({ title, creator }: PodcastMetaProps) => (
  <View style={styles.metaContainer}>
    <Text style={styles.title} numberOfLines={2}>
      {title}
    </Text>
    <Text style={styles.creator} numberOfLines={1}>
      {creator}
    </Text>
  </View>
));
```

### Phase 4: メインコンポーネントの簡素化
```typescript
// components/AudioPlayer.tsx（リファクタリング後）
interface AudioPlayerProps {
  podcast: Podcast;
  isActive?: boolean;
}

export const AudioPlayer = memo(({ podcast, isActive = false }: AudioPlayerProps) => {
  const { currentPodcastId, isPlaying, manuallyPaused } = usePodcastStore();
  
  const isCurrentPodcast = podcast.id === currentPodcastId;
  
  const { 
    processedImageUrl, 
    imageError, 
    imageLoaded, 
    setImageError, 
    setImageLoaded 
  } = useImageState(podcast.thumbnail_url);
  
  const { shouldShowPauseIcon } = usePlaybackStatus(
    isCurrentPodcast, 
    isActive, 
    isPlaying, 
    manuallyPaused
  );
  
  const { showPauseIcon, fadeAnim } = usePauseIconAnimation(shouldShowPauseIcon);
  
  // デバッグログ（環境依存）
  useEffect(() => {
    debugLogger.audioPlayer({
      podcastId: podcast.id,
      isCurrentPodcast,
      isActive,
      isPlaying,
      manuallyPaused
    });
  }, [podcast.id, isCurrentPodcast, isActive, isPlaying, manuallyPaused]);
  
  return (
    <View style={styles.container}>
      <PodcastImage
        imageUrl={processedImageUrl}
        imageError={imageError}
        imageLoaded={imageLoaded}
        onLoad={() => setImageLoaded(true)}
        onError={() => setImageError(true)}
        style={styles.imageWrapper}
      />
      
      <PlaybackOverlay
        showPauseIcon={showPauseIcon}
        fadeAnim={fadeAnim}
      />
      
      <PodcastMeta
        title={podcast.title}
        creator={podcast.creator || 'Unknown Creator'}
      />
      
      <DebugOverlay
        isCurrentPodcast={isCurrentPodcast}
        isActive={isActive}
        isPlaying={isPlaying}
        manuallyPaused={manuallyPaused}
      />
    </View>
  );
});

AudioPlayer.displayName = 'AudioPlayer';
```

### Phase 5: スタイルの統一化
```typescript
// components/AudioPlayer/styles.ts
export const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  
  imageContainer: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: Colors.dark.card,
  },
  
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.dark.card,
  },
  
  imageLoader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  
  metaContainer: {
    position: 'absolute',
    bottom: 80,
    left: 16,
    right: 80,
  },
  
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.dark.text,
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  
  creator: {
    fontSize: 14,
    color: Colors.dark.subtext,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  
  pauseIconOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -24 }, { translateY: -24 }],
    zIndex: 10,
  },
  
  pauseIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  debugOverlay: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 8,
    borderRadius: 4,
  },
  
  debugText: {
    fontSize: 10,
    color: Colors.dark.text,
    fontFamily: 'monospace',
  },
});
```

## 📈 期待される効果

### パフォーマンス向上
- **メモ化**: React.memoによる不要な再レンダリング防止
- **デバッグコード分離**: 本番環境でのパフォーマンス改善
- **画像処理最適化**: useMemoによる画像URL計算の最適化

### 保守性向上
- **責務分離**: 各フック・コンポーネントが明確な役割を持つ
- **再利用性**: PodcastImageやPodcastMetaの他での使用可能
- **テスタビリティ**: 個別コンポーネントのテストが容易

### 開発体験向上
- **デバッグ効率**: 構造化されたデバッグ情報
- **コード可読性**: 短くて理解しやすいコンポーネント
- **型安全性**: 適切な型定義による安全性向上

## 🎯 実装優先度

### High Priority
1. **デバッグコードの環境分離** - 本番パフォーマンス影響
2. **カスタムフック抽出** - 複雑な状態管理の整理

### Medium Priority
3. **UIコンポーネント分離** - 保守性向上
4. **スタイル統一** - 一貫性向上

### Low Priority
5. **アニメーション改善** - UX向上

## ⏱️ 見積もり時間
- **Phase 1**: 1時間
- **Phase 2**: 3時間
- **Phase 3**: 2時間
- **Phase 4**: 1.5時間
- **Phase 5**: 1時間

**総計**: 約8.5時間

## 🔗 依存関係
- **store/podcastStore.ts**: ポッドキャスト状態管理
- **services/supabase.ts**: SupabaseURL設定
- **utils/debugLogger.ts**: デバッグユーティリティ（新規作成）
- **components/AudioPlayer/**: 新規作成するサブコンポーネント群
- **hooks/**: カスタムフック群（新規作成）

## 🚨 注意点
- 画像のキャッシュ戦略を考慮する必要がある
- アニメーションのパフォーマンスに注意
- デバッグ表示の本番環境での完全な除去を確認