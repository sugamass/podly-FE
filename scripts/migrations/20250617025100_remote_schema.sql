alter table "public"."podcasts" drop constraint "podcasts_bgm_id_fkey";

alter table "public"."podcasts" alter column "bgm_id" set data type text using "bgm_id"::text;


