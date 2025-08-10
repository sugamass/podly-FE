# app/(tabs)/profile/index.tsx リファクタリング計画

## 📋 現在の問題点

### 1. 複雑な条件分岐 `getDisplayPodcasts`（15行）
**問題**: switch文の複雑化とデータソースの混在
```typescript
const getDisplayPodcasts = () => {
  switch (activeTab) {
    case 'posts':
      return mockUserPodcasts;  // モックデータ
    case 'liked':
      return likedPodcasts;     // Store データ
    case 'saved':
      return savedPodcasts;     // Store データ  
    default:
      return [];
  }
};
```

### 2. 型安全性の問題（行211）
**問題**: `as any`の使用
```typescript
navigation.navigate('ProfileEdit' as any);
```

### 3. 複雑なレンダリング条件（60行）
**問題**: 長い三項演算子のネスト
```typescript
{displayPodcasts.length > 0 ? (
  <FlatList
    data={displayPodcasts}
    renderItem={({ item }) => (
      // 複雑なrenderItem処理
    )}
    // 長い設定項目...
  />
) : (
  <View style={styles.emptyState}>
    {/* 空の状態の複雑なUI */}
  </View>
)}
```

### 4. コンポーネントサイズ（443行）
**問題**: やや大きめのコンポーネント

### 5. ハードコーディングされたモックデータ
**問題**: 実際のユーザーデータとの不整合

## 🛠️ リファクタリング提案

### Phase 1: データ取得ロジックのカスタムフック化
```typescript
// hooks/useProfileData.ts
export type ProfileTab = 'posts' | 'liked' | 'saved';

export const useProfileData = (userId?: string) => {
  const { likedPodcasts, savedPodcasts } = usePodcastStore();
  const [userPodcasts, setUserPodcasts] = useState<Podcast[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fetchUserPodcasts = useCallback(async (userId: string) => {
    if (!userId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // 実際のAPI呼び出しに置き換える
      const podcasts = await getUserPodcasts(userId);
      setUserPodcasts(podcasts);
    } catch (error) {
      setError('ユーザーのポッドキャストの取得に失敗しました');
      // 暫定的にモックデータを使用
      setUserPodcasts(mockUserPodcasts);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  useEffect(() => {
    if (userId) {
      fetchUserPodcasts(userId);
    }
  }, [userId, fetchUserPodcasts]);
  
  const getDisplayPodcasts = useCallback((activeTab: ProfileTab): Podcast[] => {
    const dataMap: Record<ProfileTab, Podcast[]> = {
      posts: userPodcasts,
      liked: likedPodcasts,
      saved: savedPodcasts,
    };
    
    return dataMap[activeTab] || [];
  }, [userPodcasts, likedPodcasts, savedPodcasts]);
  
  return {
    getDisplayPodcasts,
    isLoading,
    error,
    refreshUserPodcasts: () => userId && fetchUserPodcasts(userId)
  };
};
```

### Phase 2: 型定義の改善
```typescript
// types/profile.ts
export interface ProfileScreenProps {}

export interface ProfileHeaderProps {
  user: User | null;
  onEditProfile: () => void;
  onMenuPress: () => void;
}

export interface ProfileTabsProps {
  activeTab: ProfileTab;
  onTabChange: (tab: ProfileTab) => void;
}

export interface ProfileContentProps {
  podcasts: Podcast[];
  isLoading: boolean;
  error: string | null;
  onRefresh: () => void;
  emptyStateConfig: EmptyStateConfig;
}

export interface EmptyStateConfig {
  icon: string;
  title: string;
  description: string;
  actionButton?: {
    text: string;
    onPress: () => void;
  };
}

// navigation型の修正
declare global {
  namespace ReactNavigation {
    interface RootParamList {
      ProfileEdit: undefined;
    }
  }
}
```

