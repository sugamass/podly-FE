# components/PodcastInfo.tsx リファクタリング計画

## 📋 現在の問題点

### 1. 複雑な条件分岐
**問題**: タイトルとクリエーター表示ロジックが複雑

### 2. スタイルの重複
**問題**: テキストスタイルが複数箇所で定義

### 3. アクセシビリティの不足
**問題**: スクリーンリーダー対応不足

## 🛠️ リファクタリング提案

### Phase 1: プロップス型の明確化
```typescript
// types/podcastInfo.ts
export interface PodcastInfoProps {
  podcast: Podcast;
  showCreator?: boolean;
  maxLines?: number;
  style?: ViewStyle;
}
```

### Phase 2: テキスト処理の分離
```typescript
// utils/textUtils.ts
export const formatPodcastTitle = (title: string, maxLength?: number): string => {
  if (!maxLength || title.length <= maxLength) return title;
  return title.substring(0, maxLength) + '...';
};

export const formatCreatorName = (creator?: string): string => {
  return creator || 'Unknown Creator';
};
```

### Phase 3: アクセシビリティ改善
```typescript
// components/PodcastInfo.tsx（リファクタリング後）
export const PodcastInfo = memo(({ 
  podcast, 
  showCreator = true, 
  maxLines = 2,
  style 
}: PodcastInfoProps) => {
  const formattedTitle = formatPodcastTitle(podcast.title);
  const formattedCreator = formatCreatorName(podcast.creator);
  
  return (
    <View style={[styles.container, style]}>
      <Text 
        style={styles.title}
        numberOfLines={maxLines}
        accessible={true}
        accessibilityRole="header"
        accessibilityLabel={`タイトル: ${formattedTitle}`}
      >
        {formattedTitle}
      </Text>
      
      {showCreator && (
        <Text 
          style={styles.creator}
          numberOfLines={1}
          accessible={true}
          accessibilityLabel={`クリエーター: ${formattedCreator}`}
        >
          {formattedCreator}
        </Text>
      )}
    </View>
  );
});
```

## 📈 期待される効果

### アクセシビリティ向上
- **スクリーンリーダー対応**: 適切なアクセシビリティラベル
- **構造化**: セマンティックなロール定義

### 再利用性向上
- **プロップス**: 柔軟な設定オプション
- **スタイル**: カスタマイズ可能なスタイリング

## ⏱️ 見積もり時間
**総計**: 約2時間