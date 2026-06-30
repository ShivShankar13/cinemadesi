package com.cinemadesi.service;

import com.cinemadesi.dto.request.LogFilmRequest;
import com.cinemadesi.dto.request.UpdateDiaryEntryRequest;
import com.cinemadesi.dto.response.DiaryEntryResponse;
import com.cinemadesi.dto.response.PagedResponse;
import com.cinemadesi.entity.Film;
import com.cinemadesi.entity.User;
import com.cinemadesi.entity.WatchEntry;
import com.cinemadesi.entity.enums.WatchMode;
import com.cinemadesi.exception.ResourceNotFoundException;
import com.cinemadesi.exception.UnauthorizedException;
import com.cinemadesi.mapper.DiaryMapper;
import com.cinemadesi.repository.FilmRepository;
import com.cinemadesi.repository.UserRepository;
import com.cinemadesi.repository.WatchEntryRepository;
import com.cinemadesi.security.CurrentUserProvider;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class DiaryService {

    private final WatchEntryRepository entryRepo;
    private final FilmRepository       filmRepo;
    private final UserRepository       userRepo;
    private final DiaryMapper          mapper;
    private final CurrentUserProvider  current;

    public DiaryService(
            WatchEntryRepository entryRepo,
            FilmRepository filmRepo,
            UserRepository userRepo,
            DiaryMapper mapper,
            CurrentUserProvider current
    ) {
        this.entryRepo = entryRepo;
        this.filmRepo  = filmRepo;
        this.userRepo  = userRepo;
        this.mapper    = mapper;
        this.current   = current;
    }

    @Transactional
    public DiaryEntryResponse log(LogFilmRequest req) {
        UUID myId = current.requireUserId();
        if (req.watchMode() == WatchMode.OTT && req.ottPlatform() == null) {
            throw new IllegalArgumentException("ottPlatform is required when watchMode = OTT");
        }
        User me = userRepo.findById(myId)
                .orElseThrow(() -> new ResourceNotFoundException("user", myId));
        Film film = filmRepo.findById(req.filmId())
                .orElseThrow(() -> new ResourceNotFoundException("film", req.filmId()));

        WatchEntry entry = WatchEntry.builder()
                .user(me)
                .film(film)
                .watchedAt(req.watchedAt())
                .rating(req.rating())
                .reviewText(req.reviewText())
                .watchMode(req.watchMode())
                .ottPlatform(req.ottPlatform())
                .containsSpoilers(Boolean.TRUE.equals(req.containsSpoilers()))
                .build();
        return mapper.toResponse(entryRepo.save(entry));
    }

    @Transactional
    public DiaryEntryResponse update(UUID entryId, UpdateDiaryEntryRequest req) {
        UUID myId = current.requireUserId();
        WatchEntry entry = entryRepo.findById(entryId)
                .orElseThrow(() -> new ResourceNotFoundException("diary entry", entryId));
        if (!entry.getUser().getId().equals(myId)) {
            throw new UnauthorizedException("Cannot modify another user's diary entry");
        }
        if (req.watchedAt() != null)        entry.setWatchedAt(req.watchedAt());
        if (req.rating() != null)           entry.setRating(req.rating());
        if (req.reviewText() != null)       entry.setReviewText(req.reviewText());
        if (req.watchMode() != null)        entry.setWatchMode(req.watchMode());
        if (req.ottPlatform() != null)      entry.setOttPlatform(req.ottPlatform());
        if (req.containsSpoilers() != null) entry.setContainsSpoilers(req.containsSpoilers());
        return mapper.toResponse(entry);
    }

    @Transactional
    public void delete(UUID entryId) {
        UUID myId = current.requireUserId();
        WatchEntry entry = entryRepo.findById(entryId)
                .orElseThrow(() -> new ResourceNotFoundException("diary entry", entryId));
        if (!entry.getUser().getId().equals(myId)) {
            throw new UnauthorizedException("Cannot delete another user's diary entry");
        }
        entryRepo.delete(entry);
    }

    @Transactional(readOnly = true)
    public PagedResponse<DiaryEntryResponse> diaryFor(String username, int page, int size) {
        User user = userRepo.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("user", username));
        Page<WatchEntry> p = entryRepo.findByUserIdOrderByCreatedAtDesc(
                user.getId(), PageRequest.of(page, size));
        return PagedResponse.from(p, mapper::toResponse);
    }
}
