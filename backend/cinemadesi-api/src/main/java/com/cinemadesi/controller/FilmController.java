package com.cinemadesi.controller;

import com.cinemadesi.dto.response.DiaryEntryResponse;
import com.cinemadesi.dto.response.FilmResponse;
import com.cinemadesi.dto.response.FilmSummaryResponse;
import com.cinemadesi.dto.response.PagedResponse;
import com.cinemadesi.entity.enums.Industry;
import com.cinemadesi.service.FilmService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/films")
public class FilmController {

    private final FilmService films;

    public FilmController(FilmService films) {
        this.films = films;
    }

    @GetMapping("/search")
    public PagedResponse<FilmSummaryResponse> search(
            @RequestParam("q") String query,
            @RequestParam(value = "language", required = false) String language,
            @RequestParam(value = "industry", required = false) Industry industry,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size
    ) {
        return films.search(query, industry, page, size);
    }

    @GetMapping("/{id}")
    public FilmResponse getById(@PathVariable("id") UUID id) {
        return films.getById(id);
    }

    @GetMapping("/trending")
    public List<FilmSummaryResponse> trending(
            @RequestParam(value = "industry", required = false) Industry industry
    ) {
        return films.trending(industry);
    }

    @GetMapping("/industries")
    public List<Industry> industries() {
        return Arrays.asList(Industry.values());
    }

    /** Public reviews for a film, newest first. */
    @GetMapping("/{id}/reviews")
    public PagedResponse<DiaryEntryResponse> communityReviews(
            @PathVariable("id") UUID id,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size
    ) {
        return films.communityReviews(id, page, size);
    }
}
