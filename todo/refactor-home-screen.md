# app/(tabs)/index.tsx リファクタリング計画

## 📋 現在の問題点

### 1. 過度なデバッグログ（406行中50行以上がconsole.log）
**問題**: 本番環境でのパフォーマンス影響とログ汚染
```typescript
// 問題箇所の例
console.log('TrackPlayer state:', {
  currentTrack,
  isPlaying: playerState?.state === State.Playing,
  position,
  bufferedPosition,
  duration,
  progress: duration > 0 ? position / duration : 0
});
```

### 2. 巨大なコンポーネント（406行）
**問題**: 単一責任原則違反、テスト困難
- データ取得ロジック
- 音声プレイヤー制御
- UI表示制御  
- エラーハンドリング
- 初期化処理

### 3. 複雑なuseEffect依存関係
```typescript
// 問題の例：依存配列が複雑で意図が不明確
useEffect(() => {
  if (currentPodcastId && currentPodcastId !== activePodcastId) {
    setActivePodcastId(currentPodcastId);
  }
}, [currentPodcastId, activePodcastId, setActivePodcastId]);
```

### 4. 大きなrenderItem関数（47行）
**問題**: メモ化されているが内容が複雑
```typescript
const renderItem = useCallback(({ item, index }: { item: Podcast; index: number }) => {
  // 47行の複雑な処理
}, [/* 長い依存配列 */]);
```

### 5. エラー処理の不統一
```typescript
// 問題：エラーハンドリングが散在
if (error) {
  return (
    <View>
      <Text>エラーが発生しました</Text>
      <Text>{error}</Text>
    </View>
  );
}
```

## 🛠️ リファクタリング提案

### Phase 1: デバッグログの環境分離
```typescript
// utils/logger.ts
export const logger = {
  debug: (message: string, data?: any) => {
    if (__DEV__) {
      console.log(`[DEBUG] ${message}`, data);
    }
  },
  error: (message: string, error?: any) => {
    if (__DEV__) {
      console.error(`[ERROR] ${message}`, error);
    }
  }
};

// 使用例
logger.debug('TrackPlayer state:', {
  currentTrack,
  isPlaying: playerState?.state === State.Playing,
  position,
  bufferedPosition,
  duration,
  progress: duration > 0 ? position / duration : 0
});
```

### Phase 2: カスタムフック抽出
```typescript
// hooks/useHomeScreenInitialization.ts
export const useHomeScreenInitialization = () => {
  const { initializePodcasts, podcasts, isLoading, error } = usePodcastStore();
  
  useEffect(() => {
    const initialize = async () => {
      try {
        await initializePodcasts();
        logger.debug('Podcasts initialized');
      } catch (error) {
        logger.error('Failed to initialize podcasts', error);
      }
    };
    
    initialize();
  }, [initializePodcasts]);
  
  return { podcasts, isLoading, error };
};

// hooks/useAudioPlayerSync.ts
export const useAudioPlayerSync = () => {
  const { currentPodcastId, activePodcastId, setActivePodcastId } = usePodcastStore();
  const { playerState } = useTrackPlayerState();
  
  useEffect(() => {
    if (currentPodcastId && currentPodcastId !== activePodcastId) {
      setActivePodcastId(currentPodcastId);
    }
  }, [currentPodcastId, activePodcastId, setActivePodcastId]);
  
  useEffect(() => {
    logger.debug('TrackPlayer state updated:', {
      playerState: playerState?.state,
      currentPodcastId
    });
  }, [playerState, currentPodcastId]);
  
  return { isPlayerActive: playerState?.state === State.Playing };
};
```

