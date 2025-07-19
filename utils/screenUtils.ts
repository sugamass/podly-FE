import { Dimensions, Platform } from 'react-native';
import { EdgeInsets } from 'react-native-safe-area-context';

export interface ScreenDimensions {
  width: number;
  height: number;
  availableHeight: number;
}

// タブバーの標準的な高さを取得
const getTabBarHeight = (safeAreaInsets?: EdgeInsets): number => {
  if (Platform.OS === 'ios') {
    // iOSの場合、SafeAreaのbottomに基づいてタブバー高さを判定
    if (safeAreaInsets?.bottom && safeAreaInsets.bottom > 0) {
      // Face ID対応端末（iPhone X以降）
      return 83; // 49 (タブバー) + 34 (ホームインジケーター)
    } else {
      // 従来のiPhone（ホームボタン付き）
      return 49; // タブバーのみ
    }
  } else if (Platform.OS === 'android') {
    // Androidの場合
    return 56; // Material Design標準
  }
  return 49; // フォールバック
};

export const getScreenDimensions = (safeAreaInsets?: EdgeInsets, customTabBarHeight?: number): ScreenDimensions => {
  const { width, height } = Dimensions.get('window');
  
  let availableHeight = height;
  
  if (safeAreaInsets) {
    // タブバーの実際の高さを取得
    const tabBarHeight = customTabBarHeight ?? getTabBarHeight(safeAreaInsets);
    
    // SafeAreaのtopとタブバーの高さを減算
    availableHeight = height - safeAreaInsets.top - tabBarHeight;
  }
  
  return {
    width,
    height,
    availableHeight,
  };
};

export const getItemHeight = (safeAreaInsets?: EdgeInsets, customTabBarHeight?: number): number => {
  const { availableHeight } = getScreenDimensions(safeAreaInsets, customTabBarHeight);
  return availableHeight;
};