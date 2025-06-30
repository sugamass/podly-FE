-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.bgm (
id uuid NOT NULL DEFAULT gen_random_uuid(),
name character varying NOT NULL,
description text,
file_url text,
CONSTRAINT bgm_pkey PRIMARY KEY (id)
);
CREATE TABLE public.follows (
id uuid NOT NULL DEFAULT gen_random_uuid(),
follower_id uuid,
following_id uuid,
created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
CONSTRAINT follows_pkey PRIMARY KEY (id),
CONSTRAINT follows_follower_id_fkey FOREIGN KEY (follower_id) REFERENCES public.profiles(id),
CONSTRAINT follows_following_id_fkey FOREIGN KEY (following_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.genres (
id uuid NOT NULL DEFAULT gen_random_uuid(),
name character varying NOT NULL UNIQUE,
description text,
created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
CONSTRAINT genres_pkey PRIMARY KEY (id)
);
CREATE TABLE public.likes (
id uuid NOT NULL DEFAULT gen_random_uuid(),
user_id uuid,
podcast_id uuid,
created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
CONSTRAINT likes_pkey PRIMARY KEY (id),
CONSTRAINT likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
CONSTRAINT likes_podcast_id_fkey FOREIGN KEY (podcast_id) REFERENCES public.podcasts(id)
);
CREATE TABLE public.play_history (
id uuid NOT NULL DEFAULT gen_random_uuid(),
user_id uuid,
podcast_id uuid,
progress integer DEFAULT 0,
completed boolean DEFAULT false,
created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
CONSTRAINT play_history_pkey PRIMARY KEY (id),
CONSTRAINT play_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
CONSTRAINT play_history_podcast_id_fkey FOREIGN KEY (podcast_id) REFERENCES public.podcasts(id)
);
CREATE TABLE public.podcasts (
id uuid NOT NULL DEFAULT gen_random_uuid(),
title character varying NOT NULL,
summary text,
script_content text NOT NULL,
audio_url text,
duration integer,
genre_id uuid,
creator_id uuid,
source_urls ARRAY,
speakers ARRAY,
bgm_id text,
published_at timestamp with time zone,
created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
like_count integer,
streams integer,
save_count integer,
situation text,
voices ARRAY,
CONSTRAINT podcasts_pkey PRIMARY KEY (id),
CONSTRAINT podcasts_genre_id_fkey FOREIGN KEY (genre_id) REFERENCES public.genres(id),
CONSTRAINT podcasts_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.profiles (
id uuid NOT NULL,
username character varying NOT NULL UNIQUE,
avatar_url text,
bio text,
created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
CONSTRAINT profiles_pkey PRIMARY KEY (id),
CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.saves (
id uuid NOT NULL DEFAULT gen_random_uuid(),
user_id uuid,
podcast_id uuid,
created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
CONSTRAINT saves_pkey PRIMARY KEY (id),
CONSTRAINT saves_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
CONSTRAINT saves_podcast_id_fkey FOREIGN KEY (podcast_id) REFERENCES public.podcasts(id)
);

-- プロフィール自動作成関数
CREATE OR REPLACE FUNCTION public.handle*new_user()
RETURNS trigger AS $$
BEGIN
INSERT INTO public.profiles (id, username, avatar_url, bio)
VALUES (
NEW.id,
COALESCE(NEW.raw_user_meta_data->>'username', 'user*' || SUBSTRING(NEW.id::text, 1, 8)),
NULL,
NULL
)
ON CONFLICT (id) DO NOTHING;
RETURN NEW;
END;

$$
LANGUAGE plpgsql SECURITY DEFINER;

-- ユーザー作成時にプロフィールを自動作成するトリガー
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ユーザー名重複チェック用のユニーク制約（既に存在）
-- CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_idx ON public.profiles (username);

-- Row Level Security (RLS) ポリシー
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- プロフィール読み取りポリシー（全ユーザーが他のユーザーのプロフィールを読み取り可能）
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

-- プロフィール更新ポリシー（ユーザーは自分のプロフィールのみ更新可能）
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- プロフィール挿入ポリシー（認証されたユーザーが自分のプロフィールを作成可能）
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
$$
