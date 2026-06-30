package com.cinemadesi.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.util.Collections;
import java.util.Map;

/**
 * Pulls the Bearer token, validates it, and populates the
 * {@code SecurityContext} with a {@link UserPrincipal}.
 *
 * <p>On bad/expired tokens this filter rejects the request with a JSON
 * 401 (never redirects). Missing token is fine — the chain proceeds and
 * downstream authorisation rules decide whether the route is public.</p>
 */
@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private static final String BEARER = "Bearer ";

    private final JwtUtil jwt;
    private final ObjectMapper objectMapper;

    public JwtAuthFilter(JwtUtil jwt, ObjectMapper objectMapper) {
        this.jwt = jwt;
        this.objectMapper = objectMapper;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain chain
    ) throws ServletException, IOException {

        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (header == null || !header.startsWith(BEARER)) {
            chain.doFilter(request, response);
            return;
        }

        String token = header.substring(BEARER.length());

        try {
            var claims = jwt.parse(token);
            var principal = new UserPrincipal(
                    java.util.UUID.fromString(claims.getSubject()),
                    claims.get("email", String.class)
            );
            var auth = new UsernamePasswordAuthenticationToken(
                    principal,
                    null,
                    Collections.emptyList() // roles handled at method/route level for now
            );
            SecurityContextHolder.getContext().setAuthentication(auth);
        } catch (JwtException ex) {
            writeJsonError(response, "Invalid or expired token");
            return;
        }

        chain.doFilter(request, response);
    }

    private void writeJsonError(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        objectMapper.writeValue(response.getWriter(), Map.of(
                "status",    HttpStatus.UNAUTHORIZED.value(),
                "message",   message,
                "timestamp", Instant.now().toString()
        ));
    }
}
