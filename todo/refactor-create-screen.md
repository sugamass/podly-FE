# app/(tabs)/create/index.tsx リファクタリング計画

## 📋 現在の問題点

### 1. 巨大な関数 `handleGenerateScript`（90行）
**問題**: 複数の責務が混在している
```typescript
const handleGenerateScript = async () => {
  // 90行にわたる処理
  // - バリデーション
  // - API呼び出し
  // - エラーハンドリング  
  // - 状態更新
  // - ナビゲーション
};
```

### 2. 複雑なバリデーションロジック（25行）
**問題**: ネストした条件分岐とエラーハンドリングが散在
```typescript
if (!requestData.theme || requestData.theme.length < 10) {
  Alert.alert('入力エラー', 'テーマは10文字以上入力してください。');
  return;
}

if (!requestData.duration || requestData.duration < 30) {
  Alert.alert('入力エラー', '時間は30秒以上を選択してください。');
  return;
}
// さらに続く...
```

### 3. 巨大なJSXレンダリング（625行）
**問題**: 単一コンポーネントに全てのUIロジックが混在

### 4. 重複したスタイリング
**問題**: カードスタイル、ボタンスタイルが重複している

### 5. 型安全性の問題
```typescript
router.push({
  pathname: '/create-audio' as any,
  params: {
    scriptData: JSON.stringify(generatedScript)  // JSON.stringify使用
  }
});
```

## 🛠️ リファクタリング提案

### Phase 1: バリデーション関数の分離
```typescript
// utils/createFormValidation.ts
export interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
}

export const validateCreateForm = (data: {
  theme: string;
  duration: number;
  language: string;
  tone: string;
}): ValidationResult => {
  if (!data.theme || data.theme.length < 10) {
    return {
      isValid: false,
      errorMessage: 'テーマは10文字以上入力してください。'
    };
  }
  
  if (!data.duration || data.duration < 30) {
    return {
      isValid: false,
      errorMessage: '時間は30秒以上を選択してください。'
    };
  }
  
  if (!data.language) {
    return {
      isValid: false,
      errorMessage: '言語を選択してください。'
    };
  }
  
  if (!data.tone) {
    return {
      isValid: false,
      errorMessage: 'トーンを選択してください。'
    };
  }
  
  return { isValid: true };
};

// constants/ValidationMessages.ts
export const VALIDATION_MESSAGES = {
  THEME_TOO_SHORT: 'テーマは10文字以上入力してください。',
  DURATION_TOO_SHORT: '時間は30秒以上を選択してください。',
  LANGUAGE_REQUIRED: '言語を選択してください。',
  TONE_REQUIRED: 'トーンを選択してください。',
  SCRIPT_GENERATION_FAILED: '原稿の生成に失敗しました。もう一度お試しください。',
  NETWORK_ERROR: 'ネットワークエラーが発生しました。接続を確認してください。'
} as const;
```

### Phase 2: カスタムフックの抽出
```typescript
// hooks/useScriptGeneration.ts
export const useScriptGeneration = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const generateScript = async (requestData: PostCreateScriptRequest) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await createScript(requestData);
      
      if (!response.success || !response.data) {
        throw new Error(response.error || VALIDATION_MESSAGES.SCRIPT_GENERATION_FAILED);
      }
      
      return response.data;
    } catch (error: any) {
      const errorMessage = error?.message?.includes('Network') 
        ? VALIDATION_MESSAGES.NETWORK_ERROR
        : VALIDATION_MESSAGES.SCRIPT_GENERATION_FAILED;
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    generateScript,
    isLoading,
    error,
    clearError: () => setError(null)
  };
};

// hooks/useCreateForm.ts
export const useCreateForm = () => {
  const [formData, setFormData] = useState({
    theme: '',
    duration: 0,
    language: '',
    tone: ''
  });
  
  const updateField = useCallback((field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);
  
  const resetForm = useCallback(() => {
    setFormData({
      theme: '',
      duration: 0,
      language: '',
      tone: ''
    });
  }, []);
  
  const validateForm = useCallback(() => {
    return validateCreateForm(formData);
  }, [formData]);
  
  return {
    formData,
    updateField,
    resetForm,
    validateForm
  };
};
```

