package com.cinemadesi.repository;

import com.cinemadesi.entity.User;
import org.springframework.data.domain.Pageable;
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
 *   <li>{@code findByEmail}        → V1 {@code idx_users_email} + UNIQUE</li>
 *   <li>{@code findByUsername}     → V1 {@code idx_users_username} + UNIQUE</li>
 *   <li>{@code findBySupabaseUid}  → V5 {@code idx_users_supabase_uid} + UNIQUE from V1</li>
 *   <li>{@code findByGoogleId}     → V6 {@code idx_users_google_id} + UNIQUE</li>
 * </ul>
 */
@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmail(String email);

    Optional<User> findByUsername(String username);

    Optional<User> findBySupabaseUid(String supabaseUid);

    Optional<User> findByGoogleId(String googleId);

    boolean existsByEmail(String email);

    boolean existsByUsername(String username);

    /**
     * Fuzzy match across username + display name. Used by the user-search
     * typeahead. Indexes:
     * <ul>
     *   <li>V7 {@code idx_users_username_trgm} (GIN / pg_trgm)</li>
     *   <li>V7 {@code idx_users_display_name_trgm} (partial GIN / pg_trgm)</li>
     * </ul>
     */
    @Query("""
           SELECT u
             FROM User u
            WHERE LOWER(u.username)    LIKE LOWER(CONCAT('%', :q, '%'))
               OR LOWER(u.displayName) LIKE LOWER(CONCAT('%', :q, '%'))
           """)
    List<User> searchByUsernameOrDisplayName(@Param("q") String query, Pageable pageable);
}
