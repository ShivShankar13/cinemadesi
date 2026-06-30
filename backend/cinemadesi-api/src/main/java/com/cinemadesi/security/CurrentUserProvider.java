package com.cinemadesi.security;

import com.cinemadesi.exception.UnauthorizedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.UUID;

/**
 * Thin wrapper over {@link SecurityContextHolder} so services don't have
 * to know about Spring Security directly. Makes unit-testing easy — just
 * stub this bean.
 */
@Component
public class CurrentUserProvider {

    /** @return the authenticated caller, or empty if anonymous. */
    public Optional<UserPrincipal> tryGet() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) return Optional.empty();
        if (auth.getPrincipal() instanceof UserPrincipal p) return Optional.of(p);
        return Optional.empty();
    }

    /** @throws UnauthorizedException if no authenticated user is in context. */
    public UserPrincipal require() {
        return tryGet().orElseThrow(
                () -> new UnauthorizedException("Authentication required"));
    }

    public UUID requireUserId() {
        return require().userId();
    }
}
