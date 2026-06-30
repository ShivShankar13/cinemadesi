package com.cinemadesi.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;

/**
 * Application user. Synced from Supabase Auth via {@code supabaseUid}
 * for OAuth flows, or registered locally with a BCrypt password.
 *
 * <p>{@code passwordHash} is nullable so users who signed in only via
 * Google never need a local password.</p>
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "users")
public class User extends BaseEntity {

    @Column(name = "supabase_uid", unique = true)
    private String supabaseUid;

    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @Column(name = "username", nullable = false, unique = true, length = 50)
    private String username;

    @Column(name = "display_name", length = 100)
    private String displayName;

    @Column(name = "avatar_url", columnDefinition = "TEXT")
    private String avatarUrl;

    @Column(name = "bio", columnDefinition = "TEXT")
    private String bio;

    /**
     * BCrypt-hashed password. Null for OAuth-only accounts.
     * Not present in the original V1 migration — added in a later
     * migration alongside local auth (Module 5).
     */
    @Column(name = "password_hash")
    private String passwordHash;

    /**
     * Google {@code sub} claim — stable opaque identifier from Google
     * OAuth. Null for users who never signed in via Google. Added in V6.
     */
    @Column(name = "google_id", unique = true)
    private String googleId;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;
}
