package com.cinemadesi.controller;

import com.cinemadesi.dto.request.UpdateProfileRequest;
import com.cinemadesi.dto.response.DiaryEntryResponse;
import com.cinemadesi.dto.response.ListResponse;
import com.cinemadesi.dto.response.PagedResponse;
import com.cinemadesi.dto.response.UserProfileResponse;
import com.cinemadesi.dto.response.UserSummaryResponse;
import com.cinemadesi.dto.response.WatchlistItemResponse;
import com.cinemadesi.service.DiaryService;
import com.cinemadesi.service.ListService;
import com.cinemadesi.service.UserService;
import com.cinemadesi.service.WatchlistService;
import jakarta.validation.Valid;
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

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserService      users;
    private final DiaryService     diary;
    private final WatchlistService watchlist;
    private final ListService      lists;

    public UserController(
            UserService users,
            DiaryService diary,
            WatchlistService watchlist,
            ListService lists
    ) {
        this.users     = users;
        this.diary     = diary;
        this.watchlist = watchlist;
        this.lists     = lists;
    }

    /**
     * Typeahead search — by username OR display name. Cheap by design;
     * returns up to 20 results, no pagination.
     */
    @GetMapping("/search")
    public List<UserSummaryResponse> search(
            @RequestParam("q") String q,
            @RequestParam(value = "limit", defaultValue = "8") int limit
    ) {
        return users.search(q, limit);
    }

    @GetMapping("/{username}")
    public UserProfileResponse getProfile(@PathVariable("username") String username) {
        return users.getProfile(username);
    }

    @PatchMapping("/me")
    public UserProfileResponse updateMe(@Valid @RequestBody UpdateProfileRequest request) {
        return users.updateMe(request);
    }

    @GetMapping("/{username}/diary")
    public PagedResponse<DiaryEntryResponse> getDiary(
            @PathVariable("username") String username,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size
    ) {
        return diary.diaryFor(username, page, size);
    }

    @GetMapping("/{username}/watchlist")
    public List<WatchlistItemResponse> getWatchlist(@PathVariable("username") String username) {
        return watchlist.watchlistFor(username);
    }

    @GetMapping("/{username}/lists")
    public List<ListResponse> getLists(@PathVariable("username") String username) {
        return lists.listsFor(username);
    }

    @PostMapping("/follow/{userId}")
    public ResponseEntity<Void> follow(@PathVariable("userId") UUID userId) {
        users.follow(userId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/follow/{userId}")
    public ResponseEntity<Void> unfollow(@PathVariable("userId") UUID userId) {
        users.unfollow(userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{username}/followers")
    public List<UserSummaryResponse> followers(@PathVariable("username") String username) {
        return users.followers(username);
    }

    @GetMapping("/{username}/following")
    public List<UserSummaryResponse> following(@PathVariable("username") String username) {
        return users.following(username);
    }
}
