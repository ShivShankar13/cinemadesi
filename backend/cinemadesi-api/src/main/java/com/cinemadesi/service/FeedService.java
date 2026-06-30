package com.cinemadesi.service;

import com.cinemadesi.dto.response.DiaryEntryResponse;
import com.cinemadesi.dto.response.PagedResponse;
import com.cinemadesi.entity.WatchEntry;
import com.cinemadesi.mapper.DiaryMapper;
import com.cinemadesi.repository.FollowRepository;
import com.cinemadesi.repository.WatchEntryRepository;
import com.cinemadesi.security.CurrentUserProvider;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * Home feed: watch entries from users the caller follows, newest first.
 * Falls back to an empty page when the caller follows nobody.
 */
@Service
public class FeedService {

    private final WatchEntryRepository entryRepo;
    private final FollowRepository     followRepo;
    private final DiaryMapper          mapper;
    private final CurrentUserProvider  current;

    public FeedService(
            WatchEntryRepository entryRepo,
            FollowRepository followRepo,
            DiaryMapper mapper,
            CurrentUserProvider current
    ) {
        this.entryRepo  = entryRepo;
        this.followRepo = followRepo;
        this.mapper     = mapper;
        this.current    = current;
    }

    @Transactional(readOnly = true)
    public PagedResponse<DiaryEntryResponse> homeFeed(int page, int size) {
        UUID myId = current.requireUserId();
        List<UUID> followingIds = followRepo.findFollowingIds(myId);
        if (followingIds.isEmpty()) {
            return new PagedResponse<>(List.of(), page, size, 0, 0);
        }
        Page<WatchEntry> p = entryRepo.findByUserIdInOrderByCreatedAtDesc(
                followingIds, PageRequest.of(page, size));
        return PagedResponse.from(p, mapper::toResponse);
    }
}
