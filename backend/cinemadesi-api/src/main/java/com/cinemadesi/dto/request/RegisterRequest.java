package com.cinemadesi.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** Body for {@code POST /api/v1/auth/register}. */
public record RegisterRequest(

        @NotBlank
        @Email
        String email,

        @NotBlank
        @Size(min = 8, message = "password must be at least 8 characters")
        String password,

        @NotBlank
        @Pattern(
                regexp = "^[a-z0-9_]{3,30}$",
                message = "username must be 3-30 chars, lowercase letters / digits / underscore only"
        )
        String username,

        String displayName
) {}
