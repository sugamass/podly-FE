# components/PodcastActions.tsx リファクタリング計画

## 📋 現在の問題点

### 1. 重複した処理コード（いいね・保存処理）
**問題**: いいね処理（109-146行）と保存処理（148-185行）で同じパターンのコードが重複
```typescript
// いいね処理
const handleLike = async () => {
  if (!user) {
    Alert.alert('ログインが必要です', 'いいねをするにはログインしてください。');
    return;
  }
  
  // アニメーション処理...
  setIsLikeAnimating(true);
  // API呼び出し...
  // エラーハンドリング...
};

// 保存処理 - ほぼ同じパターン
const handleSave = async () => {
  if (!user) {
    Alert.alert('ログインが必要です', '保存するにはログインしてください。');
    return;
  }
  
  // 同じパターンの処理...
};
```

### 2. 複雑なアニメーション状態管理
**問題**: 複数のアニメーション状態が混在
```typescript
const [isLikeAnimating, setIsLikeAnimating] = useState(false);
const [isSaveAnimating, setIsSaveAnimating] = useState(false);
const likeAnimation = useRef(new Animated.Value(1)).current;
const saveAnimation = useRef(new Animated.Value(1)).current;
```

### 3. ハードコーディングされたアラートメッセージ
**問題**: メッセージが直接コードに埋め込まれている
```typescript
Alert.alert('ログインが必要です', 'いいねをするにはログインしてください。');
Alert.alert('ログインが必要です', '保存するにはログインしてください。');
Alert.alert('エラー', '処理中にエラーが発生しました。');
```

### 4. 長い条件式とスタイル計算
**問題**: 動的スタイル計算が複雑
```typescript
color={isLiked ? Colors.dark.highlight : Colors.dark.subtext}
```

### 5. エラーハンドリングの散在
**問題**: エラー処理が各関数に散らばっている

## 🛠️ リファクタリング提案

### Phase 1: 共通アクション処理の抽象化
```typescript
// hooks/useUserAction.ts
export type ActionType = 'like' | 'save' | 'follow';

interface UseUserActionOptions {
  requireAuth: boolean;
  animationDuration?: number;
  showSuccessMessage?: boolean;
}

export const useUserAction = (
  actionType: ActionType,
  options: UseUserActionOptions = { requireAuth: true }
) => {
  const { user } = useAuth();
  const [isAnimating, setIsAnimating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const animation = useRef(new Animated.Value(1)).current;
  
  const executeAction = async (
    actionFn: () => Promise<void>,
    onSuccess?: () => void
  ) => {
    // 認証チェック
    if (options.requireAuth && !user) {
      Alert.alert(
        AUTH_MESSAGES.LOGIN_REQUIRED.title,
        AUTH_MESSAGES[actionType.toUpperCase() as keyof typeof AUTH_MESSAGES].LOGIN_REQUIRED.message
      );
      return;
    }
    
    // アニメーション開始
    setIsAnimating(true);
    setError(null);
    
    try {
      // ボタンアニメーション
      Animated.sequence([
        Animated.timing(animation, {
          toValue: 0.8,
          duration: options.animationDuration || 100,
          useNativeDriver: true,
        }),
        Animated.timing(animation, {
          toValue: 1,
          duration: options.animationDuration || 100,
          useNativeDriver: true,
        })
      ]).start();
      
      // アクション実行
      await actionFn();
      
      // 成功時の処理
      onSuccess?.();
      
      if (options.showSuccessMessage) {
        // 成功メッセージ表示
      }
    } catch (error: any) {
      const errorMessage = getActionErrorMessage(actionType, error);
      setError(errorMessage);
      Alert.alert('エラー', errorMessage);
    } finally {
      setIsAnimating(false);
    }
  };
  
  return {
    executeAction,
    isAnimating,
    error,
    animation,
    clearError: () => setError(null)
  };
};

// utils/actionMessages.ts
export const AUTH_MESSAGES = {
  LOGIN_REQUIRED: {
    title: 'ログインが必要です',
  },
  LIKE: {
    LOGIN_REQUIRED: {
      message: 'いいねをするにはログインしてください。'
    },
    SUCCESS: 'いいねしました',
    ERROR: 'いいねに失敗しました'
  },
  SAVE: {
    LOGIN_REQUIRED: {
      message: '保存するにはログインしてください。'
    },
    SUCCESS: '保存しました',
    ERROR: '保存に失敗しました'
  },
  FOLLOW: {
    LOGIN_REQUIRED: {
      message: 'フォローするにはログインしてください。'
    },
    SUCCESS: 'フォローしました',
    ERROR: 'フォローに失敗しました'
  }
} as const;

export const getActionErrorMessage = (actionType: ActionType, error: any): string => {
  const baseMessage = AUTH_MESSAGES[actionType.toUpperCase() as keyof typeof AUTH_MESSAGES].ERROR;
  
  if (error?.message?.includes('Network')) {
    return 'ネットワークエラーが発生しました。接続を確認してください。';
  }
  
  return baseMessage;
};
```

