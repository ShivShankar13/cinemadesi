package com.cinemadesi.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

/** Body for {@code POST /api/v1/lists/{listId}/films}. */
public record AddFilmToListRequest(

        @NotNull
        UUID filmId,

        @Size(max = 1000)
        String note,

        Integer sortOrder
) {}
