package com.cinemadesi.dto.response;

/** Returned by {@code POST /auth/register}, {@code /auth/login}, and {@code /auth/refresh}. */
public record AuthResponse(
        String accessToken,
        String tokenType,        // always "Bearer"
        long   expiresInSeconds,
        UserProfileResponse user
) {
    public static AuthResponse bearer(String token, long expiresInSeconds, UserProfileResponse user) {
        return new AuthResponse(token, "Bearer", expiresInSeconds, user);
    }
}
