package com.cinemadesi.dto.response;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/** Curated film list payload, returned by {@code GET /api/v1/lists/{id}}. */
public record ListResponse(
        UUID id,
        UserSummaryResponse owner,
        String title,
        String description,
        Boolean isPublic,
        List<ListFilmResponse> films,
        int filmCount,
        Instant createdAt
) {}
