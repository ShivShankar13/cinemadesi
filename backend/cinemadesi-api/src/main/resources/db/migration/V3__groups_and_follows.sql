-- V3 — Groups, members, follow graph
-- Verbatim from spec Module 2.

CREATE TABLE groups (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(100) NOT NULL,
    description     TEXT,
    created_by      UUID         REFERENCES users(id),
    cover_image_url TEXT,
    created_at      TIMESTAMP    DEFAULT NOW()
);

CREATE TABLE group_members (
    id        UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id  UUID        NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    user_id   UUID        NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
    role      VARCHAR(20) NOT NULL DEFAULT 'MEMBER' CHECK (role IN ('ADMIN','MEMBER')),
    joined_at TIMESTAMP   DEFAULT NOW(),
    UNIQUE(group_id, user_id)
);

CREATE TABLE follows (
    id            UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id   UUID      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    following_id  UUID      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at    TIMESTAMP DEFAULT NOW(),
    UNIQUE(follower_id, following_id)
);

CREATE INDEX idx_group_members_group_id ON group_members(group_id);
CREATE INDEX idx_group_members_user_id  ON group_members(user_id);
CREATE INDEX idx_follows_follower       ON follows(follower_id);
CREATE INDEX idx_follows_following      ON follows(following_id);
