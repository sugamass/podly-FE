-- おすすめポッドキャスト取得関数
CREATE OR REPLACE FUNCTION get_recommended_podcasts(
  user_id_param UUID DEFAULT NULL,
  limit_param INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  title VARCHAR,
  summary TEXT,
  audio_url TEXT,
  duration INTEGER,
  genre_name VARCHAR,
  creator_username VARCHAR,
  creator_avatar_url TEXT,
  likes_count BIGINT,
  published_at TIMESTAMP WITH TIME ZONE,
  is_liked BOOLEAN,
  is_saved BOOLEAN,
  bgm_name VARCHAR,
  bgm_file_url TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.title,
    p.summary,
    p.audio_url,
    p.duration,
    g.name as genre_name,
    pr.username as creator_username,
    pr.avatar_url as creator_avatar_url,
    COALESCE(like_counts.count, 0) as likes_count,
    p.published_at,
    CASE 
      WHEN user_id_param IS NOT NULL THEN 
        EXISTS(SELECT 1 FROM likes l WHERE l.user_id = user_id_param AND l.podcast_id = p.id)
      ELSE FALSE
    END as is_liked,
    CASE 
      WHEN user_id_param IS NOT NULL THEN 
        EXISTS(SELECT 1 FROM saves s WHERE s.user_id = user_id_param AND s.podcast_id = p.id)
      ELSE FALSE
    END as is_saved,
    b.name as bgm_name,
    b.file_url as bgm_file_url
  FROM podcasts p
  LEFT JOIN genres g ON p.genre_id = g.id
  LEFT JOIN profiles pr ON p.creator_id = pr.id
  LEFT JOIN bgm b ON p.bgm_id = b.id
  LEFT JOIN (
    SELECT podcast_id, COUNT(*) as count
    FROM likes
    GROUP BY podcast_id
  ) like_counts ON p.id = like_counts.podcast_id
  WHERE p.published_at IS NOT NULL
  ORDER BY 
    p.published_at DESC,
    like_counts.count DESC NULLS LAST
  LIMIT limit_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ジャンル別ポッドキャスト取得関数
CREATE OR REPLACE FUNCTION get_podcasts_by_genre(
  genre_id_param UUID,
  user_id_param UUID DEFAULT NULL,
  limit_param INTEGER DEFAULT 10,
  offset_param INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  title VARCHAR,
  summary TEXT,
  audio_url TEXT,
  duration INTEGER,
  genre_name VARCHAR,
  creator_username VARCHAR,
  creator_avatar_url TEXT,
  likes_count BIGINT,
  published_at TIMESTAMP WITH TIME ZONE,
  is_liked BOOLEAN,
  is_saved BOOLEAN,
  bgm_name VARCHAR,
  bgm_file_url TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.title,
    p.summary,
    p.audio_url,
    p.duration,
    g.name as genre_name,
    pr.username as creator_username,
    pr.avatar_url as creator_avatar_url,
    COALESCE(like_counts.count, 0) as likes_count,
    p.published_at,
    CASE 
      WHEN user_id_param IS NOT NULL THEN 
        EXISTS(SELECT 1 FROM likes l WHERE l.user_id = user_id_param AND l.podcast_id = p.id)
      ELSE FALSE
    END as is_liked,
    CASE 
      WHEN user_id_param IS NOT NULL THEN 
        EXISTS(SELECT 1 FROM saves s WHERE s.user_id = user_id_param AND s.podcast_id = p.id)
      ELSE FALSE
    END as is_saved,
    b.name as bgm_name,
    b.file_url as bgm_file_url
  FROM podcasts p
  LEFT JOIN genres g ON p.genre_id = g.id
  LEFT JOIN profiles pr ON p.creator_id = pr.id
  LEFT JOIN bgm b ON p.bgm_id = b.id
  LEFT JOIN (
    SELECT podcast_id, COUNT(*) as count
    FROM likes
    GROUP BY podcast_id
  ) like_counts ON p.id = like_counts.podcast_id
  WHERE p.published_at IS NOT NULL
    AND p.genre_id = genre_id_param
  ORDER BY p.published_at DESC
  LIMIT limit_param
  OFFSET offset_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ユーザーの保存済みポッドキャスト取得関数
CREATE OR REPLACE FUNCTION get_saved_podcasts(
  user_id_param UUID,
  limit_param INTEGER DEFAULT 10,
  offset_param INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  title VARCHAR,
  summary TEXT,
  audio_url TEXT,
  duration INTEGER,
  genre_name VARCHAR,
  creator_username VARCHAR,
  creator_avatar_url TEXT,
  likes_count BIGINT,
  published_at TIMESTAMP WITH TIME ZONE,
  saved_at TIMESTAMP WITH TIME ZONE,
  is_liked BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.title,
    p.summary,
    p.audio_url,
    p.duration,
    g.name as genre_name,
    pr.username as creator_username,
    pr.avatar_url as creator_avatar_url,
    COALESCE(like_counts.count, 0) as likes_count,
    p.published_at,
    s.created_at as saved_at,
    EXISTS(SELECT 1 FROM likes l WHERE l.user_id = user_id_param AND l.podcast_id = p.id) as is_liked
  FROM saves s
  JOIN podcasts p ON s.podcast_id = p.id
  LEFT JOIN genres g ON p.genre_id = g.id
  LEFT JOIN profiles pr ON p.creator_id = pr.id
  LEFT JOIN (
    SELECT podcast_id, COUNT(*) as count
    FROM likes
    GROUP BY podcast_id
  ) like_counts ON p.id = like_counts.podcast_id
  WHERE s.user_id = user_id_param
    AND p.published_at IS NOT NULL
  ORDER BY s.created_at DESC
  LIMIT limit_param
  OFFSET offset_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ポッドキャスト検索関数
CREATE OR REPLACE FUNCTION search_podcasts(
  search_term TEXT,
  user_id_param UUID DEFAULT NULL,
  limit_param INTEGER DEFAULT 10,
  offset_param INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  title VARCHAR,
  summary TEXT,
  audio_url TEXT,
  duration INTEGER,
  genre_name VARCHAR,
  creator_username VARCHAR,
  creator_avatar_url TEXT,
  likes_count BIGINT,
  published_at TIMESTAMP WITH TIME ZONE,
  is_liked BOOLEAN,
  is_saved BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.title,
    p.summary,
    p.audio_url,
    p.duration,
    g.name as genre_name,
    pr.username as creator_username,
    pr.avatar_url as creator_avatar_url,
    COALESCE(like_counts.count, 0) as likes_count,
    p.published_at,
    CASE 
      WHEN user_id_param IS NOT NULL THEN 
        EXISTS(SELECT 1 FROM likes l WHERE l.user_id = user_id_param AND l.podcast_id = p.id)
      ELSE FALSE
    END as is_liked,
    CASE 
      WHEN user_id_param IS NOT NULL THEN 
        EXISTS(SELECT 1 FROM saves s WHERE s.user_id = user_id_param AND s.podcast_id = p.id)
      ELSE FALSE
    END as is_saved
  FROM podcasts p
  LEFT JOIN genres g ON p.genre_id = g.id
  LEFT JOIN profiles pr ON p.creator_id = pr.id
  LEFT JOIN (
    SELECT podcast_id, COUNT(*) as count
    FROM likes
    GROUP BY podcast_id
  ) like_counts ON p.id = like_counts.podcast_id
  WHERE p.published_at IS NOT NULL
    AND (
      p.title ILIKE '%' || search_term || '%' 
      OR p.summary ILIKE '%' || search_term || '%'
      OR g.name ILIKE '%' || search_term || '%'
      OR pr.username ILIKE '%' || search_term || '%'
    )
  ORDER BY 
    CASE 
      WHEN p.title ILIKE '%' || search_term || '%' THEN 1
      WHEN p.summary ILIKE '%' || search_term || '%' THEN 2
      WHEN g.name ILIKE '%' || search_term || '%' THEN 3
      ELSE 4
    END,
    p.published_at DESC
  LIMIT limit_param
  OFFSET offset_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ユーザー統計取得関数
CREATE OR REPLACE FUNCTION get_user_stats(user_id_param UUID)
RETURNS TABLE (
  podcasts_count BIGINT,
  followers_count BIGINT,
  following_count BIGINT,
  total_likes_received BIGINT,
  total_saves_received BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM podcasts WHERE creator_id = user_id_param AND published_at IS NOT NULL) as podcasts_count,
    (SELECT COUNT(*) FROM follows WHERE following_id = user_id_param) as followers_count,
    (SELECT COUNT(*) FROM follows WHERE follower_id = user_id_param) as following_count,
    (SELECT COUNT(*) FROM likes l JOIN podcasts p ON l.podcast_id = p.id WHERE p.creator_id = user_id_param) as total_likes_received,
    (SELECT COUNT(*) FROM saves s JOIN podcasts p ON s.podcast_id = p.id WHERE p.creator_id = user_id_param) as total_saves_received;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 再生進捗更新関数
CREATE OR REPLACE FUNCTION update_play_progress(
  user_id_param UUID,
  podcast_id_param UUID,
  progress_param INTEGER,
  completed_param BOOLEAN DEFAULT FALSE
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO play_history (user_id, podcast_id, progress, completed)
  VALUES (user_id_param, podcast_id_param, progress_param, completed_param)
  ON CONFLICT (user_id, podcast_id) 
  DO UPDATE SET 
    progress = progress_param,
    completed = completed_param,
    updated_at = timezone('utc'::text, now());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- インデックスを追加（全文検索のパフォーマンス向上）
-- 注意: 日本語設定が利用できない場合は、デフォルト設定を使用
CREATE INDEX IF NOT EXISTS idx_podcasts_title_gin ON podcasts USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_podcasts_summary_gin ON podcasts USING gin(to_tsvector('english', summary));
CREATE INDEX IF NOT EXISTS idx_profiles_username_gin ON profiles USING gin(to_tsvector('english', username));

-- BGMカテゴリ取得用のRPC関数
CREATE OR REPLACE FUNCTION get_bgm_by_category(
  genre_param VARCHAR DEFAULT NULL,
  mood_param VARCHAR DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  name VARCHAR,
  description TEXT,
  file_url TEXT,
  duration INTEGER,
  genre VARCHAR,
  mood VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id,
    b.name,
    b.description,
    b.file_url,
    b.duration,
    b.genre,
    b.mood
  FROM bgm b
  WHERE b.is_active = TRUE
    AND (genre_param IS NULL OR b.genre = genre_param)
    AND (mood_param IS NULL OR b.mood = mood_param)
  ORDER BY b.sort_order, b.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 全BGMリスト取得用のRPC関数
CREATE OR REPLACE FUNCTION get_all_bgm()
RETURNS TABLE (
  id UUID,
  name VARCHAR,
  description TEXT,
  file_url TEXT,
  duration INTEGER,
  genre VARCHAR,
  mood VARCHAR,
  sort_order INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id,
    b.name,
    b.description,
    b.file_url,
    b.duration,
    b.genre,
    b.mood,
    b.sort_order
  FROM bgm b
  WHERE b.is_active = TRUE
  ORDER BY b.sort_order, b.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 