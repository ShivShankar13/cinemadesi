package com.cinemadesi.dto.response;

import com.cinemadesi.entity.enums.Industry;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/** Full film payload used by {@code GET /api/v1/films/{id}}. */
public record FilmResponse(
        UUID id,
        Integer tmdbId,
        String title,
        String originalTitle,
        String language,
        Industry industry,
        LocalDate releaseDate,
        String posterUrl,
        String backdropUrl,
        String overview,
        List<String> genres,
        String director,
        Integer runtimeMinutes
) {}
