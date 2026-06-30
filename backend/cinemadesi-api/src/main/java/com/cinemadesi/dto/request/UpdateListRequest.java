package com.cinemadesi.dto.request;

import jakarta.validation.constraints.Size;

/**
 * Body for {@code PATCH /api/v1/lists/{listId}}.
 * Every field optional — null means "leave unchanged".
 */
public record UpdateListRequest(

        @Size(max = 255)
        String title,

        @Size(max = 2000)
        String description,

        Boolean isPublic
) {}
