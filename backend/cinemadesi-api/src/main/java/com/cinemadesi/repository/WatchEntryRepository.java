package com.cinemadesi.repository;

import com.cinemadesi.entity.WatchEntry;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * <p>Indexes backing the query methods:
 * <ul>
 *   <li>{@code findByUserIdOrderByCreatedAtDesc}      → V5 composite {@code (user_id, created_at DESC)}</li>
 *   <li>{@code findByUserIdInOrderByCreatedAtDesc}    → same composite, used for IN-list feeds</li>
 *   <li>{@code findByFilmId} (community reviews)      → V2 {@code idx_watch_entries_film_id}</li>
 *   <li>{@code findByUserIdAndFilmId}                 → V5 {@code idx_watch_entries_user_film}</li>
 *   <li>{@code countByUserId}                         → V2 {@code idx_watch_entries_user_id}</li>
 * </ul>
 *
 * <p>{@code @EntityGraph} pre-joins film + user to avoid N+1 when rendering feeds.</p>
 */
@Repository
public interface WatchEntryRepository extends JpaRepository<WatchEntry, UUID> {

    @EntityGraph(attributePaths = {"film", "user"})
    Page<WatchEntry> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);

    @EntityGraph(attributePaths = {"film", "user"})
    Page<WatchEntry> findByUserIdInOrderByCreatedAtDesc(Collection<UUID> userIds, Pageable pageable);

    @EntityGraph(attributePaths = {"film", "user"})
    Page<WatchEntry> findByFilmIdOrderByCreatedAtDesc(UUID filmId, Pageable pageable);

    Optional<WatchEntry> findByUserIdAndFilmId(UUID userId, UUID filmId);

    long countByUserId(UUID userId);

    /**
     * Used by GroupService.groupFeed — entries from any member of the group,
     * resolved via {@code group_members} join.
     */
    @Query("""
           SELECT w
             FROM WatchEntry w
             JOIN FETCH w.user u
             JOIN FETCH w.film f
            WHERE w.user.id IN (
                SELECT gm.user.id
                  FROM GroupMember gm
                 WHERE gm.group.id = :groupId
            )
            ORDER BY w.createdAt DESC
           """)
    Page<WatchEntry> findGroupFeed(@Param("groupId") UUID groupId, Pageable pageable);

    /**
     * Public review feed on a film detail page.
     */
    @Query("""
           SELECT w
             FROM WatchEntry w
             JOIN FETCH w.user u
            WHERE w.film.id = :filmId
              AND w.reviewText IS NOT NULL
            ORDER BY w.createdAt DESC
           """)
    List<WatchEntry> findReviewsForFilm(@Param("filmId") UUID filmId, Pageable pageable);
}
