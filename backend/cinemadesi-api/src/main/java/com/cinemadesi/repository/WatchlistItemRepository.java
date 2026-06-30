package com.cinemadesi.repository;

import com.cinemadesi.entity.WatchlistItem;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * <p>Indexes backing the query methods:
 * <ul>
 *   <li>{@code findByUserIdOrderByAddedAtDesc}  → V5 composite {@code (user_id, added_at DESC)}</li>
 *   <li>{@code findByUserIdAndFilmId}           → V2 UNIQUE(user_id, film_id)</li>
 *   <li>{@code existsByUserIdAndFilmId}         → same UNIQUE</li>
 *   <li>Merged/common-watchlist queries        → V2 {@code idx_watchlist_user_id} + the unique</li>
 * </ul>
 */
@Repository
public interface WatchlistItemRepository extends JpaRepository<WatchlistItem, UUID> {

    @EntityGraph(attributePaths = {"film", "recommendedBy"})
    List<WatchlistItem> findByUserIdOrderByAddedAtDesc(UUID userId);

    Optional<WatchlistItem> findByUserIdAndFilmId(UUID userId, UUID filmId);

    boolean existsByUserIdAndFilmId(UUID userId, UUID filmId);

    /**
     * Merged watchlist for a group — every member's watchlist items.
     * Returns raw rows; service aggregates by film and stacks the
     * {@code addedBy} avatars.
     */
    @Query("""
           SELECT w
             FROM WatchlistItem w
             JOIN FETCH w.film f
             JOIN FETCH w.user u
            WHERE w.user.id IN (
                SELECT gm.user.id
                  FROM GroupMember gm
                 WHERE gm.group.id = :groupId
            )
            ORDER BY w.addedAt DESC
           """)
    List<WatchlistItem> findGroupMergedWatchlist(@Param("groupId") UUID groupId);
}
