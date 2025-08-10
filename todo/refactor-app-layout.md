# app/\_layout.tsx リファクタリング計画

## 📋 現在の問題点

### 1. 重複した useEffect（行 69-73, 76-80）

**問題**: 認証モーダル表示ロジックが重複している

```typescript
// 重複1
useEffect(() => {
  if (isAuthModalVisible) {
    setShowAuthModal(true);
  }
}, [isAuthModalVisible]);

// 重複2
useEffect(() => {
  if (user && showAuthModal) {
    setShowAuthModal(false);
  }
}, [user, showAuthModal]);
```

### 2. 長すぎるコンポーネント関数（152 行）

**問題**: 複数の責務が混在している

- 認証状態管理
- Track Player 初期化
- アプリ状態変更処理
- UI 表示制御

### 3. 重複したスタイリング

**問題**: `backgroundColor: Colors.dark.background`が複数箇所で使用されている

### 4. 型安全性の問題

**問題**: `handleAppStateChange`の`nextAppState`が string 型だが、具体的な型定義がない

## 🛠️ リファクタリング提案

### Phase 1: useEffect の統合

```typescript
// Before: 重複したuseEffect
useEffect(() => {
  if (isAuthModalVisible) {
    setShowAuthModal(true);
  }
}, [isAuthModalVisible]);

useEffect(() => {
  if (user && showAuthModal) {
    setShowAuthModal(false);
  }
}, [user, showAuthModal]);

// After: 統合されたuseEffect
useEffect(() => {
  if (isAuthModalVisible && !user) {
    setShowAuthModal(true);
  } else if (user && showAuthModal) {
    setShowAuthModal(false);
  }
}, [isAuthModalVisible, user, showAuthModal]);
```

### Phase 2: カスタムフックの抽出

```typescript
// hooks/useAppInitialization.ts
export const useAppInitialization = () => {
  useEffect(() => {
    const initializeApp = async () => {
      await TrackPlayerService.setupPlayer();
    };
    initializeApp();
  }, []);

  return { isReady: true };
};

// hooks/useAppStateHandler.ts
export const useAppStateHandler = () => {
  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );
    return () => subscription?.remove();
  }, []);
};

// hooks/useAuthModal.ts
export const useAuthModal = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { isAuthModalVisible } = useAuthStore();
  const { user } = useAuth();

  useEffect(() => {
    if (isAuthModalVisible && !user) {
      setShowAuthModal(true);
    } else if (user && showAuthModal) {
      setShowAuthModal(false);
    }
  }, [isAuthModalVisible, user, showAuthModal]);

  return { showAuthModal, setShowAuthModal };
};
```

### Phase 3: コンポーネント分離

```typescript
// components/AppLoadingScreen.tsx
const AppLoadingScreen = () => (
  <View style={[styles.container, { backgroundColor: Colors.dark.background }]}>
    <ActivityIndicator size="large" color={Colors.dark.primary} />
  </View>
);

// components/AuthModalContainer.tsx
const AuthModalContainer = ({ visible, onClose }: Props) => (
  <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
    <AuthModal onClose={onClose} />
  </Modal>
);

// app/_layout.tsx（リファクタリング後）
export default function RootLayout() {
  const { showAuthModal, setShowAuthModal } = useAuthModal();
  const { isReady } = useAppInitialization();

  useAppStateHandler();

  if (!isReady) {
    return <AppLoadingScreen />;
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: "modal" }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <AuthModalContainer
        visible={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </ThemeProvider>
  );
}
```

### Phase 4: 型安全性の向上

```typescript
// types/app.ts
export type AppState = "active" | "background" | "inactive";

// app/_layout.tsx
const handleAppStateChange = (nextAppState: AppState) => {
  if (nextAppState === "active") {
    console.log("App has come to the foreground!");
  }
};
```

### Phase 5: スタイル統合

```typescript
// constants/AppStyles.ts
export const AppStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.dark.background,
  },
});
```

## 📈 期待される効果

### パフォーマンス向上

- **useEffect の最適化**: 不要な再実行の削減
- **コンポーネント分離**: 部分的な再レンダリングの実現

### 保守性向上

- **責務の明確化**: 各フックが特定の責務を持つ
- **テスタビリティ**: 個別のフック・コンポーネントのテストが可能

### 型安全性向上

- **型定義の明確化**: AppState の具体的な型定義
- **エラーの早期発見**: コンパイル時のエラー検出

## 🎯 実装優先度

### High Priority

1. **useEffect の統合** - すぐに実装可能で効果大
2. **型安全性の向上** - バグ防止の観点で重要

### Medium Priority

3. **カスタムフックの抽出** - 保守性向上のため
4. **コンポーネント分離** - テスト容易性のため

### Low Priority

5. **スタイル統合** - 一貫性向上のため

## 🔗 依存関係

- **hooks/useAuth.ts**: 認証関連フックが必要
- **services/TrackPlayerService.ts**: Player 初期化処理
- **store/authStore.ts**: 認証状態管理
