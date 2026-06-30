package com.cinemadesi.repository;

import com.cinemadesi.entity.GroupMember;
import com.cinemadesi.entity.enums.GroupRole;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * <p>Indexes backing the query methods:
 * <ul>
 *   <li>{@code findByGroupId(...)}              → V3 {@code idx_group_members_group_id}</li>
 *   <li>{@code findByUserId(...)}               → V3 {@code idx_group_members_user_id}</li>
 *   <li>{@code findByGroupIdAndUserId}          → V3 UNIQUE(group_id, user_id)</li>
 *   <li>{@code existsByGroupIdAndUserId}        → same UNIQUE</li>
 *   <li>{@code countByGroupId}                  → V3 {@code idx_group_members_group_id}</li>
 * </ul>
 */
@Repository
public interface GroupMemberRepository extends JpaRepository<GroupMember, UUID> {

    @EntityGraph(attributePaths = {"user"})
    List<GroupMember> findByGroupId(UUID groupId);

    List<GroupMember> findByUserId(UUID userId);

    Optional<GroupMember> findByGroupIdAndUserId(UUID groupId, UUID userId);

    boolean existsByGroupIdAndUserId(UUID groupId, UUID userId);

    boolean existsByGroupIdAndUserIdAndRole(UUID groupId, UUID userId, GroupRole role);

    long countByGroupId(UUID groupId);
}
