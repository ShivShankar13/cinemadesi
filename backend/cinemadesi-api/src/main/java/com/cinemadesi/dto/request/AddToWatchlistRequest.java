package com.cinemadesi.dto.request;

import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.UUID;

/** Body for {@code POST /api/v1/watchlist}. */
public record AddToWatchlistRequest(

        @NotNull
        UUID filmId,

        /** Optional mood tags, e.g. {@code ["THRILLER","INTENSE"]}. */
        List<String> moodTags
) {}
