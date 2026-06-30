package com.cinemadesi.service;

import com.cinemadesi.dto.request.ForgotPasswordRequest;
import com.cinemadesi.dto.request.GoogleAuthRequest;
import com.cinemadesi.dto.request.LoginRequest;
import com.cinemadesi.dto.request.RegisterRequest;
import com.cinemadesi.dto.request.ResetPasswordRequest;
import com.cinemadesi.dto.response.AuthResponse;
import com.cinemadesi.dto.response.UserProfileResponse;
import com.cinemadesi.entity.PasswordResetToken;
import com.cinemadesi.entity.User;
import com.cinemadesi.exception.ResourceNotFoundException;
import com.cinemadesi.exception.UnauthorizedException;
import com.cinemadesi.mapper.UserMapper;
import com.cinemadesi.repository.FollowRepository;
import com.cinemadesi.repository.PasswordResetTokenRepository;
import com.cinemadesi.repository.UserRepository;
import com.cinemadesi.repository.WatchEntryRepository;
import com.cinemadesi.security.CurrentUserProvider;
import com.cinemadesi.security.GoogleTokenVerifier;
import com.cinemadesi.security.JwtUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.UUID;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);
    private static final long RESET_TOKEN_TTL_MINUTES = 30;
    private static final SecureRandom RNG = new SecureRandom();

    private final UserRepository              userRepo;
    private final FollowRepository            followRepo;
    private final WatchEntryRepository        watchEntryRepo;
    private final PasswordResetTokenRepository resetRepo;
    private final PasswordEncoder             passwordEncoder;
    private final JwtUtil                     jwt;
    private final UserMapper                  userMapper;
    private final CurrentUserProvider         current;
    private final GoogleTokenVerifier         google;
    private final EmailService                email;
    private final String                      appBaseUrl;

    public AuthService(
            UserRepository userRepo,
            FollowRepository followRepo,
            WatchEntryRepository watchEntryRepo,
            PasswordResetTokenRepository resetRepo,
            PasswordEncoder passwordEncoder,
            JwtUtil jwt,
            UserMapper userMapper,
            CurrentUserProvider current,
            GoogleTokenVerifier google,
            EmailService email,
            @Value("${app.frontend.base-url:http://localhost:3000}") String appBaseUrl
    ) {
        this.userRepo        = userRepo;
        this.followRepo      = followRepo;
        this.watchEntryRepo  = watchEntryRepo;
        this.resetRepo       = resetRepo;
        this.passwordEncoder = passwordEncoder;
        this.jwt             = jwt;
        this.userMapper      = userMapper;
        this.current         = current;
        this.google          = google;
        this.email           = email;
        this.appBaseUrl      = appBaseUrl;
    }

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        if (userRepo.existsByEmail(req.email())) {
            throw new IllegalArgumentException("email already registered");
        }
        if (userRepo.existsByUsername(req.username())) {
            throw new IllegalArgumentException("username already taken");
        }
        User user = User.builder()
                .email(req.email())
                .username(req.username())
                .displayName(req.displayName())
                .passwordHash(passwordEncoder.encode(req.password()))
                .build();
        user = userRepo.save(user);
        return buildAuthResponse(user);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest req) {
        User user = userRepo.findByEmail(req.email())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));
        if (user.getPasswordHash() == null
                || !passwordEncoder.matches(req.password(), user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid email or password");
        }
        return buildAuthResponse(user);
    }

    @Transactional(readOnly = true)
    public AuthResponse refresh() {
        // Stateless JWT — refresh just re-issues a new token for the current user.
        // Once we add refresh-token rotation this becomes a real flow.
        UUID userId = current.requireUserId();
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("user", userId));
        return buildAuthResponse(user);
    }

    /**
     * Sign-in (or sign-up on first visit) via a Google ID token. The
     * frontend gets the token from NextAuth's Google provider and POSTs
     * it here.
     *
     * <p>If the Google {@code sub} is already linked to a user, return
     * that. Otherwise, if an email-account exists with the same address,
     * backfill {@code googleId} onto it (link the accounts). Otherwise
     * create a fresh user with a username derived from the email local-part.</p>
     */
    @Transactional
    public AuthResponse loginWithGoogle(GoogleAuthRequest req) {
        GoogleTokenVerifier.GoogleTokenPayload payload = google.verify(req.idToken());

        User user = userRepo.findByGoogleId(payload.sub)
                .orElseGet(() -> userRepo.findByEmail(payload.email)
                        .map(existing -> {
                            existing.setGoogleId(payload.sub);
                            // also opportunistically fill in profile bits we have
                            if (existing.getDisplayName() == null) existing.setDisplayName(payload.name);
                            if (existing.getAvatarUrl() == null)   existing.setAvatarUrl(payload.picture);
                            return existing;
                        })
                        .orElseGet(() -> userRepo.save(User.builder()
                                .email(payload.email)
                                .username(generateUniqueUsername(payload.email))
                                .displayName(payload.name)
                                .avatarUrl(payload.picture)
                                .googleId(payload.sub)
                                .build())));

        return buildAuthResponse(user);
    }

    @Transactional(readOnly = true)
    public UserProfileResponse me() {
        UUID userId = current.requireUserId();
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("user", userId));
        return toProfile(user, /*isFollowedByMe*/ null);
    }

    // ---- internals ----------------------------------------------------------

    private AuthResponse buildAuthResponse(User user) {
        String token = jwt.generateToken(user.getId(), user.getEmail());
        return AuthResponse.bearer(token, jwt.expiresInSeconds(), toProfile(user, null));
    }

    private UserProfileResponse toProfile(User user, Boolean isFollowedByMe) {
        return userMapper.toProfile(
                user,
                (int) watchEntryRepo.countByUserId(user.getId()),
                (int) followRepo.countByFollowingId(user.getId()),
                (int) followRepo.countByFollowerId(user.getId()),
                isFollowedByMe
        );
    }

    /**
     * Issue a one-time password-reset token. Always succeeds — even if no
     * user exists with the email — to prevent account-enumeration attacks.
     *
     * <p>The raw token is returned to the caller via an out-of-band channel
     * (here: a log line; in production: an email). We persist only its
     * SHA-256 hash so a DB leak can't be replayed.</p>
     */
    @Transactional
    public void forgotPassword(ForgotPasswordRequest req) {
        userRepo.findByEmail(req.email()).ifPresent(user -> {
            String rawToken = generateRawToken();
            String tokenHash = sha256(rawToken);
            resetRepo.save(PasswordResetToken.builder()
                    .user(user)
                    .tokenHash(tokenHash)
                    .expiresAt(Instant.now().plus(RESET_TOKEN_TTL_MINUTES, ChronoUnit.MINUTES))
                    .build());

            String resetUrl = appBaseUrl + "/reset-password?token=" + rawToken;

            // Keep the log line — useful for local dev when mail isn't configured,
            // and for debugging delivery in prod.
            log.info("[PASSWORD RESET] email={} url={}", user.getEmail(), resetUrl);

            // Actually send the email. If MAIL_USERNAME is blank, EmailService
            // logs a skip-warning and returns — the URL is still recoverable
            // from the line above.
            email.sendPasswordReset(user.getEmail(), user.getDisplayName(), resetUrl);
        });
        // Identical response shape whether or not the email exists.
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest req) {
        PasswordResetToken token = resetRepo.findByTokenHash(sha256(req.token()))
                .orElseThrow(() -> new UnauthorizedException("Invalid or expired reset link"));

        if (token.getUsedAt() != null) {
            throw new UnauthorizedException("This reset link has already been used");
        }
        if (token.getExpiresAt().isBefore(Instant.now())) {
            throw new UnauthorizedException("This reset link has expired");
        }

        User user = token.getUser();
        user.setPasswordHash(passwordEncoder.encode(req.password()));
        token.setUsedAt(Instant.now());
    }

    // ---- token helpers ------------------------------------------------------

    private static String generateRawToken() {
        byte[] bytes = new byte[32];
        RNG.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private static String sha256(String s) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] digest = md.digest(s.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder(digest.length * 2);
            for (byte b : digest) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 unavailable", e);
        }
    }

    /**
     * Derive a username from an email local-part, sanitised to the same
     * regex our register endpoint enforces, then suffixed with a number
     * until unique. Usernames generated this way never collide.
     */
    private String generateUniqueUsername(String email) {
        String local = email.split("@")[0].toLowerCase()
                .replaceAll("[^a-z0-9_]", "_");
        if (local.length() < 3)  local = local + "_user";
        if (local.length() > 25) local = local.substring(0, 25);

        String candidate = local;
        int suffix = 0;
        while (userRepo.existsByUsername(candidate)) {
            suffix++;
            candidate = local + suffix;
        }
        return candidate;
    }
}
