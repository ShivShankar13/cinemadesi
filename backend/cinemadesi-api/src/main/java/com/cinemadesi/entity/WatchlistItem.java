package com.cinemadesi.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.List;

/**
 * A film a user wants to watch later. Unique per (user, film).
 *
 * <p>{@code recommendedBy} is set when the item originated from a
 * {@code Recommendation} that the recipient saved.</p>
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(
        name = "watchlist_items",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_watchlist_user_film",
                columnNames = {"user_id", "film_id"}
        )
)
public class WatchlistItem extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "film_id", nullable = false)
    private Film film;

    @CreationTimestamp
    @Column(name = "added_at", updatable = false)
    private Instant addedAt;

    /** Free-form mood tags (e.g. {@code FEEL_GOOD}, {@code THRILLER}). */
    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "mood_tags", columnDefinition = "text[]")
    private List<String> moodTags;

    /** Null when the user added the film themselves. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recommended_by")
    private User recommendedBy;
}
