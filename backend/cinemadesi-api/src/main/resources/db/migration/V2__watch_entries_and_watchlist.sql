-- V2 — Watch diary entries + personal watchlist
-- Verbatim from spec Module 2.

CREATE TABLE watch_entries (
    id                UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    film_id           UUID          NOT NULL REFERENCES films(id),
    watched_at        DATE          NOT NULL,
    rating            DECIMAL(3,1)  CHECK (rating >= 0.5 AND rating <= 5.0),
    review_text       TEXT,
    watch_mode        VARCHAR(20)   CHECK (watch_mode IN ('THEATRE','OTT','HOME')),
    ott_platform      VARCHAR(50),
    contains_spoilers BOOLEAN       DEFAULT FALSE,
    created_at        TIMESTAMP     DEFAULT NOW()
);

CREATE TABLE watchlist_items (
    id              UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    film_id         UUID      NOT NULL REFERENCES films(id),
    added_at        TIMESTAMP DEFAULT NOW(),
    mood_tags       TEXT[],
    recommended_by  UUID      REFERENCES users(id),
    UNIQUE(user_id, film_id)
);

CREATE INDEX idx_watch_entries_user_id ON watch_entries(user_id);
CREATE INDEX idx_watch_entries_film_id ON watch_entries(film_id);
CREATE INDEX idx_watchlist_user_id     ON watchlist_items(user_id);
