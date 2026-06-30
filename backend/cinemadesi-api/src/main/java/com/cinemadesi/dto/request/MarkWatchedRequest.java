package com.cinemadesi.dto.request;

import com.cinemadesi.entity.enums.OttPlatform;
import com.cinemadesi.entity.enums.WatchMode;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Body for {@code PATCH /api/v1/watchlist/{itemId}/watched}.
 *
 * <p>Service should: delete the watchlist item and create a new
 * {@code WatchEntry} from these fields, returning the diary entry.</p>
 */
public record MarkWatchedRequest(

        @NotNull
        LocalDate watchedAt,

        @DecimalMin(value = "0.5")
        @DecimalMax(value = "5.0")
        BigDecimal rating,

        @Size(max = 5000)
        String reviewText,

        WatchMode watchMode,

        OttPlatform ottPlatform
) {}
