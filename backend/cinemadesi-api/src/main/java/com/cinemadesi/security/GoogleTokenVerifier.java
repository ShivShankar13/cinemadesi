package com.cinemadesi.security;

import com.cinemadesi.exception.UnauthorizedException;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.Set;

/**
 * Verifies a Google-issued ID token by delegating to Google's
 * {@code tokeninfo} endpoint. Simpler than running our own JWKS cache
 * + RSA verification, and good enough for a non-high-traffic app — the
 * endpoint is rate-limited but free, and the round trip is sub-100ms.
 *
 * <p>If {@code app.google.client-id} is not configured the audience
 * check is skipped (with a warning) so local dev still works; in
 * production the env var should always be set.</p>
 */
@Component
public class GoogleTokenVerifier {

    private static final Logger log = LoggerFactory.getLogger(GoogleTokenVerifier.class);
    private static final Set<String> VALID_ISSUERS =
            Set.of("https://accounts.google.com", "accounts.google.com");

    private final RestClient client;
    private final String expectedAudience;

    public GoogleTokenVerifier(@Value("${app.google.client-id:}") String clientId) {
        this.client = RestClient.builder()
                .baseUrl("https://oauth2.googleapis.com")
                .build();
        this.expectedAudience = clientId == null ? "" : clientId.trim();
    }

    public GoogleTokenPayload verify(String idToken) {
        if (idToken == null || idToken.isBlank()) {
            throw new UnauthorizedException("Missing Google ID token");
        }

        GoogleTokenPayload payload;
        try {
            payload = client.get()
                    .uri(b -> b.path("/tokeninfo").queryParam("id_token", idToken).build())
                    .retrieve()
                    .body(GoogleTokenPayload.class);
        } catch (RestClientException ex) {
            log.warn("Google tokeninfo call failed: {}", ex.getMessage());
            throw new UnauthorizedException("Could not verify Google token");
        }

        if (payload == null || payload.sub == null || payload.email == null) {
            throw new UnauthorizedException("Invalid Google token");
        }
        if (payload.iss == null || !VALID_ISSUERS.contains(payload.iss)) {
            throw new UnauthorizedException("Invalid token issuer");
        }
        if (!"true".equalsIgnoreCase(payload.emailVerified)) {
            throw new UnauthorizedException("Google email not verified");
        }
        if (expectedAudience.isEmpty()) {
            log.warn("app.google.client-id not configured — skipping audience check");
        } else if (!expectedAudience.equals(payload.aud)) {
            throw new UnauthorizedException("Token audience mismatch");
        }
        return payload;
    }

    /** Subset of the fields Google's tokeninfo returns. */
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class GoogleTokenPayload {
        public String iss;
        public String aud;
        public String sub;
        public String email;
        @JsonProperty("email_verified") public String emailVerified;
        public String name;
        public String picture;
        @JsonProperty("given_name")  public String givenName;
        @JsonProperty("family_name") public String familyName;
    }
}
