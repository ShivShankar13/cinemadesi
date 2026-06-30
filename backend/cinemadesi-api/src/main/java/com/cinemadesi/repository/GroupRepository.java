package com.cinemadesi.repository;

import com.cinemadesi.entity.Group;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * <p>Indexes backing the query methods:
 * <ul>
 *   <li>{@link #findGroupsByMemberId(UUID)} joins via group_members
 *       → V3 {@code idx_group_members_user_id}</li>
 * </ul>
 */
@Repository
public interface GroupRepository extends JpaRepository<Group, UUID> {

    @Query("""
           SELECT g
             FROM Group g
             JOIN GroupMember gm ON gm.group = g
            WHERE gm.user.id = :userId
            ORDER BY g.createdAt DESC
           """)
    List<Group> findGroupsByMemberId(@Param("userId") UUID userId);
}
