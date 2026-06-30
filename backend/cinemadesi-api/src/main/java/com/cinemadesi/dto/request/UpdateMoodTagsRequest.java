package com.cinemadesi.dto.request;

import jakarta.validation.constraints.NotNull;

import java.util.List;

/**
 * Body for {@code PATCH /api/v1/watchlist/{itemId}/mood-tags}.
 * Replaces the whole tag set — empty list clears all tags.
 */
public record UpdateMoodTagsRequest(

        @NotNull
        List<String> moodTags
) {}
