package com.cinemadesi.service;

import com.cinemadesi.dto.response.DiaryEntryResponse;
import com.cinemadesi.dto.response.FilmResponse;
import com.cinemadesi.dto.response.FilmSummaryResponse;
import com.cinemadesi.dto.response.PagedResponse;
import com.cinemadesi.entity.Film;
import com.cinemadesi.entity.enums.Industry;
import com.cinemadesi.exception.ResourceNotFoundException;
import com.cinemadesi.mapper.DiaryMapper;
import com.cinemadesi.mapper.FilmMapper;
import com.cinemadesi.repository.FilmRepository;
import com.cinemadesi.repository.WatchEntryRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

/**
 * Search and lookup with TMDB-as-source-of-truth fallback caching.
 *
 * <ol>
 *   <li>Search DB first via the pg_trgm GIN index on {@code films.title}.</li>
 *   <li>If we get fewer than 5 hits, ask TMDB for the same query.</li>
 *   <li>Persist any new films, then return the merged set (DB + new).</li>
 * </ol>
 */
@Service
public class FilmService {

    private static final int MIN_LOCAL_HITS = 5;

    private final FilmRepository       filmRepo;
    private final WatchEntryRepository entryRepo;
    private final TMDBService          tmdb;
    private final FilmMapper           mapper;
    private final DiaryMapper          diaryMapper;

    public FilmService(
            FilmRepository filmRepo,
            WatchEntryRepository entryRepo,
            TMDBService tmdb,
            FilmMapper mapper,
            DiaryMapper diaryMapper
    ) {
        this.filmRepo    = filmRepo;
        this.entryRepo   = entryRepo;
        this.tmdb        = tmdb;
        this.mapper      = mapper;
        this.diaryMapper = diaryMapper;
    }

    @Transactional
    public PagedResponse<FilmSummaryResponse> search(
            String query,
            Industry industry,
            int page,
            int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Film> local = runSearch(query, industry, pageable);

        // If first-page DB hits are thin, top up from TMDB and retry.
        // Industry filter is applied at the SQL level on the re-query, so
        // we don't lose Tamil-only filters to mixed TMDB results.
        if (local.getNumberOfElements() < MIN_LOCAL_HITS && page == 0) {
            cacheMissing(tmdb.search(query, null, 1));
            local = runSearch(query, industry, pageable);
        }

        return PagedResponse.from(local, mapper::toSummary);
    }

    private Page<Film> runSearch(String query, Industry industry, Pageable pageable) {
        return industry == null
                ? filmRepo.searchByTitle(query, pageable)
                : filmRepo.searchByTitleAndIndustry(query, industry, pageable);
    }

    @Transactional
    public FilmResponse getById(UUID id) {
        Film film = filmRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("film", id));
        return mapper.toResponse(film);
    }

    @Transactional
    public FilmResponse getOrFetchByTmdbId(int tmdbId) {
        Film film = filmRepo.findByTmdbId(tmdbId).orElseGet(() -> {
            var dto = tmdb.getById(tmdbId);
            if (dto == null) {
                throw new ResourceNotFoundException("film (tmdbId)", tmdbId);
            }
            return filmRepo.save(tmdb.toEntity(dto));
        });
        return mapper.toResponse(film);
    }

    @Transactional
    public List<FilmSummaryResponse> trending(Industry industry) {
        // Trending refresh is now also scheduled (TrendingRefreshJob); inline
        // refresh here is kept so a fresh DB still serves results without
        // waiting for the next cron tick.
        cacheMissing(tmdb.trending("week"));
        Pageable top = PageRequest.of(0, 20);
        Page<Film> films = (industry == null)
                ? filmRepo.findAll(top)
                : filmRepo.findByIndustry(industry, top);
        return films.getContent().stream().map(mapper::toSummary).toList();
    }

    /**
     * Public reviews for a film — diary entries that have non-null
     * review text, paged newest-first. Backs the "Community reviews"
     * section on the film detail page.
     */
    @Transactional(readOnly = true)
    public PagedResponse<DiaryEntryResponse> communityReviews(UUID filmId, int page, int size) {
        var pageReq = org.springframework.data.domain.PageRequest.of(page, size);
        var p = entryRepo.findByFilmIdOrderByCreatedAtDesc(filmId, pageReq);
        // Only entries with a real review.
        var content = p.getContent().stream()
                .filter(e -> e.getReviewText() != null && !e.getReviewText().isBlank())
                .map(diaryMapper::toResponse).toList();
        return new PagedResponse<>(
                content,
                p.getNumber(),
                p.getSize(),
                p.getTotalElements(),
                p.getTotalPages()
        );
    }

    /**
     * Fetch this week's TMDB trending and cache any films we don't have yet.
     * Public so {@code TrendingRefreshJob} can invoke it on a schedule.
     *
     * @return number of films newly cached
     */
    @Transactional
    public int cacheTrending() {
        long before = filmRepo.count();
        cacheMissing(tmdb.trending("week"));
        long after = filmRepo.count();
        return (int) (after - before);
    }

    // ---- helpers ------------------------------------------------------------

    private void cacheMissing(List<TMDBService.TmdbMovie> movies) {
        if (movies == null || movies.isEmpty()) return;
        Set<Integer> ids = new HashSet<>();
        List<Film> toSave = new ArrayList<>();
        for (var m : movies) {
            if (m == null || m.id == null || !ids.add(m.id)) continue;
            if (filmRepo.findByTmdbId(m.id).isEmpty()) {
                toSave.add(tmdb.toEntity(m));
            }
        }
        if (!toSave.isEmpty()) filmRepo.saveAll(toSave);
    }
}
