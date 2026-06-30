package com.cinemadesi.repository;

import com.cinemadesi.entity.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * <p>Indexes backing the query methods:
 * <ul>
 *   <li>{@code findByTokenHash} → V7 UNIQUE on token_hash</li>
 * </ul>
 */
@Repository
public interface PasswordResetTokenRepository
        extends JpaRepository<PasswordResetToken, UUID> {

    Optional<PasswordResetToken> findByTokenHash(String tokenHash);
}