### Phase 3: UIコンポーネントの分離
```typescript
// components/Profile/ProfileHeader.tsx
export const ProfileHeader = ({ user, onEditProfile, onMenuPress }: ProfileHeaderProps) => {
  const defaultAvatarUrl = 'https://via.placeholder.com/120/333/fff?text=User';
  
  return (
    <View style={styles.profileHeader}>
      <View style={styles.avatarSection}>
        <Image
          source={{ uri: user?.avatar_url || defaultAvatarUrl }}
          style={styles.avatar}
        />
        <View style={styles.profileInfo}>
          <Text style={styles.displayName}>
            {user?.display_name || user?.email || 'ユーザー'}
          </Text>
          <Text style={styles.username}>
            @{user?.username || 'user'}
          </Text>
        </View>
      </View>
      
      <View style={styles.profileActions}>
        <Pressable style={styles.editButton} onPress={onEditProfile}>
          <Ionicons name="create-outline" size={16} color={Colors.dark.text} />
          <Text style={styles.editButtonText}>編集</Text>
        </Pressable>
        
        <Pressable style={styles.menuButton} onPress={onMenuPress}>
          <Ionicons name="ellipsis-horizontal" size={20} color={Colors.dark.text} />
        </Pressable>
      </View>
    </View>
  );
};

// components/Profile/ProfileTabs.tsx
export const ProfileTabs = ({ activeTab, onTabChange }: ProfileTabsProps) => {
  const tabs: Array<{ key: ProfileTab; label: string; icon: string }> = [
    { key: 'posts', label: '投稿', icon: 'grid-outline' },
    { key: 'liked', label: 'いいね', icon: 'heart-outline' },
    { key: 'saved', label: '保存済み', icon: 'bookmark-outline' },
  ];
  
  return (
    <View style={styles.tabContainer}>
      {tabs.map((tab) => (
        <Pressable
          key={tab.key}
          style={[
            styles.tab,
            activeTab === tab.key && styles.activeTab
          ]}
          onPress={() => onTabChange(tab.key)}
        >
          <Ionicons
            name={tab.icon}
            size={20}
            color={activeTab === tab.key ? Colors.dark.primary : Colors.dark.subtext}
          />
          <Text
            style={[
              styles.tabLabel,
              activeTab === tab.key && styles.activeTabLabel
            ]}
          >
            {tab.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
};

// components/Profile/ProfileContent.tsx
export const ProfileContent = ({ 
  podcasts, 
  isLoading, 
  error, 
  onRefresh,
  emptyStateConfig 
}: ProfileContentProps) => {
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.dark.primary} />
        <Text style={styles.loadingText}>読み込み中...</Text>
      </View>
    );
  }
  
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={48} color={Colors.dark.error} />
        <Text style={styles.errorTitle}>エラーが発生しました</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <Pressable style={styles.retryButton} onPress={onRefresh}>
          <Text style={styles.retryButtonText}>再試行</Text>
        </Pressable>
      </View>
    );
  }
  
  if (podcasts.length === 0) {
    return (
      <EmptyState
        icon={emptyStateConfig.icon}
        title={emptyStateConfig.title}
        description={emptyStateConfig.description}
        actionButton={emptyStateConfig.actionButton}
      />
    );
  }
  
  return (
    <FlatList
      data={podcasts}
      renderItem={({ item }) => <PodcastGridItem podcast={item} />}
      keyExtractor={(item) => item.id}
      numColumns={2}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.gridContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={onRefresh}
          tintColor={Colors.dark.primary}
        />
      }
    />
  );
};

// components/Profile/EmptyState.tsx
export const EmptyState = ({ 
  icon, 
  title, 
  description, 
  actionButton 
}: EmptyStateConfig) => (
  <View style={styles.emptyState}>
    <Ionicons name={icon} size={64} color={Colors.dark.subtext} />
    <Text style={styles.emptyStateTitle}>{title}</Text>
    <Text style={styles.emptyStateDescription}>{description}</Text>
    {actionButton && (
      <Pressable style={styles.emptyStateButton} onPress={actionButton.onPress}>
        <Text style={styles.emptyStateButtonText}>{actionButton.text}</Text>
      </Pressable>
    )}
  </View>
);
```

