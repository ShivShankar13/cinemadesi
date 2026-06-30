package com.cinemadesi.service;

import com.cinemadesi.dto.request.AddToWatchlistRequest;
import com.cinemadesi.dto.request.MarkWatchedRequest;
import com.cinemadesi.dto.request.UpdateMoodTagsRequest;
import com.cinemadesi.dto.response.DiaryEntryResponse;
import com.cinemadesi.dto.response.WatchlistItemResponse;
import com.cinemadesi.entity.Film;
import com.cinemadesi.entity.User;
import com.cinemadesi.entity.WatchEntry;
import com.cinemadesi.entity.WatchlistItem;
import com.cinemadesi.exception.ResourceNotFoundException;
import com.cinemadesi.exception.UnauthorizedException;
import com.cinemadesi.mapper.DiaryMapper;
import com.cinemadesi.mapper.WatchlistMapper;
import com.cinemadesi.repository.FilmRepository;
import com.cinemadesi.repository.UserRepository;
import com.cinemadesi.repository.WatchEntryRepository;
import com.cinemadesi.repository.WatchlistItemRepository;
import com.cinemadesi.security.CurrentUserProvider;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class WatchlistService {

    private final WatchlistItemRepository watchlistRepo;
    private final WatchEntryRepository    entryRepo;
    private final FilmRepository          filmRepo;
    private final UserRepository          userRepo;
    private final WatchlistMapper         mapper;
    private final DiaryMapper             diaryMapper;
    private final CurrentUserProvider     current;

    public WatchlistService(
            WatchlistItemRepository watchlistRepo,
            WatchEntryRepository entryRepo,
            FilmRepository filmRepo,
            UserRepository userRepo,
            WatchlistMapper mapper,
            DiaryMapper diaryMapper,
            CurrentUserProvider current
    ) {
        this.watchlistRepo = watchlistRepo;
        this.entryRepo     = entryRepo;
        this.filmRepo      = filmRepo;
        this.userRepo      = userRepo;
        this.mapper        = mapper;
        this.diaryMapper   = diaryMapper;
        this.current       = current;
    }

    @Transactional(readOnly = true)
    public List<WatchlistItemResponse> myWatchlist() {
        UUID myId = current.requireUserId();
        return watchlistRepo.findByUserIdOrderByAddedAtDesc(myId).stream()
                .map(mapper::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<WatchlistItemResponse> watchlistFor(String username) {
        User user = userRepo.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("user", username));
        return watchlistRepo.findByUserIdOrderByAddedAtDesc(user.getId()).stream()
                .map(mapper::toResponse).toList();
    }

    @Transactional
    public WatchlistItemResponse add(AddToWatchlistRequest req) {
        UUID myId = current.requireUserId();
        if (watchlistRepo.existsByUserIdAndFilmId(myId, req.filmId())) {
            return watchlistRepo.findByUserIdAndFilmId(myId, req.filmId())
                    .map(mapper::toResponse).orElseThrow();
        }
        User me = userRepo.findById(myId)
                .orElseThrow(() -> new ResourceNotFoundException("user", myId));
        Film film = filmRepo.findById(req.filmId())
                .orElseThrow(() -> new ResourceNotFoundException("film", req.filmId()));

        WatchlistItem item = WatchlistItem.builder()
                .user(me)
                .film(film)
                .moodTags(req.moodTags())
                .build();
        return mapper.toResponse(watchlistRepo.save(item));
    }

    @Transactional
    public void remove(UUID itemId) {
        UUID myId = current.requireUserId();
        WatchlistItem item = watchlistRepo.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("watchlist item", itemId));
        if (!item.getUser().getId().equals(myId)) {
            throw new UnauthorizedException("Cannot remove another user's watchlist item");
        }
        watchlistRepo.delete(item);
    }

    /**
     * Move a watchlist item into the diary — deletes the item, creates a
     * new {@link WatchEntry} from the request, returns the diary entry.
     */
    @Transactional
    public DiaryEntryResponse markWatched(UUID itemId, MarkWatchedRequest req) {
        UUID myId = current.requireUserId();
        WatchlistItem item = watchlistRepo.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("watchlist item", itemId));
        if (!item.getUser().getId().equals(myId)) {
            throw new UnauthorizedException("Cannot mark another user's watchlist item");
        }
        WatchEntry entry = WatchEntry.builder()
                .user(item.getUser())
                .film(item.getFilm())
                .watchedAt(req.watchedAt())
                .rating(req.rating())
                .reviewText(req.reviewText())
                .watchMode(req.watchMode())
                .ottPlatform(req.ottPlatform())
                .containsSpoilers(false)
                .build();
        entry = entryRepo.save(entry);
        watchlistRepo.delete(item);
        return diaryMapper.toResponse(entry);
    }

    @Transactional
    public WatchlistItemResponse updateMoodTags(UUID itemId, UpdateMoodTagsRequest req) {
        UUID myId = current.requireUserId();
        WatchlistItem item = watchlistRepo.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("watchlist item", itemId));
        if (!item.getUser().getId().equals(myId)) {
            throw new UnauthorizedException("Cannot modify another user's watchlist item");
        }
        item.setMoodTags(req.moodTags());
        return mapper.toResponse(item);
    }
}
