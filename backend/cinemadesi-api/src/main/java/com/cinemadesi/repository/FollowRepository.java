package com.cinemadesi.repository;

import com.cinemadesi.entity.Follow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * <p>Indexes backing the query methods:
 * <ul>
 *   <li>{@code findByFollowerId(...)}              → V3 {@code idx_follows_follower}</li>
 *   <li>{@code findByFollowingId(...)}             → V3 {@code idx_follows_following}</li>
 *   <li>{@code existsByFollowerIdAndFollowingId}   → V3 UNIQUE(follower_id, following_id)</li>
 *   <li>{@code countBy*}                            → indexes above</li>
 *   <li>{@link #findFollowingIds(UUID)}             → V3 {@code idx_follows_follower}</li>
 * </ul>
 */
@Repository
public interface FollowRepository extends JpaRepository<Follow, UUID> {

    boolean existsByFollowerIdAndFollowingId(UUID followerId, UUID followingId);

    long deleteByFollowerIdAndFollowingId(UUID followerId, UUID followingId);

    long countByFollowerId(UUID followerId);

    long countByFollowingId(UUID followingId);

    List<Follow> findByFollowerId(UUID followerId);

    List<Follow> findByFollowingId(UUID followingId);

    /**
     * IDs of users the given user follows. Used by FeedService to build the
     * IN-list passed to {@code WatchEntryRepository.findByUserIdInOrderByCreatedAtDesc}.
     */
    @Query("""
           SELECT f.following.id
             FROM Follow f
            WHERE f.follower.id = :userId
           """)
    List<UUID> findFollowingIds(@Param("userId") UUID userId);
}
