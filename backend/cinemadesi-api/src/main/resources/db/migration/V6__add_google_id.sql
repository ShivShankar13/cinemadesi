-- V6 — Google OAuth identity column.
--
-- Stores the Google `sub` claim (a stable opaque ID) for users who sign
-- in via Google. Nullable: email/password users never carry one.
-- UNIQUE auto-creates a btree index, but we add an explicit one for
-- clarity (matches the pattern used for username/email in V1).

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE;

CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
