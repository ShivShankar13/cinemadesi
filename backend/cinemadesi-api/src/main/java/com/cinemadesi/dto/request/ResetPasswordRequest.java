package com.cinemadesi.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Body for {@code POST /api/v1/auth/reset-password}. */
public record ResetPasswordRequest(
        @NotBlank
        String token,

        @NotBlank
        @Size(min = 8, message = "password must be at least 8 characters")
        String password
) {}
