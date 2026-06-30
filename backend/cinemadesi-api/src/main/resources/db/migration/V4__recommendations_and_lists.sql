-- V4 — Recommendations + curated lists
-- Verbatim from spec Module 2.

CREATE TABLE recommendations (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    from_user_id  UUID        NOT NULL REFERENCES users(id),
    to_user_id    UUID        REFERENCES users(id),
    to_group_id   UUID        REFERENCES groups(id),
    film_id       UUID        NOT NULL REFERENCES films(id),
    note          TEXT,
    status        VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING','SAVED','DISMISSED')),
    created_at    TIMESTAMP   DEFAULT NOW(),
    CONSTRAINT rec_target_check CHECK (to_user_id IS NOT NULL OR to_group_id IS NOT NULL)
);

CREATE TABLE lists (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title       VARCHAR(255) NOT NULL,
    description TEXT,
    is_public   BOOLEAN      DEFAULT TRUE,
    created_at  TIMESTAMP    DEFAULT NOW()
);

CREATE TABLE list_films (
    id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    list_id     UUID    NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
    film_id     UUID    NOT NULL REFERENCES films(id),
    sort_order  INTEGER DEFAULT 0,
    note        TEXT,
    UNIQUE(list_id, film_id)
);
