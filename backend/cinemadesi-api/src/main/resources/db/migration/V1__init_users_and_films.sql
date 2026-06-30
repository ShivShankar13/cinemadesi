-- V1 — Users and films
-- Verbatim from spec Module 2.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE users (
    id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    supabase_uid  VARCHAR(255) UNIQUE,
    email         VARCHAR(255) UNIQUE NOT NULL,
    username      VARCHAR(50)  UNIQUE NOT NULL,
    display_name  VARCHAR(100),
    avatar_url    TEXT,
    bio           TEXT,
    created_at    TIMESTAMP    DEFAULT NOW(),
    updated_at    TIMESTAMP    DEFAULT NOW()
);

CREATE TABLE films (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    tmdb_id         INTEGER      UNIQUE NOT NULL,
    title           VARCHAR(500) NOT NULL,
    original_title  VARCHAR(500),
    language        VARCHAR(10),
    industry        VARCHAR(50),
    release_date    DATE,
    poster_url      TEXT,
    backdrop_url    TEXT,
    overview        TEXT,
    genres          TEXT[],
    director        VARCHAR(255),
    runtime_minutes INTEGER,
    created_at      TIMESTAMP    DEFAULT NOW()
);

-- Already-unique columns auto-create btree indexes; these are duplicates
-- of those, kept here to match the spec exactly.
CREATE INDEX idx_films_tmdb_id  ON films(tmdb_id);
CREATE INDEX idx_films_industry ON films(industry);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email    ON users(email);
