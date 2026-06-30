package com.cinemadesi.dto.response;

import java.util.UUID;

/**
 * Compact user reference embedded in feed items, group rosters,
 * recommendation cards, etc. Keep it small — never embed a full profile.
 */
public record UserSummaryResponse(
        UUID id,
        String username,
        String displayName,
        String avatarUrl
) {}
