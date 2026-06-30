package com.cinemadesi.controller;

import com.cinemadesi.dto.request.LogFilmRequest;
import com.cinemadesi.dto.request.UpdateDiaryEntryRequest;
import com.cinemadesi.dto.response.DiaryEntryResponse;
import com.cinemadesi.dto.response.PagedResponse;
import com.cinemadesi.service.DiaryService;
import com.cinemadesi.service.FeedService;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/diary")
public class DiaryController {

    private final DiaryService diary;
    private final FeedService  feed;

    public DiaryController(DiaryService diary, FeedService feed) {
        this.diary = diary;
        this.feed  = feed;
    }

    @PostMapping
    public ResponseEntity<DiaryEntryResponse> logFilm(@Valid @RequestBody LogFilmRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(diary.log(request));
    }

    @PatchMapping("/{entryId}")
    public DiaryEntryResponse update(
            @PathVariable("entryId") UUID entryId,
            @Valid @RequestBody UpdateDiaryEntryRequest request
    ) {
        return diary.update(entryId, request);
    }

    @DeleteMapping("/{entryId}")
    public ResponseEntity<Void> delete(@PathVariable("entryId") UUID entryId) {
        diary.delete(entryId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/feed")
    public PagedResponse<DiaryEntryResponse> feed(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size
    ) {
        return feed.homeFeed(page, size);
    }
}
