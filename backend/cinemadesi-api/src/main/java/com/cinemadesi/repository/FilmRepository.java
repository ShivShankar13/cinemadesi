package com.cinemadesi.repository;

import com.cinemadesi.entity.Film;
import com.cinemadesi.entity.enums.Industry;
import org.springframework.data.domain.Page;
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
 *   <li>{@code findByTmdbId}                → V1 {@code idx_films_tmdb_id} + UNIQUE</li>
 *   <li>{@code findByIndustry(..., page)}   → V1 {@code idx_films_industry}</li>
 *   <li>{@link #searchByTitle(String, Pageable)} ILIKE → V5 {@code idx_films_title_trgm} (GIN/pg_trgm)</li>
 * </ul>
 */
@Repository
public interface FilmRepository extends JpaRepository<Film, UUID> {

    Optional<Film> findByTmdbId(Integer tmdbId);

    Page<Film> findByIndustry(Industry industry, Pageable pageable);

    /**
     * Fuzzy title search. Uses the trigram index for sub-linear matching;
     * runs as a plain ILIKE on tiny tables, which is fine.
     */
    @Query("""
           SELECT f
             FROM Film f
            WHERE LOWER(f.title) LIKE LOWER(CONCAT('%', :q, '%'))
               OR LOWER(f.originalTitle) LIKE LOWER(CONCAT('%', :q, '%'))
           """)
    Page<Film> searchByTitle(@Param("q") String query, Pageable pageable);

    /**
     * Same as {@link #searchByTitle} but filters by industry <em>before</em>
     * pagination — otherwise a "Tamil only" search on a mixed page returns
     * a partial slice rather than 20 Tamil films.
     */
    @Query("""
           SELECT f
             FROM Film f
            WHERE f.industry = :industry
              AND (LOWER(f.title) LIKE LOWER(CONCAT('%', :q, '%'))
                OR LOWER(f.originalTitle) LIKE LOWER(CONCAT('%', :q, '%')))
           """)
    Page<Film> searchByTitleAndIndustry(
            @Param("q") String query,
            @Param("industry") Industry industry,
            Pageable pageable
    );

    List<Film> findTop10ByOrderByCreatedAtDesc();
}
