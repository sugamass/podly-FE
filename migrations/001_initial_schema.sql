-- ユーザープロフィールテーブル
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ジャンルテーブル
CREATE TABLE genres (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- BGMテーブル
CREATE TABLE bgm (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  duration INTEGER, -- 秒数
  genre VARCHAR(50), -- 音楽のジャンル（リラックス、アップビート、フォーカスなど）
  mood VARCHAR(50), -- 雰囲気（穏やか、エネルギッシュ、集中など）
  is_active BOOLEAN DEFAULT TRUE, -- 選択可能かどうか
  sort_order INTEGER DEFAULT 0, -- 表示順序
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ポッドキャストテーブル
CREATE TABLE podcasts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  summary TEXT,
  script_content TEXT NOT NULL,
  audio_url TEXT,
  duration INTEGER, -- 秒数
  genre_id UUID REFERENCES genres(id),
  creator_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  source_urls TEXT[], -- 情報ソースURL配列
  speaker_count INTEGER DEFAULT 1,
  speaker_roles TEXT[], -- 話者の立場（先生・生徒など）
  voice_settings JSONB, -- TTS設定
  bgm_id UUID REFERENCES bgm(id),
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- フォローテーブル
CREATE TABLE follows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  following_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- いいねテーブル
CREATE TABLE likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  podcast_id UUID REFERENCES podcasts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, podcast_id)
);

-- 保存テーブル
CREATE TABLE saves (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  podcast_id UUID REFERENCES podcasts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, podcast_id)
);

-- 再生履歴テーブル
CREATE TABLE play_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  podcast_id UUID REFERENCES podcasts(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0, -- 再生位置（秒）
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- インデックスの作成
CREATE INDEX idx_podcasts_genre_id ON podcasts(genre_id);
CREATE INDEX idx_podcasts_creator_id ON podcasts(creator_id);
CREATE INDEX idx_podcasts_published_at ON podcasts(published_at DESC);
CREATE INDEX idx_podcasts_bgm_id ON podcasts(bgm_id);
CREATE INDEX idx_follows_follower_id ON follows(follower_id);
CREATE INDEX idx_follows_following_id ON follows(following_id);
CREATE INDEX idx_likes_user_id ON likes(user_id);
CREATE INDEX idx_likes_podcast_id ON likes(podcast_id);
CREATE INDEX idx_saves_user_id ON saves(user_id);
CREATE INDEX idx_saves_podcast_id ON saves(podcast_id);
CREATE INDEX idx_play_history_user_id ON play_history(user_id);
CREATE INDEX idx_play_history_podcast_id ON play_history(podcast_id);
CREATE INDEX idx_bgm_genre ON bgm(genre);
CREATE INDEX idx_bgm_mood ON bgm(mood);
CREATE INDEX idx_bgm_is_active ON bgm(is_active);
CREATE INDEX idx_bgm_sort_order ON bgm(sort_order);

-- Row Level Security (RLS) の有効化
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE podcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE play_history ENABLE ROW LEVEL SECURITY;

-- プロフィール用のRLSポリシー
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- ポッドキャスト用のRLSポリシー
CREATE POLICY "Published podcasts are viewable by everyone" ON podcasts
  FOR SELECT USING (published_at IS NOT NULL);

CREATE POLICY "Users can insert their own podcasts" ON podcasts
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Users can update their own podcasts" ON podcasts
  FOR UPDATE USING (auth.uid() = creator_id);

CREATE POLICY "Users can delete their own podcasts" ON podcasts
  FOR DELETE USING (auth.uid() = creator_id);

-- フォロー用のRLSポリシー
CREATE POLICY "Users can view all follows" ON follows
  FOR SELECT USING (true);

CREATE POLICY "Users can follow others" ON follows
  FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow others" ON follows
  FOR DELETE USING (auth.uid() = follower_id);

-- いいね用のRLSポリシー
CREATE POLICY "Users can view all likes" ON likes
  FOR SELECT USING (true);

CREATE POLICY "Users can like podcasts" ON likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike podcasts" ON likes
  FOR DELETE USING (auth.uid() = user_id);

-- 保存用のRLSポリシー
CREATE POLICY "Users can view their own saves" ON saves
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can save podcasts" ON saves
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave podcasts" ON saves
  FOR DELETE USING (auth.uid() = user_id);

-- 再生履歴用のRLSポリシー
CREATE POLICY "Users can view their own play history" ON play_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own play history" ON play_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own play history" ON play_history
  FOR UPDATE USING (auth.uid() = user_id);

-- トリガー関数：updated_atを自動更新
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- updated_atトリガーの設定
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_podcasts_updated_at BEFORE UPDATE ON podcasts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_play_history_updated_at BEFORE UPDATE ON play_history
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bgm_updated_at BEFORE UPDATE ON bgm
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 初期ジャンルデータの挿入
INSERT INTO genres (name, description) VALUES
  ('ビジネス', 'ビジネス・経済・マーケティング関連の話題'),
  ('テクノロジー', 'IT・テクノロジー・プログラミング関連の話題'),
  ('ニュース', '時事・ニュース・社会問題の解説'),
  ('教育', '学習・スキルアップ・資格取得関連の話題'),
  ('健康', '健康・医療・フィットネス関連の話題'),
  ('ライフスタイル', 'ライフハック・趣味・日常生活の話題'),
  ('科学', '科学・研究・発見に関する話題'),
  ('歴史', '歴史・文化・社会の変遷に関する話題');

-- 初期BGMデータの挿入
INSERT INTO bgm (name, description, file_url, duration, genre, mood, sort_order) VALUES
  ('穏やかな朝', 'リラックスした朝の時間にぴったりの穏やかなピアノメロディ', '/bgm/calm_morning.mp3', 180, 'アンビエント', '穏やか', 1),
  ('集中フォーカス', '作業や学習に集中したい時に最適な落ち着いたBGM', '/bgm/focus_ambient.mp3', 240, 'アンビエント', '集中', 2),
  ('軽やかステップ', '軽快で前向きな気持ちになれるアップビートな音楽', '/bgm/light_step.mp3', 200, 'ポップ', 'エネルギッシュ', 3),
  ('深い思考', '哲学的な内容や深いトピックにマッチする思慮深いBGM', '/bgm/deep_thinking.mp3', 220, 'クラシカル', '思慮深い', 4),
  ('カフェタイム', 'コーヒーを飲みながらのリラックスタイムにぴったり', '/bgm/cafe_time.mp3', 210, 'ジャズ', 'リラックス', 5),
  ('夜の静寂', '夜の静かな時間や睡眠前のリラックスに適したBGM', '/bgm/night_silence.mp3', 300, 'アンビエント', '静寂', 6),
  ('新鮮な発見', '新しい知識や発見をテーマにした明るく好奇心をそそるBGM', '/bgm/fresh_discovery.mp3', 190, 'エレクトロニック', '好奇心', 7),
  ('温かい対話', '人との会話や対談にマッチする温かみのあるBGM', '/bgm/warm_dialogue.mp3', 250, 'アコースティック', '温かい', 8),
  ('自然の響き', '自然音を取り入れた癒し系BGM、環境やライフスタイル系コンテンツに', '/bgm/nature_sounds.mp3', 280, 'ネイチャー', '癒し', 9),
  ('無音（BGMなし）', 'BGMを使用しない選択肢', '', 0, 'なし', 'なし', 10); 