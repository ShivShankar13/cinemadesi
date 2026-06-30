package com.cinemadesi.dto.response;

import com.cinemadesi.entity.enums.RecommendationStatus;

import java.time.Instant;
import java.util.UUID;

/**
 * A single recommendation row, shown in inbox / sent lists.
 *
 * <p>Exactly one of {@code toUser} / {@code toGroup} is non-null,
 * mirroring the underlying constraint.</p>
 */
public record RecommendationResponse(
        UUID id,
        UserSummaryResponse fromUser,
        UserSummaryResponse toUser,
        GroupSummaryResponse toGroup,
        FilmSummaryResponse film,
        String note,
        RecommendationStatus status,
        Instant createdAt
) {}
