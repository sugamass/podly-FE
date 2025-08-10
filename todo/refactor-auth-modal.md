# components/AuthModal.tsx リファクタリング計画

## 📋 現在の問題点

### 1. 巨大なコンポーネント（450行超）
**問題**: 複数の責務が混在
- フォーム状態管理
- バリデーション処理
- API呼び出し
- UI表示制御

### 2. 複雑なバリデーション（93-154行）
**問題**: 長い条件分岐とエラー処理
```typescript
const validateForm = (): string | null => {
  if (!email || !email.includes('@')) {
    return 'メールアドレスを正しく入力してください。';
  }
  // 長いバリデーション処理...
};
```

### 3. ハードコーディングされたエラーメッセージ（177-214行）
**問題**: メッセージが直接コードに埋め込まれている

### 4. 重複したフォーム処理
**問題**: サインアップとサインインで類似処理

## 🛠️ リファクタリング提案

### Phase 1: フォーム処理の分離
```typescript
// hooks/useAuthForm.ts
export const useAuthForm = (isSignUp: boolean) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  
  const updateField = useCallback((field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // フィールド更新時にエラーをクリア
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors]);
  
  const validate = useCallback((): ValidationResult => {
    return validateAuthForm(formData, isSignUp);
  }, [formData, isSignUp]);
  
  return {
    formData,
    errors,
    isLoading,
    updateField,
    validate,
    setIsLoading,
    setErrors
  };
};
```

### Phase 2: バリデーション規則の外部化
```typescript
// utils/authValidation.ts
export const VALIDATION_RULES = {
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'メールアドレスを正しく入力してください。'
  },
  password: {
    minLength: 6,
    message: 'パスワードは6文字以上入力してください。'
  },
  username: {
    minLength: 3,
    pattern: /^[a-zA-Z0-9_]+$/,
    message: 'ユーザー名は3文字以上の英数字で入力してください。'
  }
} as const;

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export const validateAuthForm = (data: AuthFormData, isSignUp: boolean): ValidationResult => {
  const errors: Record<string, string> = {};
  
  // メール検証
  if (!data.email || !VALIDATION_RULES.email.pattern.test(data.email)) {
    errors.email = VALIDATION_RULES.email.message;
  }
  
  // パスワード検証
  if (!data.password || data.password.length < VALIDATION_RULES.password.minLength) {
    errors.password = VALIDATION_RULES.password.message;
  }
  
  if (isSignUp) {
    // ユーザー名検証
    if (!data.username || 
        data.username.length < VALIDATION_RULES.username.minLength ||
        !VALIDATION_RULES.username.pattern.test(data.username)) {
      errors.username = VALIDATION_RULES.username.message;
    }
    
    // パスワード確認
    if (data.password !== data.confirmPassword) {
      errors.confirmPassword = 'パスワードが一致しません。';
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
```

### Phase 3: UIコンポーネントの細分化
```typescript
// components/AuthModal/AuthForm.tsx
export const AuthForm = ({ isSignUp }: { isSignUp: boolean }) => {
  const { formData, errors, updateField, validate } = useAuthForm(isSignUp);
  
  return (
    <View style={styles.formContainer}>
      <AuthInput
        label="メールアドレス"
        value={formData.email}
        onChangeText={(text) => updateField('email', text)}
        error={errors.email}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      {isSignUp && (
        <AuthInput
          label="ユーザー名"
          value={formData.username}
          onChangeText={(text) => updateField('username', text)}
          error={errors.username}
          autoCapitalize="none"
        />
      )}
      
      <AuthInput
        label="パスワード"
        value={formData.password}
        onChangeText={(text) => updateField('password', text)}
        error={errors.password}
        secureTextEntry
      />
      
      {isSignUp && (
        <AuthInput
          label="パスワード確認"
          value={formData.confirmPassword}
          onChangeText={(text) => updateField('confirmPassword', text)}
          error={errors.confirmPassword}
          secureTextEntry
        />
      )}
    </View>
  );
};

// components/AuthModal/AuthInput.tsx
interface AuthInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}

export const AuthInput = memo(({ 
  label, 
  value, 
  onChangeText, 
  error, 
  ...inputProps 
}: AuthInputProps) => (
  <View style={styles.inputContainer}>
    <Text style={styles.inputLabel}>{label}</Text>
    <TextInput
      style={[styles.input, error && styles.inputError]}
      value={value}
      onChangeText={onChangeText}
      placeholderTextColor={Colors.dark.subtext}
      {...inputProps}
    />
    {error && <Text style={styles.errorText}>{error}</Text>}
  </View>
));
```

### Phase 4: メインコンポーネントの簡素化
```typescript
// components/AuthModal.tsx（リファクタリング後）
export const AuthModal = ({ onClose }: AuthModalProps) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const { signIn, signUp } = useAuth();
  const { formData, validate, isLoading, setIsLoading, setErrors } = useAuthForm(isSignUp);
  
  const handleSubmit = async () => {
    const validation = validate();
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (isSignUp) {
        await signUp(formData.email, formData.password, formData.username);
      } else {
        await signIn(formData.email, formData.password);
      }
      onClose();
    } catch (error: any) {
      const errorMessage = getAuthErrorMessage(error);
      Alert.alert('エラー', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <AuthHeader 
        isSignUp={isSignUp}
        onClose={onClose}
      />
      
      <AuthForm isSignUp={isSignUp} />
      
      <AuthSubmitButton
        isSignUp={isSignUp}
        isLoading={isLoading}
        onPress={handleSubmit}
      />
      
      <AuthToggle
        isSignUp={isSignUp}
        onToggle={() => setIsSignUp(!isSignUp)}
      />
    </SafeAreaView>
  );
};
```

## 📈 期待される効果

### 保守性向上
- **コンポーネントサイズ**: 450行→150行（70%削減）
- **責務分離**: フォーム、バリデーション、UI表示の明確な分離
- **再利用性**: AuthInputコンポーネントの他での使用可能

### 開発体験向上
- **バリデーション**: 一元化された検証ルール
- **エラーハンドリング**: 統一されたエラー処理
- **テスタビリティ**: 個別コンポーネントのテスト容易

## ⏱️ 見積もり時間
- **Phase 1-4**: 6時間

**総計**: 約6時間