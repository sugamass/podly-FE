# components/ProfileMenuModal.tsx リファクタリング計画

## 📋 現在の問題点

### 1. ハードコーディングされたメニュー項目
**問題**: メニュー構造が直接コードに埋め込まれている

### 2. アクション処理の散在
**問題**: サインアウト、設定、ヘルプ処理が散在

### 3. アクセシビリティの不足
**問題**: スクリーンリーダー対応不足

## 🛠️ リファクタリング提案

### Phase 1: メニュー設定の外部化
```typescript
// constants/ProfileMenuConfig.ts
export interface MenuAction {
  id: string;
  label: string;
  icon: string;
  type: 'navigation' | 'action' | 'danger';
  onPress: () => void | Promise<void>;
}

export const createProfileMenuItems = (actions: {
  onEditProfile: () => void;
  onSettings: () => void;
  onHelp: () => void;
  onSignOut: () => void;
}): MenuAction[] => [
  {
    id: 'edit-profile',
    label: 'プロフィール編集',
    icon: 'create-outline',
    type: 'navigation',
    onPress: actions.onEditProfile
  },
  {
    id: 'settings',
    label: '設定',
    icon: 'settings-outline',
    type: 'navigation',
    onPress: actions.onSettings
  },
  {
    id: 'help',
    label: 'ヘルプ',
    icon: 'help-circle-outline',
    type: 'navigation',
    onPress: actions.onHelp
  },
  {
    id: 'sign-out',
    label: 'サインアウト',
    icon: 'log-out-outline',
    type: 'danger',
    onPress: actions.onSignOut
  }
];
```

### Phase 2: メニューアイテムコンポーネントの作成
```typescript
// components/ProfileMenuModal/MenuItem.tsx
export const MenuItem = memo(({ item }: { item: MenuAction }) => {
  const getItemStyle = (type: MenuAction['type']) => {
    switch (type) {
      case 'danger':
        return [styles.menuItem, styles.dangerItem];
      default:
        return styles.menuItem;
    }
  };
  
  const getTextStyle = (type: MenuAction['type']) => {
    switch (type) {
      case 'danger':
        return [styles.menuItemText, styles.dangerText];
      default:
        return styles.menuItemText;
    }
  };
  
  return (
    <Pressable
      style={getItemStyle(item.type)}
      onPress={item.onPress}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={item.label}
    >
      <Ionicons 
        name={item.icon} 
        size={20} 
        color={item.type === 'danger' ? Colors.dark.error : Colors.dark.text} 
      />
      <Text style={getTextStyle(item.type)}>
        {item.label}
      </Text>
    </Pressable>
  );
});
```

### Phase 3: メインコンポーネントの簡素化
```typescript
// components/ProfileMenuModal.tsx（リファクタリング後）
export const ProfileMenuModal = ({ visible, onClose, onSignOut }: Props) => {
  const navigation = useNavigation();
  
  const menuItems = useMemo(() => createProfileMenuItems({
    onEditProfile: () => {
      onClose();
      navigation.navigate('ProfileEdit' as never);
    },
    onSettings: () => {
      onClose();
      navigation.navigate('Settings' as never);
    },
    onHelp: () => {
      onClose();
      navigation.navigate('Help' as never);
    },
    onSignOut: async () => {
      try {
        await onSignOut();
        onClose();
      } catch (error) {
        Alert.alert('エラー', 'サインアウトに失敗しました');
      }
    }
  }), [onClose, onSignOut, navigation]);
  
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>メニュー</Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={Colors.dark.text} />
            </Pressable>
          </View>
          
          <View style={styles.menuContainer}>
            {menuItems.map((item) => (
              <MenuItem key={item.id} item={item} />
            ))}
          </View>
        </View>
      </Pressable>
    </Modal>
  );
};
```

## 📈 期待される効果

### 保守性向上
- **設定の一元管理**: メニュー項目の変更が容易
- **再利用性**: MenuItemコンポーネントの他での使用可能

### アクセシビリティ向上
- **スクリーンリーダー対応**: 適切なアクセシビリティラベル
- **ロール定義**: ボタンロールの適切な設定

## ⏱️ 見積もり時間
**総計**: 約3時間