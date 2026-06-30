package com.cinemadesi.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Body for {@code POST /api/v1/groups}. */
public record CreateGroupRequest(

        @NotBlank
        @Size(max = 100)
        String name,

        @Size(max = 2000)
        String description,

        String coverImageUrl
) {}
