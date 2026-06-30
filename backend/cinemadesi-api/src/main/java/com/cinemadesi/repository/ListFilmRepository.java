package com.cinemadesi.repository;

import com.cinemadesi.entity.ListFilm;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * <p>Indexes backing the query methods:
 * <ul>
 *   <li>{@code findByListIdOrderBySortOrderAsc} → V5 composite {@code idx_list_films_list_sort}</li>
 *   <li>{@code deleteByListIdAndFilmId}          → same composite</li>
 * </ul>
 */
@Repository
public interface ListFilmRepository extends JpaRepository<ListFilm, UUID> {

    @EntityGraph(attributePaths = {"film"})
    List<ListFilm> findByListIdOrderBySortOrderAsc(UUID listId);

    long deleteByListIdAndFilmId(UUID listId, UUID filmId);

    long countByListId(UUID listId);
}
