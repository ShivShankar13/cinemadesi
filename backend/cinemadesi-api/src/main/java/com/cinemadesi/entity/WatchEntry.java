package com.cinemadesi.entity;

import com.cinemadesi.entity.enums.OttPlatform;
import com.cinemadesi.entity.enums.WatchMode;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

/**
 * A single diary entry — one user marking that they watched one film
 * on a given day, with an optional rating, review, and mode.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "watch_entries")
public class WatchEntry extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "film_id", nullable = false)
    private Film film;

    @Column(name = "watched_at", nullable = false)
    private LocalDate watchedAt;

    /** 0.5 → 5.0, half-star granularity. Nullable. */
    @Column(name = "rating", precision = 3, scale = 1)
    private BigDecimal rating;

    @Column(name = "review_text", columnDefinition = "TEXT")
    private String reviewText;

    @Enumerated(EnumType.STRING)
    @Column(name = "watch_mode", length = 20)
    private WatchMode watchMode;

    @Enumerated(EnumType.STRING)
    @Column(name = "ott_platform", length = 50)
    private OttPlatform ottPlatform;

    @Column(name = "contains_spoilers", nullable = false)
    @Builder.Default
    private Boolean containsSpoilers = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;
}