### Phase 3: UIコンポーネントの細分化
```typescript
// components/CreateScreen/ThemeInputSection.tsx
interface ThemeInputSectionProps {
  value: string;
  onChangeText: (text: string) => void;
}

export const ThemeInputSection = ({ value, onChangeText }: ThemeInputSectionProps) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>テーマ</Text>
    <Text style={styles.sectionDescription}>
      どのようなトピックについてのポッドキャストを作成しますか？
    </Text>
    <TextInput
      style={styles.textInput}
      value={value}
      onChangeText={onChangeText}
      placeholder="例: 最新のAI技術について"
      placeholderTextColor={Colors.dark.subtext}
      multiline
      textAlignVertical="top"
    />
  </View>
);

// components/CreateScreen/DurationSelector.tsx
interface DurationSelectorProps {
  selectedDuration: number;
  onSelect: (duration: number) => void;
}

export const DurationSelector = ({ selectedDuration, onSelect }: DurationSelectorProps) => {
  const durations = [30, 60, 120, 300, 600];
  
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>時間</Text>
      <View style={styles.durationContainer}>
        {durations.map((duration) => (
          <Pressable
            key={duration}
            style={[
              styles.durationOption,
              selectedDuration === duration && styles.selectedDurationOption
            ]}
            onPress={() => onSelect(duration)}
          >
            <Text style={[
              styles.durationText,
              selectedDuration === duration && styles.selectedDurationText
            ]}>
              {duration < 60 ? `${duration}秒` : `${Math.floor(duration / 60)}分`}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
};

// components/CreateScreen/LanguageSelector.tsx
interface LanguageSelectorProps {
  selectedLanguage: string;
  onSelect: (language: string) => void;
}

export const LanguageSelector = ({ selectedLanguage, onSelect }: LanguageSelectorProps) => {
  const languages = ['日本語', 'English'];
  
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>言語</Text>
      <View style={styles.optionContainer}>
        {languages.map((language) => (
          <Pressable
            key={language}
            style={[
              styles.option,
              selectedLanguage === language && styles.selectedOption
            ]}
            onPress={() => onSelect(language)}
          >
            <Text style={[
              styles.optionText,
              selectedLanguage === language && styles.selectedOptionText
            ]}>
              {language}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
};

// components/CreateScreen/ToneSelector.tsx
interface ToneSelectorProps {
  selectedTone: string;
  onSelect: (tone: string) => void;
}

export const ToneSelector = ({ selectedTone, onSelect }: ToneSelectorProps) => {
  const tones = ['フォーマル', 'カジュアル', 'フレンドリー', '教育的'];
  
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>トーン</Text>
      <View style={styles.optionContainer}>
        {tones.map((tone) => (
          <Pressable
            key={tone}
            style={[
              styles.option,
              selectedTone === tone && styles.selectedOption
            ]}
            onPress={() => onSelect(tone)}
          >
            <Text style={[
              styles.optionText,
              selectedTone === tone && styles.selectedOptionText
            ]}>
              {tone}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
};
```

### Phase 4: メインコンポーネントの簡素化
```typescript
// app/(tabs)/create/index.tsx（リファクタリング後）
export default function CreateScreen() {
  const { formData, updateField, validateForm } = useCreateForm();
  const { generateScript, isLoading, error } = useScriptGeneration();
  const router = useRouter();
  
  const handleGenerateScript = async () => {
    const validation = validateForm();
    if (!validation.isValid) {
      Alert.alert('入力エラー', validation.errorMessage);
      return;
    }
    
    try {
      const generatedScript = await generateScript({
        theme: formData.theme,
        duration: formData.duration,
        language: formData.language,
        tone: formData.tone
      });
      
      router.push({
        pathname: '/create/audio',
        params: {
          scriptData: JSON.stringify(generatedScript)
        }
      });
    } catch (error) {
      // エラーは useScriptGeneration で処理済み
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>新しいポッドキャストを作成</Text>
        <Text style={styles.subtitle}>
          AI がアイデアから高品質なポッドキャストを生成します
        </Text>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <ThemeInputSection 
          value={formData.theme}
          onChangeText={(text) => updateField('theme', text)}
        />
        
        <DurationSelector
          selectedDuration={formData.duration}
          onSelect={(duration) => updateField('duration', duration)}
        />
        
        <LanguageSelector
          selectedLanguage={formData.language}
          onSelect={(language) => updateField('language', language)}
        />
        
        <ToneSelector
          selectedTone={formData.tone}
          onSelect={(tone) => updateField('tone', tone)}
        />
      </ScrollView>
      
      <View style={styles.footer}>
        <CreateButton
          onPress={handleGenerateScript}
          isLoading={isLoading}
          disabled={isLoading}
        />
      </View>
    </SafeAreaView>
  );
}
```

### Phase 5: 型安全性の向上
```typescript
// types/createScreen.ts
export interface CreateFormData {
  theme: string;
  duration: number;
  language: string;
  tone: string;
}

export interface ScriptData {
  title: string;
  content: string;
  duration: number;
  language: string;
  tone: string;
}

// ルーティングパラメーターの型定義
declare global {
  namespace Expo {
    interface CustomRootParamList {
      'create/audio': {
        scriptData: string; // JSON文字列として渡す
      };
    }
  }
}

// 型安全なナビゲーション
const navigateToAudioCreation = (scriptData: ScriptData) => {
  router.push({
    pathname: '/create/audio',
    params: {
      scriptData: JSON.stringify(scriptData)
    }
  });
};
```

## 📈 期待される効果

### 保守性向上
- **責務分離**: 各コンポーネントが単一の責務を持つ
- **再利用性**: UIコンポーネントの他画面での使用可能
- **テスタビリティ**: 個別コンポーネントのテストが容易

### 開発体験向上
- **コード可読性**: 短くて理解しやすいコンポーネント
- **デバッグ効率**: エラーの発生箇所の特定が容易
- **拡張性**: 新しいフィールドの追加が簡単

### ユーザー体験向上
- **エラーハンドリング**: 統一されたエラーメッセージ
- **フォーム体験**: 段階的なバリデーション
- **ローディング状態**: 適切なフィードバック

## 🎯 実装優先度

### High Priority
1. **バリデーション関数の分離** - エラー処理の改善
2. **カスタムフック抽出** - ロジックの整理

### Medium Priority
3. **UIコンポーネント細分化** - 保守性向上
4. **型安全性向上** - バグ防止

### Low Priority
5. **スタイル統一** - 一貫性向上

## ⏱️ 見積もり時間
- **Phase 1**: 2時間
- **Phase 2**: 3時間
- **Phase 3**: 5時間
- **Phase 4**: 2時間
- **Phase 5**: 1時間

**総計**: 約13時間

## 🔗 依存関係
- **services/scriptGenerator.ts**: API呼び出し
- **utils/createFormValidation.ts**: 新規作成
- **components/CreateScreen/**: 新規作成するコンポーネント群
- **hooks/**: カスタムフック群（新規作成）