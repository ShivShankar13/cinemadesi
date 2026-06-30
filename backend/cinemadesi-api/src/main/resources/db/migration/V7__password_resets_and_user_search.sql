-- V7 — Password reset tokens + indexes for user search.

-- Password reset flow: AuthService issues a token here with a TTL.
-- The "used_at" timestamp is set when the reset completes so the same
-- token can't be replayed. A unique index on token_hash makes lookups O(1).
CREATE TABLE password_resets (
    id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash   VARCHAR(128) NOT NULL UNIQUE,
    expires_at   TIMESTAMP    NOT NULL,
    used_at      TIMESTAMP,
    created_at   TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_password_resets_user_id ON password_resets(user_id);

-- pg_trgm extension is already enabled in V5 (for films.title).
-- Same index strategy for the user-search endpoint — supports both
-- prefix and substring matches via ILIKE '%q%'.
CREATE INDEX IF NOT EXISTS idx_users_username_trgm
    ON users USING gin (username gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_users_display_name_trgm
    ON users USING gin (display_name gin_trgm_ops)
    WHERE display_name IS NOT NULL;
