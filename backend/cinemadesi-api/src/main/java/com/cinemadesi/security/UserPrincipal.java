package com.cinemadesi.security;

import java.util.UUID;

/**
 * Authenticated caller identity, set into Spring's {@code SecurityContext}
 * by {@link JwtAuthFilter}. Kept intentionally minimal — anything richer
 * (display name, avatar, etc.) is fetched from the DB on demand.
 */
public record UserPrincipal(UUID userId, String email) {

    @Override
    public String toString() {
        return "UserPrincipal{id=" + userId + ", email=" + email + "}";
    }
}
