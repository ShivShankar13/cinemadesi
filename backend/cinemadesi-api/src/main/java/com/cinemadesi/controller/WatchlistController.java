package com.cinemadesi.controller;

import com.cinemadesi.dto.request.AddToWatchlistRequest;
import com.cinemadesi.dto.request.MarkWatchedRequest;
import com.cinemadesi.dto.request.UpdateMoodTagsRequest;
import com.cinemadesi.dto.response.DiaryEntryResponse;
import com.cinemadesi.dto.response.WatchlistItemResponse;
import com.cinemadesi.service.WatchlistService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/watchlist")
public class WatchlistController {

    private final WatchlistService watchlist;

    public WatchlistController(WatchlistService watchlist) {
        this.watchlist = watchlist;
    }

    @GetMapping
    public List<WatchlistItemResponse> list() {
        return watchlist.myWatchlist();
    }

    @PostMapping
    public ResponseEntity<WatchlistItemResponse> add(@Valid @RequestBody AddToWatchlistRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(watchlist.add(request));
    }

    @DeleteMapping("/{itemId}")
    public ResponseEntity<Void> remove(@PathVariable("itemId") UUID itemId) {
        watchlist.remove(itemId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{itemId}/watched")
    public DiaryEntryResponse markWatched(
            @PathVariable("itemId") UUID itemId,
            @Valid @RequestBody MarkWatchedRequest request
    ) {
        return watchlist.markWatched(itemId, request);
    }

    @PatchMapping("/{itemId}/mood-tags")
    public WatchlistItemResponse updateMoodTags(
            @PathVariable("itemId") UUID itemId,
            @Valid @RequestBody UpdateMoodTagsRequest request
    ) {
        return watchlist.updateMoodTags(itemId, request);
    }
}