### Phase 2: アクションボタンコンポーネントの作成
```typescript
// components/PodcastActions/ActionButton.tsx
interface ActionButtonProps {
  icon: string;
  isActive: boolean;
  count?: number;
  onPress: () => void;
  isAnimating?: boolean;
  animation?: Animated.Value;
  activeColor?: string;
  inactiveColor?: string;
  size?: number;
}

export const ActionButton = memo(({
  icon,
  isActive,
  count,
  onPress,
  isAnimating = false,
  animation,
  activeColor = Colors.dark.highlight,
  inactiveColor = Colors.dark.subtext,
  size = 24
}: ActionButtonProps) => {
  const animatedStyle = animation 
    ? { transform: [{ scale: animation }] }
    : {};
    
  return (
    <Pressable
      style={styles.actionButton}
      onPress={onPress}
      disabled={isAnimating}
    >
      <Animated.View style={[styles.actionButtonContent, animatedStyle]}>
        <Ionicons
          name={icon}
          size={size}
          color={isActive ? activeColor : inactiveColor}
        />
        {count !== undefined && (
          <Text style={[
            styles.actionCount,
            { color: isActive ? activeColor : inactiveColor }
          ]}>
            {formatNumber(count)}
          </Text>
        )}
      </Animated.View>
      {isAnimating && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color={activeColor} />
        </View>
      )}
    </Pressable>
  );
});

// components/PodcastActions/LikeButton.tsx
interface LikeButtonProps {
  podcast: Podcast;
  isLiked: boolean;
  likeCount: number;
  onLikeChange: (isLiked: boolean) => void;
}

export const LikeButton = memo(({ podcast, isLiked, likeCount, onLikeChange }: LikeButtonProps) => {
  const { executeAction, isAnimating, animation } = useUserAction('like', {
    requireAuth: true,
    animationDuration: 150
  });
  
  const handleLike = () => {
    executeAction(
      async () => {
        if (isLiked) {
          await removeLike(podcast.id);
        } else {
          await addLike(podcast.id);
        }
        onLikeChange(!isLiked);
      }
    );
  };
  
  return (
    <ActionButton
      icon={isLiked ? "heart" : "heart-outline"}
      isActive={isLiked}
      count={likeCount}
      onPress={handleLike}
      isAnimating={isAnimating}
      animation={animation}
      activeColor={Colors.dark.highlight}
    />
  );
});

// components/PodcastActions/SaveButton.tsx
interface SaveButtonProps {
  podcast: Podcast;
  isSaved: boolean;
  onSaveChange: (isSaved: boolean) => void;
}

export const SaveButton = memo(({ podcast, isSaved, onSaveChange }: SaveButtonProps) => {
  const { executeAction, isAnimating, animation } = useUserAction('save', {
    requireAuth: true,
    animationDuration: 150
  });
  
  const handleSave = () => {
    executeAction(
      async () => {
        if (isSaved) {
          await removeSave(podcast.id);
        } else {
          await addSave(podcast.id);
        }
        onSaveChange(!isSaved);
      }
    );
  };
  
  return (
    <ActionButton
      icon={isSaved ? "bookmark" : "bookmark-outline"}
      isActive={isSaved}
      onPress={handleSave}
      isAnimating={isAnimating}
      animation={animation}
      activeColor={Colors.dark.secondary}
    />
  );
});
```

