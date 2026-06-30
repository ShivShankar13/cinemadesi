package com.cinemadesi.dto.response;

import com.cinemadesi.entity.enums.OttPlatform;
import com.cinemadesi.entity.enums.WatchMode;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

/** One diary entry on a profile / feed. */
public record DiaryEntryResponse(
        UUID id,
        FilmSummaryResponse film,
        UserSummaryResponse user,
        LocalDate watchedAt,
        BigDecimal rating,
        String reviewText,
        WatchMode watchMode,
        OttPlatform ottPlatform,
        Boolean containsSpoilers,
        Instant createdAt
) {}