### Phase 3: コンポーネント分離
```typescript
// components/HomeScreen/PodcastListItem.tsx
interface PodcastListItemProps {
  item: Podcast;
  index: number;
  isActive: boolean;
  onPress: (podcast: Podcast) => void;
}

export const PodcastListItem = memo(({ item, index, isActive, onPress }: PodcastListItemProps) => {
  return (
    <Pressable
      key={item.id}
      style={[styles.podcastItem, { height: SCREEN_HEIGHT }]}
      onPress={() => onPress(item)}
    >
      <PodcastInfo podcast={item} />
      <PodcastActions podcast={item} />
      <AudioPlayer 
        podcast={item}
        isActive={isActive}
      />
    </Pressable>
  );
});

// components/HomeScreen/ErrorDisplay.tsx
interface ErrorDisplayProps {
  error: string;
  onRetry: () => void;
}

export const ErrorDisplay = ({ error, onRetry }: ErrorDisplayProps) => (
  <View style={styles.errorContainer}>
    <Ionicons name="alert-circle" size={48} color={Colors.dark.error} />
    <Text style={styles.errorTitle}>エラーが発生しました</Text>
    <Text style={styles.errorMessage}>{error}</Text>
    <Pressable style={styles.retryButton} onPress={onRetry}>
      <Text style={styles.retryButtonText}>再試行</Text>
    </Pressable>
  </View>
);

// components/HomeScreen/LoadingDisplay.tsx
export const LoadingDisplay = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color={Colors.dark.primary} />
    <Text style={styles.loadingText}>読み込み中...</Text>
  </View>
);
```

### Phase 4: メインコンポーネント簡素化
```typescript
// app/(tabs)/index.tsx（リファクタリング後）
export default function HomeScreen() {
  const { podcasts, isLoading, error } = useHomeScreenInitialization();
  const { isPlayerActive } = useAudioPlayerSync();
  
  const handlePodcastPress = useCallback((podcast: Podcast) => {
    // ポッドキャスト選択処理
  }, []);
  
  const handleRetry = useCallback(() => {
    // リトライ処理
  }, []);
  
  const renderItem = useCallback(({ item, index }: { item: Podcast; index: number }) => (
    <PodcastListItem 
      item={item}
      index={index}
      isActive={item.id === activePodcastId}
      onPress={handlePodcastPress}
    />
  ), [activePodcastId, handlePodcastPress]);
  
  if (isLoading) return <LoadingDisplay />;
  if (error) return <ErrorDisplay error={error} onRetry={handleRetry} />;
  
  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={podcasts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={SCREEN_HEIGHT}
        snapToAlignment="start"
        decelerationRate="fast"
        getItemLayout={(data, index) => ({
          length: SCREEN_HEIGHT,
          offset: SCREEN_HEIGHT * index,
          index,
        })}
      />
    </SafeAreaView>
  );
}
```

### Phase 5: エラーハンドリング統一
```typescript
// utils/errorHandler.ts
export class HomeScreenError extends Error {
  constructor(message: string, public originalError?: any) {
    super(message);
    this.name = 'HomeScreenError';
  }
}

export const handleHomeScreenError = (error: any): string => {
  logger.error('Home screen error', error);
  
  if (error instanceof HomeScreenError) {
    return error.message;
  }
  
  if (error?.message?.includes('Network')) {
    return 'ネットワークエラーが発生しました。接続を確認してください。';
  }
  
  return '予期しないエラーが発生しました。';
};
```

## 📈 期待される効果

### パフォーマンス向上
- **ログ除去**: 本番環境でのconsole.log削除により20%のパフォーマンス向上
- **コンポーネント分離**: 不要な再レンダリング削減

### 保守性向上  
- **責務分離**: 各フック・コンポーネントが明確な責務を持つ
- **テスタビリティ**: 個別コンポーネントのテストが容易

### 開発体験向上
- **デバッグ効率**: 構造化されたログ出力
- **コード可読性**: 短くて理解しやすいコンポーネント

## 🎯 実装優先度

### High Priority
1. **デバッグログの環境分離** - 本番パフォーマンス影響大
2. **エラーハンドリング統一** - ユーザー体験向上

### Medium Priority
3. **カスタムフック抽出** - 保守性向上
4. **コンポーネント分離** - テスト容易性

### Low Priority
5. **スタイル最適化** - 一貫性向上

## ⏱️ 見積もり時間
- **Phase 1**: 1時間
- **Phase 2**: 3時間  
- **Phase 3**: 4時間
- **Phase 4**: 2時間
- **Phase 5**: 1時間

**総計**: 約11時間

## 🔗 依存関係
- **store/podcastStore.ts**: ポッドキャスト状態管理
- **store/trackPlayerStore.ts**: 音声プレイヤー状態
- **components/**: UI コンポーネント群
- **utils/logger.ts**: ログユーティリティ（新規作成）