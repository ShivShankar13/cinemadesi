package com.cinemadesi.dto.request;

import com.cinemadesi.entity.enums.OttPlatform;
import com.cinemadesi.entity.enums.WatchMode;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

/** Body for {@code POST /api/v1/diary}. */
public record LogFilmRequest(

        @NotNull
        UUID filmId,

        @NotNull
        LocalDate watchedAt,

        @DecimalMin(value = "0.5", message = "rating must be at least 0.5")
        @DecimalMax(value = "5.0", message = "rating must be at most 5.0")
        BigDecimal rating,

        @Size(max = 5000)
        String reviewText,

        WatchMode watchMode,

        /** Required when {@code watchMode == OTT}; validated service-side. */
        OttPlatform ottPlatform,

        Boolean containsSpoilers
) {}
