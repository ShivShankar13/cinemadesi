package com.cinemadesi.service;

import com.cinemadesi.entity.Film;
import com.cinemadesi.entity.enums.Industry;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;

/**
 * Wrapper around the public TMDB v3 API. Returns lightweight DTOs that
 * {@link FilmService} converts to {@link Film} entities for caching.
 *
 * <p>If {@code app.tmdb.api-key} is empty/missing, every call returns
 * an empty result without throwing — useful in local dev / CI where
 * TMDB credentials aren't set up yet.</p>
 */
@Service
public class TMDBService {

    private static final Logger log = LoggerFactory.getLogger(TMDBService.class);
    private static final String POSTER_PREFIX   = "https://image.tmdb.org/t/p/w500";
    private static final String BACKDROP_PREFIX = "https://image.tmdb.org/t/p/w1280";

    private final RestClient client;
    private final String apiKey;

    public TMDBService(
            @Qualifier("tmdbRestClient") RestClient client,
            @Value("${app.tmdb.api-key}") String apiKey
    ) {
        this.client = client;
        this.apiKey = apiKey == null ? "" : apiKey.trim();
    }

    public List<TmdbMovie> search(String query, String language, int page) {
        if (apiKey.isEmpty()) {
            log.warn("TMDB api key not configured — returning empty search results");
            return List.of();
        }
        try {
            TmdbSearchPage response = client.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/search/movie")
                            .queryParam("query", query)
                            .queryParam("language", language == null ? "en-US" : language)
                            .queryParam("page", page)
                            .queryParam("api_key", apiKey)
                            .build())
                    .retrieve()
                    .body(TmdbSearchPage.class);
            return response == null || response.results == null ? List.of() : response.results;
        } catch (RestClientException ex) {
            log.warn("TMDB search failed for query='{}': {}", query, ex.getMessage());
            return List.of();
        }
    }

    public TmdbMovie getById(int tmdbId) {
        if (apiKey.isEmpty()) {
            log.warn("TMDB api key not configured — getById short-circuited");
            return null;
        }
        try {
            return client.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/movie/{id}")
                            .queryParam("api_key", apiKey)
                            .build(tmdbId))
                    .retrieve()
                    .body(TmdbMovie.class);
        } catch (RestClientException ex) {
            log.warn("TMDB getById({}) failed: {}", tmdbId, ex.getMessage());
            return null;
        }
    }

    public List<TmdbMovie> trending(String timeWindow) {
        if (apiKey.isEmpty()) return List.of();
        try {
            TmdbSearchPage response = client.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/trending/movie/{window}")
                            .queryParam("api_key", apiKey)
                            .build("week".equalsIgnoreCase(timeWindow) ? "week" : "day"))
                    .retrieve()
                    .body(TmdbSearchPage.class);
            return response == null || response.results == null
                    ? List.of() : response.results;
        } catch (RestClientException ex) {
            log.warn("TMDB trending failed: {}", ex.getMessage());
            return Collections.emptyList();
        }
    }

    /**
     * Convert a {@link TmdbMovie} payload into a {@link Film} entity ready
     * to be persisted. Industry is derived from {@code original_language}.
     */
    public Film toEntity(TmdbMovie m) {
        if (m == null) return null;
        return Film.builder()
                .tmdbId(m.id)
                .title(m.title)
                .originalTitle(m.originalTitle)
                .language(m.originalLanguage)
                .industry(Industry.fromTmdbLanguage(m.originalLanguage))
                .releaseDate(parseDate(m.releaseDate))
                .posterUrl(m.posterPath == null ? null : POSTER_PREFIX + m.posterPath)
                .backdropUrl(m.backdropPath == null ? null : BACKDROP_PREFIX + m.backdropPath)
                .overview(m.overview)
                .runtimeMinutes(m.runtime)
                .build();
    }

    private static LocalDate parseDate(String s) {
        if (s == null || s.isBlank()) return null;
        try { return LocalDate.parse(s); } catch (Exception ex) { return null; }
    }

    // ---- TMDB payload DTOs ---------------------------------------------------

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class TmdbSearchPage {
        public int page;
        public List<TmdbMovie> results;
        @JsonProperty("total_results") public int totalResults;
        @JsonProperty("total_pages")   public int totalPages;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class TmdbMovie {
        public Integer id;
        public String title;
        @JsonProperty("original_title")    public String originalTitle;
        @JsonProperty("original_language") public String originalLanguage;
        @JsonProperty("release_date")      public String releaseDate;
        @JsonProperty("poster_path")       public String posterPath;
        @JsonProperty("backdrop_path")     public String backdropPath;
        public String overview;
        public Integer runtime;
    }
}
