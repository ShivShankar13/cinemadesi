package com.cinemadesi.repository;

import com.cinemadesi.entity.FilmList;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * <p>Indexes backing the query methods:
 * <ul>
 *   <li>{@code findByUserIdOrderByCreatedAtDesc}    → V5 {@code idx_lists_user_id}</li>
 *   <li>{@code findByIsPublicTrueOrderByCreatedAtDesc} → V5 partial {@code idx_lists_public}</li>
 * </ul>
 */
@Repository
public interface FilmListRepository extends JpaRepository<FilmList, UUID> {

    List<FilmList> findByUserIdOrderByCreatedAtDesc(UUID userId);

    Page<FilmList> findByIsPublicTrueOrderByCreatedAtDesc(Pageable pageable);
}
