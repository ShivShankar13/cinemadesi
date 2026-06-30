package com.cinemadesi.dto.request;

import com.cinemadesi.entity.enums.OttPlatform;
import com.cinemadesi.entity.enums.WatchMode;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Body for {@code PATCH /api/v1/diary/{entryId}}.
 * Every field is optional — null means "leave unchanged".
 */
public record UpdateDiaryEntryRequest(

        LocalDate watchedAt,

        @DecimalMin(value = "0.5")
        @DecimalMax(value = "5.0")
        BigDecimal rating,

        @Size(max = 5000)
        String reviewText,

        WatchMode watchMode,

        OttPlatform ottPlatform,

        Boolean containsSpoilers
) {}
