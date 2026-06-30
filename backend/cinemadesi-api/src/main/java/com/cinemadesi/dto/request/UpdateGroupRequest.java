package com.cinemadesi.dto.request;

import jakarta.validation.constraints.Size;

/**
 * Body for {@code PATCH /api/v1/groups/{groupId}}.
 * Every field optional — null means "leave unchanged".
 * Caller must be a group ADMIN (checked service-side).
 */
public record UpdateGroupRequest(

        @Size(max = 100)
        String name,

        @Size(max = 2000)
        String description,

        String coverImageUrl
) {}
