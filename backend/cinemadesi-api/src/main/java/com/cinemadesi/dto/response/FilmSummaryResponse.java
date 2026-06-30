package com.cinemadesi.dto.response;

import com.cinemadesi.entity.enums.Industry;

import java.time.LocalDate;
import java.util.UUID;

/**
 * Lightweight film card payload — used everywhere films appear
 * embedded (diary entries, watchlist, recommendations, group lists).
 */
public record FilmSummaryResponse(
        UUID id,
        Integer tmdbId,
        String title,
        Industry industry,
        String language,
        LocalDate releaseDate,
        String posterUrl
) {}
