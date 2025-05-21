SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

COMMENT ON SCHEMA "public" IS 'standard public schema';

CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";

CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."increment_play_count"("track_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  UPDATE public.tracks
  SET play_count = play_count + 1
  WHERE id = track_id;
END;
$$;

ALTER FUNCTION "public"."increment_play_count"("track_id" "uuid") OWNER TO "postgres";

SET default_tablespace = '';
SET default_table_access_method = "heap";

CREATE TABLE IF NOT EXISTS "public"."ai_suggestions_cache" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "track_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "suggestions" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE "public"."ai_suggestions_cache" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."comments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "track_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "content" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE "public"."comments" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."favorites" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "track_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE "public"."favorites" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."memories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text",
    "date" "text",
    "location" "text",
    "people" "text"[],
    "mood" "text",
    "activity" "text",
    "note" "text",
    "photo_url" "text",
    "track_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE "public"."memories" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."playlist_tracks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "playlist_id" "uuid" NOT NULL,
    "track_id" "uuid" NOT NULL,
    "position" integer NOT NULL,
    "added_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE "public"."playlist_tracks" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."playlists" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "cover_image" "text",
    "created_by" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "is_public" boolean DEFAULT true
);

ALTER TABLE "public"."playlists" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "username" "text",
    "full_name" "text",
    "avatar_url" "text",
    "bio" "text",
    "website" "text",
    "is_artist" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE "public"."profiles" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."tracks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "artist" "text",
    "album" "text",
    "genre" "text",
    "year" "text",
    "duration" integer NOT NULL,
    "file_path" "text" NOT NULL,
    "cover_art" "text",
    "uploaded_by" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "play_count" integer DEFAULT 0,
    "is_public" boolean DEFAULT true
);

ALTER TABLE "public"."tracks" OWNER TO "postgres";

ALTER TABLE ONLY "public"."ai_suggestions_cache"
    ADD CONSTRAINT "ai_suggestions_cache_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."favorites"
    ADD CONSTRAINT "favorites_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."favorites"
    ADD CONSTRAINT "favorites_user_id_track_id_key" UNIQUE ("user_id", "track_id");

ALTER TABLE ONLY "public"."memories"
    ADD CONSTRAINT "memories_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."playlist_tracks"
    ADD CONSTRAINT "playlist_tracks_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."playlist_tracks"
    ADD CONSTRAINT "playlist_tracks_playlist_id_track_id_key" UNIQUE ("playlist_id", "track_id");

ALTER TABLE ONLY "public"."playlists"
    ADD CONSTRAINT "playlists_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_username_key" UNIQUE ("username");

ALTER TABLE ONLY "public"."tracks"
    ADD CONSTRAINT "tracks_pkey" PRIMARY KEY ("id");

CREATE INDEX "ai_suggestions_track_user_idx" ON "public"."ai_suggestions_cache" USING "btree" ("track_id", "user_id");

ALTER TABLE ONLY "public"."ai_suggestions_cache"
    ADD CONSTRAINT "ai_suggestions_cache_track_id_fkey" FOREIGN KEY ("track_id") REFERENCES "public"."tracks"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."ai_suggestions_cache"
    ADD CONSTRAINT "ai_suggestions_cache_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_track_id_fkey" FOREIGN KEY ("track_id") REFERENCES "public"."tracks"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."favorites"
    ADD CONSTRAINT "favorites_track_id_fkey" FOREIGN KEY ("track_id") REFERENCES "public"."tracks"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."favorites"
    ADD CONSTRAINT "favorites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."memories"
    ADD CONSTRAINT "memories_track_id_fkey" FOREIGN KEY ("track_id") REFERENCES "public"."tracks"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."memories"
    ADD CONSTRAINT "memories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."playlist_tracks"
    ADD CONSTRAINT "playlist_tracks_playlist_id_fkey" FOREIGN KEY ("playlist_id") REFERENCES "public"."playlists"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."playlist_tracks"
    ADD CONSTRAINT "playlist_tracks_track_id_fkey" FOREIGN KEY ("track_id") REFERENCES "public"."tracks"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."playlists"
    ADD CONSTRAINT "playlists_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");

ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id");

ALTER TABLE ONLY "public"."tracks"
    ADD CONSTRAINT "tracks_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "auth"."users"("id");

CREATE POLICY "Comments are viewable by everyone" ON "public"."comments" FOR SELECT USING (true);
CREATE POLICY "Profiles are viewable by everyone" ON "public"."profiles" FOR SELECT USING (true);
CREATE POLICY "Users can delete their own AI suggestions" ON "public"."ai_suggestions_cache" FOR DELETE USING (("auth"."uid"() = "user_id"));
CREATE POLICY "Users can delete their own comments" ON "public"."comments" FOR DELETE USING (("auth"."uid"() = "user_id"));
CREATE POLICY "Users can delete their own favorites" ON "public"."favorites" FOR DELETE USING (("auth"."uid"() = "user_id"));
CREATE POLICY "Users can delete their own memories" ON "public"."memories" FOR DELETE USING (("auth"."uid"() = "user_id"));
CREATE POLICY "Users can delete their own playlists" ON "public"."playlists" FOR DELETE USING (("auth"."uid"() = "created_by"));
CREATE POLICY "Users can delete their own tracks" ON "public"."tracks" FOR DELETE USING (("auth"."uid"() = "uploaded_by"));

