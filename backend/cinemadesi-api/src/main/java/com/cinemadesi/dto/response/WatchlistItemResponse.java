package com.cinemadesi.dto.response;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/** One row in a user's watchlist. */
public record WatchlistItemResponse(
        UUID id,
        FilmSummaryResponse film,
        Instant addedAt,
        List<String> moodTags,
        /** Null when the user added it themselves (not from a recommendation). */
        UserSummaryResponse recommendedBy
) {}
