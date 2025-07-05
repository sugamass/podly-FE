-- データベーススキーマ定義
-- このファイルは Supabase データベースの構造を理解するためのリファレンスです。
-- 実際のマイグレーションやデータベース操作はバックエンド側で管理されます。

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
display_name text,
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

-- 注意事項:
-- - このファイルはリファレンス用途のみです
-- - 実際のマイグレーションやデータベース操作はバックエンド側で管理されます
-- - プロフィール自動作成や RLS ポリシーの詳細はバックエンド側のドキュメントを参照してください
