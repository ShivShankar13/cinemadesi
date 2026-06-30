package com.cinemadesi.repository;

import com.cinemadesi.entity.Recommendation;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * <p>Indexes backing the query methods:
 * <ul>
 *   <li>{@code findByToUserIdOrderByCreatedAtDesc}   → V5 {@code idx_recommendations_to_user_created}</li>
 *   <li>{@code findByFromUserIdOrderByCreatedAtDesc} → V5 {@code idx_recommendations_from_user_created}</li>
 *   <li>{@code findByToGroupIdOrderByCreatedAtDesc}  → V5 {@code idx_recommendations_to_group_created}</li>
 * </ul>
 */
@Repository
public interface RecommendationRepository extends JpaRepository<Recommendation, UUID> {

    @EntityGraph(attributePaths = {"fromUser", "toUser", "toGroup", "film"})
    List<Recommendation> findByToUserIdOrderByCreatedAtDesc(UUID toUserId);

    @EntityGraph(attributePaths = {"fromUser", "toUser", "toGroup", "film"})
    List<Recommendation> findByFromUserIdOrderByCreatedAtDesc(UUID fromUserId);

    @EntityGraph(attributePaths = {"fromUser", "toUser", "toGroup", "film"})
    List<Recommendation> findByToGroupIdOrderByCreatedAtDesc(UUID toGroupId);
}
