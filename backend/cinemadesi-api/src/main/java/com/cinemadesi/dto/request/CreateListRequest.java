package com.cinemadesi.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Body for {@code POST /api/v1/lists}. */
public record CreateListRequest(

        @NotBlank
        @Size(max = 255)
        String title,

        @Size(max = 2000)
        String description,

        Boolean isPublic
) {}
