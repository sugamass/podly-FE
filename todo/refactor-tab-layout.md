# app/(tabs)/_layout.tsx リファクタリング計画

## 📋 現在の問題点

### 1. コメントアウトされたコード（行49-60）
**問題**: 不要なコードが残存している
```typescript
// 削除対象のコメントアウトコード
// {
//   name: 'create',
//   title: '作成',
//   tabBarIcon: ({ color, focused }) => (
//     <TabBarIcon name={focused ? 'add-circle' : 'add-circle-outline'} color={color} />
//   ),
// },
```

### 2. ハードコーディングされた値
**問題**: アイコンサイズやスタイル値が直接指定されている
```typescript
// 問題箇所
<Ionicons name={name} size={24} color={color} />
<Ionicons name={name} size={28} color={color} />
```

### 3. 型定義の不足
**問題**: TabBarIconのpropsの型が明確でない

### 4. スタイルの統一性不足
**問題**: タブバーのスタイリングがハードコーディング

## 🛠️ リファクタリング提案

### Phase 1: 不要コードの削除
```typescript
// Before: コメントアウトされたコード
// {
//   name: 'create',
//   title: '作成',
//   tabBarIcon: ({ color, focused }) => (
//     <TabBarIcon name={focused ? 'add-circle' : 'add-circle-outline'} color={color} />
//   ),
// },

// After: 完全に削除
```

### Phase 2: 定数の外部化
```typescript
// constants/TabBarConfig.ts
export const TAB_BAR_CONFIG = {
  ICON_SIZE: {
    DEFAULT: 24,
    FOCUSED: 28,
  },
  STYLES: {
    tabBarActiveTintColor: Colors.dark.primary,
    tabBarInactiveTintColor: Colors.dark.subtext,
    tabBarStyle: {
      backgroundColor: Colors.dark.card,
      borderTopColor: 'transparent',
      height: 80,
    },
    tabBarLabelStyle: {
      fontSize: 12,
      fontWeight: '600' as const,
      marginTop: 4,
    },
  },
} as const;

export const TAB_ICONS = {
  index: {
    focused: 'home' as const,
    unfocused: 'home-outline' as const,
  },
  discover: {
    focused: 'search' as const,
    unfocused: 'search-outline' as const,
  },
  'create/index': {
    focused: 'add-circle' as const,
    unfocused: 'add-circle-outline' as const,
  },
  'profile/index': {
    focused: 'person' as const,
    unfocused: 'person-outline' as const,
  },
} as const;
```

### Phase 3: 型定義の追加
```typescript
// types/navigation.ts
export interface TabBarIconProps {
  focused: boolean;
  color: string;
  size?: number;
}

export type TabName = keyof typeof TAB_ICONS;

export interface TabConfig {
  name: string;
  title: string;
  tabBarIcon: (props: TabBarIconProps) => React.ReactElement;
}
```

### Phase 4: コンポーネントの改善
```typescript
// components/TabBarIcon.tsx
interface TabBarIconProps {
  name: keyof typeof Ionicons.glyphMap;
  color: string;
  focused?: boolean;
  size?: number;
}

export const TabBarIcon = ({ 
  name, 
  color, 
  focused = false, 
  size 
}: TabBarIconProps) => {
  const iconSize = size ?? (focused ? TAB_BAR_CONFIG.ICON_SIZE.FOCUSED : TAB_BAR_CONFIG.ICON_SIZE.DEFAULT);
  
  return (
    <Ionicons 
      name={name} 
      size={iconSize} 
      color={color}
      style={focused && styles.focusedIcon} 
    />
  );
};

const styles = StyleSheet.create({
  focusedIcon: {
    shadowColor: Colors.dark.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});
```

### Phase 5: メインレイアウトの簡素化
```typescript
// app/(tabs)/_layout.tsx（リファクタリング後）
import { Tabs } from 'expo-router';
import { TabBarIcon } from '@/components/TabBarIcon';
import { TAB_BAR_CONFIG, TAB_ICONS } from '@/constants/TabBarConfig';
import { Colors } from '@/constants/Colors';

const createTabBarIcon = (tabName: keyof typeof TAB_ICONS) => 
  ({ color, focused }: { color: string; focused: boolean }) => (
    <TabBarIcon
      name={focused ? TAB_ICONS[tabName].focused : TAB_ICONS[tabName].unfocused}
      color={color}
      focused={focused}
    />
  );

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        ...TAB_BAR_CONFIG.STYLES,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'ホーム',
          tabBarIcon: createTabBarIcon('index'),
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: '発見',
          tabBarIcon: createTabBarIcon('discover'),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: '作成',
          tabBarIcon: createTabBarIcon('create/index'),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'プロフィール',
          tabBarIcon: createTabBarIcon('profile/index'),
        }}
      />
    </Tabs>
  );
}
```

### Phase 6: アクセシビリティの改善
```typescript
// components/TabBarIcon.tsx（アクセシビリティ対応）
export const TabBarIcon = ({ 
  name, 
  color, 
  focused = false, 
  size 
}: TabBarIconProps) => {
  const iconSize = size ?? (focused ? TAB_BAR_CONFIG.ICON_SIZE.FOCUSED : TAB_BAR_CONFIG.ICON_SIZE.DEFAULT);
  
  return (
    <Ionicons 
      name={name} 
      size={iconSize} 
      color={color}
      style={focused && styles.focusedIcon}
      accessible={true}
      accessibilityRole="imagebutton"
      accessibilityState={{ selected: focused }}
    />
  );
};
```

## 📈 期待される効果

### 保守性向上
- **設定の一元管理**: タブバーの設定変更が容易
- **型安全性**: TypeScriptによる型チェック
- **再利用性**: TabBarIconコンポーネントの他での使用可能

### 開発体験向上
- **コード整理**: 不要なコードの除去
- **一貫性**: 統一されたスタイリングパターン
- **拡張性**: 新しいタブの追加が容易

### アクセシビリティ向上
- **スクリーンリーダー対応**: 適切なaccessibility属性
- **フォーカス状態**: 視覚的なフィードバック改善

## 🎯 実装優先度

### High Priority
1. **不要コードの削除** - コードの整理、即座に実装可能
2. **定数の外部化** - 保守性向上、設定変更の容易化

### Medium Priority
3. **型定義の追加** - 型安全性向上
4. **コンポーネント改善** - 再利用性向上

### Low Priority
5. **アクセシビリティ改善** - ユーザビリティ向上
6. **視覚効果追加** - UI/UX向上

## ⏱️ 見積もり時間
- **Phase 1**: 10分
- **Phase 2**: 30分
- **Phase 3**: 20分
- **Phase 4**: 45分
- **Phase 5**: 30分
- **Phase 6**: 15分

**総計**: 約2.5時間

## 🔗 依存関係
- **constants/Colors.ts**: カラー設定
- **components/TabBarIcon.tsx**: 新規作成するコンポーネント
- **constants/TabBarConfig.ts**: 新規作成する設定ファイル

## 🚨 注意点
- Expo Routerのバージョンアップ時にscreen名の変更が必要な場合がある
- タブの順序変更時は、TAB_ICONSの定義も合わせて更新が必要
- 4の倍数ルールに従い、すべてのサイズ・余白は4の倍数で設定