CREATE POLICY "Users can delete tracks from their own playlists" ON "public"."playlist_tracks" FOR DELETE USING ((( SELECT "playlists"."created_by"
   FROM "public"."playlists"
  WHERE ("playlists"."id" = "playlist_tracks"."playlist_id")) = "auth"."uid"()));

CREATE POLICY "Users can insert their own AI suggestions" ON "public"."ai_suggestions_cache" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));
CREATE POLICY "Users can insert their own comments" ON "public"."comments" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));
CREATE POLICY "Users can insert their own favorites" ON "public"."favorites" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));
CREATE POLICY "Users can insert their own memories" ON "public"."memories" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));
CREATE POLICY "Users can insert their own playlists" ON "public"."playlists" FOR INSERT WITH CHECK (("auth"."uid"() = "created_by"));
CREATE POLICY "Users can insert their own tracks" ON "public"."tracks" FOR INSERT WITH CHECK (("auth"."uid"() = "uploaded_by"));

CREATE POLICY "Users can insert tracks to their own playlists" ON "public"."playlist_tracks" FOR INSERT WITH CHECK ((( SELECT "playlists"."created_by"
   FROM "public"."playlists"
  WHERE ("playlists"."id" = "playlist_tracks"."playlist_id")) = "auth"."uid"()));

CREATE POLICY "Users can select their own AI suggestions" ON "public"."ai_suggestions_cache" FOR SELECT USING (("auth"."uid"() = "user_id"));
CREATE POLICY "Users can update their own AI suggestions" ON "public"."ai_suggestions_cache" FOR UPDATE USING (("auth"."uid"() = "user_id"));
CREATE POLICY "Users can update their own comments" ON "public"."comments" FOR UPDATE USING (("auth"."uid"() = "user_id"));
CREATE POLICY "Users can update their own memories" ON "public"."memories" FOR UPDATE USING (("auth"."uid"() = "user_id"));
CREATE POLICY "Users can update their own playlists" ON "public"."playlists" FOR UPDATE USING (("auth"."uid"() = "created_by"));
CREATE POLICY "Users can update their own profile" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id"));
CREATE POLICY "Users can update their own tracks" ON "public"."tracks" FOR UPDATE USING (("auth"."uid"() = "uploaded_by"));

CREATE POLICY "Users can update tracks in their own playlists" ON "public"."playlist_tracks" FOR UPDATE USING ((( SELECT "playlists"."created_by"
   FROM "public"."playlists"
  WHERE ("playlists"."id" = "playlist_tracks"."playlist_id")) = "auth"."uid"()));

CREATE POLICY "Users can view playlist tracks of public playlists" ON "public"."playlist_tracks" FOR SELECT USING (((( SELECT "playlists"."is_public"
   FROM "public"."playlists"
  WHERE ("playlists"."id" = "playlist_tracks"."playlist_id")) = true) OR (( SELECT "playlists"."created_by"
   FROM "public"."playlists"
  WHERE ("playlists"."id" = "playlist_tracks"."playlist_id")) = "auth"."uid"())));

CREATE POLICY "Users can view public playlists" ON "public"."playlists" FOR SELECT USING ((("is_public" = true) OR ("auth"."uid"() = "created_by")));
CREATE POLICY "Users can view public tracks" ON "public"."tracks" FOR SELECT USING ((("is_public" = true) OR ("auth"."uid"() = "uploaded_by")));
CREATE POLICY "Users can view their own favorites" ON "public"."favorites" FOR SELECT USING (("auth"."uid"() = "user_id"));
CREATE POLICY "Users can view their own memories" ON "public"."memories" FOR SELECT USING (("auth"."uid"() = "user_id"));

ALTER TABLE "public"."ai_suggestions_cache" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."comments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."favorites" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."memories" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."playlist_tracks" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."playlists" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."tracks" ENABLE ROW LEVEL SECURITY;

ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";
GRANT ALL ON FUNCTION "public"."increment_play_count"("track_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."increment_play_count"("track_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."increment_play_count"("track_id" "uuid") TO "service_role";
GRANT ALL ON TABLE "public"."ai_suggestions_cache" TO "anon";
GRANT ALL ON TABLE "public"."ai_suggestions_cache" TO "authenticated";
GRANT ALL ON TABLE "public"."ai_suggestions_cache" TO "service_role";
GRANT ALL ON TABLE "public"."comments" TO "anon";
GRANT ALL ON TABLE "public"."comments" TO "authenticated";
GRANT ALL ON TABLE "public"."comments" TO "service_role";
GRANT ALL ON TABLE "public"."favorites" TO "anon";
GRANT ALL ON TABLE "public"."favorites" TO "authenticated";
GRANT ALL ON TABLE "public"."favorites" TO "service_role";
GRANT ALL ON TABLE "public"."memories" TO "anon";
GRANT ALL ON TABLE "public"."memories" TO "authenticated";
GRANT ALL ON TABLE "public"."memories" TO "service_role";
GRANT ALL ON TABLE "public"."playlist_tracks" TO "anon";
GRANT ALL ON TABLE "public"."playlist_tracks" TO "authenticated";
GRANT ALL ON TABLE "public"."playlist_tracks" TO "service_role";
GRANT ALL ON TABLE "public"."playlists" TO "anon";
GRANT ALL ON TABLE "public"."playlists" TO "authenticated";
GRANT ALL ON TABLE "public"."playlists" TO "service_role";
GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";
GRANT ALL ON TABLE "public"."tracks" TO "anon";
GRANT ALL ON TABLE "public"."tracks" TO "authenticated";
GRANT ALL ON TABLE "public"."tracks" TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";

RESET ALL;
