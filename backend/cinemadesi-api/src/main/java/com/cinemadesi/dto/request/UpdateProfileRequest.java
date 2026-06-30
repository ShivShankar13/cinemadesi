package com.cinemadesi.dto.request;

import jakarta.validation.constraints.Size;

/**
 * Body for {@code PATCH /api/v1/users/me}.
 * Every field is optional — null means "leave unchanged".
 */
public record UpdateProfileRequest(

        @Size(max = 100)
        String displayName,

        @Size(max = 500)
        String bio,

        String avatarUrl
) {}