### Phase 3: メインコンポーネントの簡素化
```typescript
// components/PodcastActions.tsx（リファクタリング後）
interface PodcastActionsProps {
  podcast: Podcast;
}

export const PodcastActions = memo(({ podcast }: PodcastActionsProps) => {
  const { 
    likedPodcasts, 
    savedPodcasts, 
    toggleLike, 
    toggleSave,
    incrementPlayCount 
  } = usePodcastStore();
  
  const isLiked = likedPodcasts.some(p => p.id === podcast.id);
  const isSaved = savedPodcasts.some(p => p.id === podcast.id);
  
  const handleLikeChange = useCallback((newIsLiked: boolean) => {
    toggleLike(podcast.id);
  }, [podcast.id, toggleLike]);
  
  const handleSaveChange = useCallback((newIsSaved: boolean) => {
    toggleSave(podcast.id);
  }, [podcast.id, toggleSave]);
  
  const handleShare = useCallback(async () => {
    try {
      await Share.share({
        message: `${podcast.title} - Podlyで聞いてみて！`,
        url: `https://podly.app/podcast/${podcast.id}`
      });
    } catch (error) {
      console.error('Share failed:', error);
    }
  }, [podcast]);
  
  const handleComment = useCallback(() => {
    // コメントモーダル表示ロジック
  }, []);
  
  return (
    <View style={styles.container}>
      <LikeButton
        podcast={podcast}
        isLiked={isLiked}
        likeCount={podcast.likes_count || 0}
        onLikeChange={handleLikeChange}
      />
      
      <ActionButton
        icon="chatbubble-outline"
        isActive={false}
        count={podcast.comments_count || 0}
        onPress={handleComment}
        inactiveColor={Colors.dark.subtext}
      />
      
      <SaveButton
        podcast={podcast}
        isSaved={isSaved}
        onSaveChange={handleSaveChange}
      />
      
      <ActionButton
        icon="share-outline"
        isActive={false}
        onPress={handleShare}
        inactiveColor={Colors.dark.subtext}
      />
    </View>
  );
});

PodcastActions.displayName = 'PodcastActions';
```

### Phase 4: API呼び出しの分離
```typescript
// services/podcastInteractions.ts
export const addLike = async (podcastId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('likes')
      .insert({ podcast_id: podcastId });
      
    if (error) throw error;
  } catch (error) {
    throw new Error('いいねの追加に失敗しました');
  }
};

export const removeLike = async (podcastId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('likes')
      .delete()
      .eq('podcast_id', podcastId);
      
    if (error) throw error;
  } catch (error) {
    throw new Error('いいねの削除に失敗しました');
  }
};

export const addSave = async (podcastId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('saves')
      .insert({ podcast_id: podcastId });
      
    if (error) throw error;
  } catch (error) {
    throw new Error('保存の追加に失敗しました');
  }
};

export const removeSave = async (podcastId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('saves')
      .delete()
      .eq('podcast_id', podcastId);
      
    if (error) throw error;
  } catch (error) {
    throw new Error('保存の削除に失敗しました');
  }
};
```

### Phase 5: スタイルの統一化
```typescript
// components/PodcastActions/styles.ts
export const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 16,
    bottom: 120,
    flexDirection: 'column',
    alignItems: 'center',
    gap: 16,
  },
  
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    minWidth: 48,
    position: 'relative',
  },
  
  actionButtonContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  actionCount: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
    minWidth: 32,
  },
  
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 24,
  },
});
```

## 📈 期待される効果

### コード品質向上
- **DRY原則**: 重複コードの削除により40%のコード削減
- **責務分離**: アクション処理、UI表示、状態管理の明確な分離
- **再利用性**: ActionButtonコンポーネントの他での使用可能

### 保守性向上
- **一元化**: メッセージやエラー処理の一元管理
- **テスタビリティ**: 個別コンポーネントのテストが容易
- **拡張性**: 新しいアクションの追加が簡単

### ユーザー体験向上
- **一貫性**: 統一されたアニメーションとフィードバック
- **エラーハンドリング**: 適切なエラーメッセージとリトライ機能
- **パフォーマンス**: 最適化されたアニメーションと状態管理

## 🎯 実装優先度

### High Priority
1. **共通処理の抽象化** - 重複コードの削除
2. **メッセージの外部化** - 国際化対応準備

### Medium Priority
3. **コンポーネント分離** - 保守性向上
4. **API分離** - テスタビリティ向上

### Low Priority
5. **アニメーション最適化** - UX向上

## ⏱️ 見積もり時間
- **Phase 1**: 3時間
- **Phase 2**: 4時間
- **Phase 3**: 2時間
- **Phase 4**: 2時間
- **Phase 5**: 1時間

**総計**: 約12時間

## 🔗 依存関係
- **store/podcastStore.ts**: ポッドキャスト状態管理
- **hooks/useAuth.ts**: 認証フック
- **services/podcastInteractions.ts**: API呼び出し（新規作成）
- **utils/actionMessages.ts**: メッセージ定数（新規作成）
- **components/PodcastActions/**: サブコンポーネント群（新規作成）

## 🚨 注意点
- アニメーションのパフォーマンスに注意が必要
- 楽観的更新の実装時はロールバック処理を考慮
- 国際化を見据えたメッセージ管理の設計