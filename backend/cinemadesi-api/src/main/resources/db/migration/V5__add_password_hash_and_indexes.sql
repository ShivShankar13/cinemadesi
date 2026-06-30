-- V5 — Indexes for every repository query field, plus the local-auth column.
--
-- Postgres does NOT auto-create an index for foreign-key columns, so anything
-- we filter / order by in a repo method needs an explicit index here.
--
-- Each index below is annotated with the repository method that needs it.

-- ─── Local auth ───────────────────────────────────────────────────────────
-- AuthService.register / login set this. Nullable so OAuth-only accounts
-- never need to carry one.
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

-- ─── watch_entries — feed + profile diary use (user_id, created_at DESC) ──
-- DiaryService.getDiaryForUser(...) and FeedService.feed(...) both ORDER BY
-- created_at DESC after filtering by user_id (or user_id IN (...)). The plain
-- idx_watch_entries_user_id from V2 helps the filter but forces a sort; this
-- composite serves both filter + order from the index directly.
CREATE INDEX IF NOT EXISTS idx_watch_entries_user_created
    ON watch_entries (user_id, created_at DESC);

-- For "have I logged this film?" lookups in DiaryService / FilmService.
CREATE INDEX IF NOT EXISTS idx_watch_entries_user_film
    ON watch_entries (user_id, film_id);

-- ─── watchlist_items — list view ORDER BY added_at DESC ──────────────────
CREATE INDEX IF NOT EXISTS idx_watchlist_user_added
    ON watchlist_items (user_id, added_at DESC);

-- ─── recommendations — none in V4. All three target paths need one. ───────
-- RecommendationService.inbox(user)     → to_user_id  ORDER BY created_at DESC
-- RecommendationService.sent(user)      → from_user_id ORDER BY created_at DESC
-- GroupService.groupRecommendations(g)  → to_group_id ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_recommendations_to_user_created
    ON recommendations (to_user_id, created_at DESC)
    WHERE to_user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_recommendations_from_user_created
    ON recommendations (from_user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_recommendations_to_group_created
    ON recommendations (to_group_id, created_at DESC)
    WHERE to_group_id IS NOT NULL;

-- ─── lists / list_films — also missing from V4 ───────────────────────────
-- ListService.myLists(user) → lists.user_id
CREATE INDEX IF NOT EXISTS idx_lists_user_id ON lists(user_id);

-- ListService.publicLists() → lists.is_public = true (partial index)
CREATE INDEX IF NOT EXISTS idx_lists_public ON lists(is_public) WHERE is_public = TRUE;

-- ListService.getListWithFilms(...) → list_films.list_id ORDER BY sort_order
CREATE INDEX IF NOT EXISTS idx_list_films_list_sort
    ON list_films (list_id, sort_order);

-- ─── films — search by title ─────────────────────────────────────────────
-- FilmService.searchLocal(q) uses ILIKE '%q%'. A plain btree can't help that;
-- pg_trgm + GIN does (~ms lookups on millions of rows).
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS idx_films_title_trgm
    ON films USING gin (title gin_trgm_ops);

-- ─── supabase_uid lookup on OAuth callback ───────────────────────────────
-- UNIQUE on V1 already covers this; explicit for clarity.
CREATE INDEX IF NOT EXISTS idx_users_supabase_uid ON users(supabase_uid);
