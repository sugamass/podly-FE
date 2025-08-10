# components/CommentModal.tsx リファクタリング計画

## 📋 現在の問題点

### 1. ハードコーディングされたモックデータ（37-95行）
**問題**: 実際のデータとの不整合
```typescript
const mockComments = [
  {
    id: '1',
    user: { username: 'user1', avatar: 'https://picsum.photos/40/40?random=1' },
    content: 'とても興味深いトピックですね！',
    // ...長いモックデータ
  }
];
```

### 2. 複雑なコメント状態管理
**問題**: いいね・返信・追加処理が混在

### 3. いいね処理の重複
**問題**: PodcastActionsと同じパターンの処理

### 4. エラーハンドリングの不備
**問題**: API失敗時の適切な処理がない

## 🛠️ リファクタリング提案

### Phase 1: データレイヤーの抽象化
```typescript
// services/commentRepository.ts
export interface CommentRepository {
  getComments(podcastId: string): Promise<Comment[]>;
  addComment(podcastId: string, content: string, parentId?: string): Promise<Comment>;
  toggleLike(commentId: string): Promise<void>;
  deleteComment(commentId: string): Promise<void>;
}

export class SupabaseCommentRepository implements CommentRepository {
  async getComments(podcastId: string): Promise<Comment[]> {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        user:profiles(username, avatar_url),
        likes:comment_likes(count)
      `)
      .eq('podcast_id', podcastId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data || [];
  }
  
  async addComment(podcastId: string, content: string, parentId?: string): Promise<Comment> {
    const { data, error } = await supabase
      .from('comments')
      .insert({
        podcast_id: podcastId,
        content,
        parent_id: parentId
      })
      .select(`
        *,
        user:profiles(username, avatar_url)
      `)
      .single();
      
    if (error) throw error;
    return data;
  }
}

// hooks/useComments.ts
export const useComments = (podcastId: string) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const repository = useMemo(() => new SupabaseCommentRepository(), []);
  
  const fetchComments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const fetchedComments = await repository.getComments(podcastId);
      setComments(fetchedComments);
    } catch (error) {
      setError('コメントの取得に失敗しました');
      // フォールバックとしてモックデータを使用
      setComments(mockComments);
    } finally {
      setIsLoading(false);
    }
  }, [podcastId, repository]);
  
  const addComment = useCallback(async (content: string, parentId?: string) => {
    try {
      const newComment = await repository.addComment(podcastId, content, parentId);
      setComments(prev => [newComment, ...prev]);
      return newComment;
    } catch (error) {
      throw new Error('コメントの投稿に失敗しました');
    }
  }, [podcastId, repository]);
  
  return {
    comments,
    isLoading,
    error,
    fetchComments,
    addComment,
    refetch: fetchComments
  };
};
```

### Phase 2: UIコンポーネントの分離
```typescript
// components/CommentModal/CommentItem.tsx
export const CommentItem = memo(({ comment, onLike, onReply }: CommentItemProps) => {
  const { executeAction, isAnimating } = useUserAction('like');
  
  const handleLike = () => {
    executeAction(async () => {
      await onLike(comment.id);
    });
  };
  
  return (
    <View style={styles.commentItem}>
      <Image source={{ uri: comment.user.avatar }} style={styles.avatar} />
      <View style={styles.commentContent}>
        <Text style={styles.username}>{comment.user.username}</Text>
        <Text style={styles.content}>{comment.content}</Text>
        <View style={styles.commentActions}>
          <CommentActionButton
            icon={comment.isLiked ? 'heart' : 'heart-outline'}
            count={comment.likesCount}
            isActive={comment.isLiked}
            onPress={handleLike}
            isLoading={isAnimating}
          />
          <CommentActionButton
            icon="chatbubble-outline"
            text="返信"
            onPress={() => onReply(comment.id)}
          />
        </View>
      </View>
    </View>
  );
});

// components/CommentModal/CommentInput.tsx
export const CommentInput = ({ onSubmit, isLoading }: CommentInputProps) => {
  const [comment, setComment] = useState('');
  
  const handleSubmit = () => {
    if (comment.trim()) {
      onSubmit(comment.trim());
      setComment('');
    }
  };
  
  return (
    <View style={styles.inputContainer}>
      <TextInput
        style={styles.input}
        value={comment}
        onChangeText={setComment}
        placeholder="コメントを入力..."
        multiline
        maxLength={500}
      />
      <Pressable
        style={[styles.submitButton, !comment.trim() && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={isLoading || !comment.trim()}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={Colors.dark.text} />
        ) : (
          <Ionicons name="send" size={20} color={Colors.dark.text} />
        )}
      </Pressable>
    </View>
  );
};
```

### Phase 3: メインコンポーネントの簡素化
```typescript
// components/CommentModal.tsx（リファクタリング後）
export const CommentModal = ({ visible, onClose, podcast }: CommentModalProps) => {
  const { comments, isLoading, error, fetchComments, addComment } = useComments(podcast.id);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    if (visible) {
      fetchComments();
    }
  }, [visible, fetchComments]);
  
  const handleSubmitComment = async (content: string) => {
    setIsSubmitting(true);
    try {
      await addComment(content);
    } catch (error) {
      Alert.alert('エラー', 'コメントの投稿に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleLikeComment = async (commentId: string) => {
    // いいね処理
  };
  
  const handleReply = (commentId: string) => {
    // 返信処理
  };
  
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        <CommentModalHeader onClose={onClose} />
        
        <CommentList
          comments={comments}
          isLoading={isLoading}
          error={error}
          onLike={handleLikeComment}
          onReply={handleReply}
          onRefresh={fetchComments}
        />
        
        <CommentInput
          onSubmit={handleSubmitComment}
          isLoading={isSubmitting}
        />
      </SafeAreaView>
    </Modal>
  );
};
```

## 📈 期待される効果

### データ整合性向上
- **実データ連携**: モックデータから実際のAPI連携
- **リアルタイム**: Supabase Realtimeでコメント同期
- **型安全性**: 適切なTypeScript型定義

### 保守性向上
- **責務分離**: データ取得、UI表示、状態管理の分離
- **再利用性**: CommentItemやCommentInputの他での使用可能
- **テスタビリティ**: 個別コンポーネントのテスト容易

## ⏱️ 見積もり時間
**総計**: 約8時間