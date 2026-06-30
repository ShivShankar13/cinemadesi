package com.cinemadesi.dto.response;

import java.util.UUID;

/** A single film row inside a {@link ListResponse}. */
public record ListFilmResponse(
        UUID id,
        FilmSummaryResponse film,
        Integer sortOrder,
        String note
) {}
