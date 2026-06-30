package com.cinemadesi.entity;

import com.cinemadesi.entity.enums.Industry;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

/**
 * Locally cached metadata for a TMDB film.
 *
 * <p>Films are pulled from TMDB on first reference and persisted so
 * subsequent lookups don't hit the external API. {@code tmdbId} is
 * the natural key from TMDB.</p>
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "films")
public class Film extends BaseEntity {

    @Column(name = "tmdb_id", nullable = false, unique = true)
    private Integer tmdbId;

    @Column(name = "title", nullable = false, length = 500)
    private String title;

    @Column(name = "original_title", length = 500)
    private String originalTitle;

    /** ISO 639-1 language code from TMDB (e.g. {@code "hi"}, {@code "ta"}). */
    @Column(name = "language", length = 10)
    private String language;

    @Enumerated(EnumType.STRING)
    @Column(name = "industry", length = 50)
    private Industry industry;

    @Column(name = "release_date")
    private LocalDate releaseDate;

    @Column(name = "poster_url", columnDefinition = "TEXT")
    private String posterUrl;

    @Column(name = "backdrop_url", columnDefinition = "TEXT")
    private String backdropUrl;

    @Column(name = "overview", columnDefinition = "TEXT")
    private String overview;

    /** Postgres {@code TEXT[]} mapped to a Java list. */
    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "genres", columnDefinition = "text[]")
    private List<String> genres;

    @Column(name = "director", length = 255)
    private String director;

    @Column(name = "runtime_minutes")
    private Integer runtimeMinutes;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;
}