### Phase 4: メインコンポーネントの簡素化
```typescript
// app/(tabs)/profile/index.tsx（リファクタリング後）
export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { getDisplayPodcasts, isLoading, error, refreshUserPodcasts } = useProfileData(user?.id);
  const navigation = useNavigation<NavigationProp<RootParamList>>();
  
  const [activeTab, setActiveTab] = useState<ProfileTab>('posts');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  const displayPodcasts = getDisplayPodcasts(activeTab);
  
  const handleEditProfile = () => {
    navigation.navigate('ProfileEdit');
  };
  
  const getEmptyStateConfig = (tab: ProfileTab): EmptyStateConfig => {
    const configs: Record<ProfileTab, EmptyStateConfig> = {
      posts: {
        icon: 'mic-outline',
        title: 'まだポッドキャストがありません',
        description: '最初のポッドキャストを作成してみましょう',
        actionButton: {
          text: 'ポッドキャストを作成',
          onPress: () => navigation.navigate('Create')
        }
      },
      liked: {
        icon: 'heart-outline',
        title: 'いいねしたポッドキャストがありません',
        description: 'お気に入りのポッドキャストにいいねしてみましょう'
      },
      saved: {
        icon: 'bookmark-outline',
        title: '保存したポッドキャストがありません',  
        description: '後で聞きたいポッドキャストを保存してみましょう'
      }
    };
    
    return configs[tab];
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <ProfileHeader
        user={user}
        onEditProfile={handleEditProfile}
        onMenuPress={() => setShowProfileMenu(true)}
      />
      
      <ProfileTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      
      <ProfileContent
        podcasts={displayPodcasts}
        isLoading={isLoading}
        error={error}
        onRefresh={refreshUserPodcasts}
        emptyStateConfig={getEmptyStateConfig(activeTab)}
      />
      
      <ProfileMenuModal
        visible={showProfileMenu}
        onClose={() => setShowProfileMenu(false)}
        onSignOut={signOut}
      />
    </SafeAreaView>
  );
}
```

### Phase 5: API連携の改善
```typescript
// services/userApi.ts
export const getUserPodcasts = async (userId: string): Promise<Podcast[]> => {
  try {
    const { data, error } = await supabase
      .from('podcasts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Failed to fetch user podcasts:', error);
    throw new Error('ユーザーのポッドキャスト取得に失敗しました');
  }
};
```

## 📈 期待される効果

### 保守性向上
- **責務分離**: データ取得、UI表示、状態管理が明確に分離
- **再利用性**: ProfileHeaderやProfileTabsの他画面での使用可能
- **テスタビリティ**: 各コンポーネントの独立したテスト

### 開発体験向上
- **型安全性**: 完全な型付けによるコンパイル時エラー検出
- **コード可読性**: 短くて理解しやすいコンポーネント
- **拡張性**: 新しいタブや機能の追加が容易

### ユーザー体験向上
- **エラーハンドリング**: 適切なエラー表示と再試行機能
- **空状態**: 分かりやすいガイダンス
- **リフレッシュ**: プルリフレッシュでデータ更新

## 🎯 実装優先度

### High Priority
1. **型安全性の改善** - `as any`の削除
2. **データ取得ロジックの分離** - API連携の準備

### Medium Priority  
3. **UIコンポーネント分離** - 保守性向上
4. **エラーハンドリング統一** - ユーザー体験改善

### Low Priority
5. **空状態の改善** - UX向上

## ⏱️ 見積もり時間
- **Phase 1**: 3時間
- **Phase 2**: 1時間
- **Phase 3**: 4時間
- **Phase 4**: 2時間
- **Phase 5**: 1時間

**総計**: 約11時間

## 🔗 依存関係
- **hooks/useAuth.ts**: 認証フック
- **store/podcastStore.ts**: ポッドキャスト状態管理
- **services/userApi.ts**: ユーザーAPI（新規作成）
- **components/Profile/**: 新規作成するコンポーネント群
- **types/profile.ts**: 型定義（新規作成）

## 🚨 注意点
- モックデータから実際のAPIへの移行時は段階的に実装
- ユーザーのプライバシー設定に応じた表示制御が必要
- 画像のキャッシュとローディング状態の適切な管理