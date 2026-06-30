package com.cinemadesi.dto.request;

import jakarta.validation.constraints.NotBlank;

/**
 * Body for {@code POST /api/v1/auth/oauth/google}.
 * The frontend (NextAuth) obtains a Google ID token via the standard
 * OAuth flow and forwards it here. The backend verifies signature +
 * audience against Google's tokeninfo endpoint, then issues our own JWT.
 */
public record GoogleAuthRequest(
        @NotBlank
        String idToken
) {}
