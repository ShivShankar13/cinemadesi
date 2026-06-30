package com.cinemadesi.controller;

import com.cinemadesi.dto.request.ForgotPasswordRequest;
import com.cinemadesi.dto.request.GoogleAuthRequest;
import com.cinemadesi.dto.request.LoginRequest;
import com.cinemadesi.dto.request.RegisterRequest;
import com.cinemadesi.dto.request.ResetPasswordRequest;
import com.cinemadesi.dto.response.AuthResponse;
import com.cinemadesi.dto.response.UserProfileResponse;
import com.cinemadesi.service.AuthService;

import java.util.Map;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService auth;

    public AuthController(AuthService auth) {
        this.auth = auth;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(auth.register(request));
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return auth.login(request);
    }

    /**
     * Exchange a Google ID token (obtained client-side via NextAuth's
     * Google provider) for an application JWT. First-time visitors are
     * auto-registered with a username derived from their email.
     */
    @PostMapping("/oauth/google")
    public AuthResponse google(@Valid @RequestBody GoogleAuthRequest request) {
        return auth.loginWithGoogle(request);
    }

    @PostMapping("/refresh")
    public AuthResponse refresh() {
        return auth.refresh();
    }

    @GetMapping("/me")
    public UserProfileResponse me() {
        return auth.me();
    }

    /**
     * Always returns 200 with a generic message — never confirms or denies
     * whether an account exists for the given email (anti-enumeration).
     */
    @PostMapping("/forgot-password")
    public Map<String, String> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request
    ) {
        auth.forgotPassword(request);
        return Map.of(
                "message",
                "If that email is registered, you'll receive a reset link shortly."
        );
    }

    @PostMapping("/reset-password")
    public Map<String, String> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request
    ) {
        auth.resetPassword(request);
        return Map.of("message", "Password updated. You can sign in now.");
    }
}
