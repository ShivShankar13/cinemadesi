package com.cinemadesi.dto.response;

import java.util.UUID;

/**
 * Full profile shown on {@code /profile/{username}} and returned by
 * {@code GET /api/v1/auth/me}.
 *
 * <p>{@code isFollowedByMe} is meaningful only when the request is
 * authenticated and the caller is not viewing their own profile.</p>
 */
public record UserProfileResponse(
        UUID id,
        String username,
        String displayName,
        String avatarUrl,
        String bio,
        String email,
        int totalFilmsWatched,
        int totalFollowers,
        int totalFollowing,
        Boolean isFollowedByMe
) {}
