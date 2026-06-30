package com.cinemadesi.dto.response;

import java.util.List;

/**
 * One row in a group's merged watchlist — a film with the members
 * who have it on their personal watchlist.
 *
 * <p>Used by both {@code GET /groups/{id}/watchlist} (all member items)
 * and {@code GET /groups/{id}/common} (only films with memberCount &gt;= 2,
 * sorted DESC).</p>
 */
public record GroupWatchlistItemResponse(
        FilmSummaryResponse film,
        List<UserSummaryResponse> addedBy,
        int memberCount
) {}
