package com.cinemadesi.service;

import com.cinemadesi.dto.request.UpdateProfileRequest;
import com.cinemadesi.dto.response.UserProfileResponse;
import com.cinemadesi.dto.response.UserSummaryResponse;
import com.cinemadesi.entity.Follow;
import com.cinemadesi.entity.User;
import com.cinemadesi.exception.ResourceNotFoundException;
import com.cinemadesi.mapper.UserMapper;
import com.cinemadesi.repository.FollowRepository;
import com.cinemadesi.repository.UserRepository;
import com.cinemadesi.repository.WatchEntryRepository;
import com.cinemadesi.security.CurrentUserProvider;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class UserService {

    private final UserRepository       userRepo;
    private final FollowRepository     followRepo;
    private final WatchEntryRepository watchEntryRepo;
    private final UserMapper           mapper;
    private final CurrentUserProvider  current;

    public UserService(
            UserRepository userRepo,
            FollowRepository followRepo,
            WatchEntryRepository watchEntryRepo,
            UserMapper mapper,
            CurrentUserProvider current
    ) {
        this.userRepo       = userRepo;
        this.followRepo     = followRepo;
        this.watchEntryRepo = watchEntryRepo;
        this.mapper         = mapper;
        this.current        = current;
    }

    @Transactional(readOnly = true)
    public UserProfileResponse getProfile(String username) {
        User user = userRepo.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("user", username));
        Boolean followed = current.tryGet()
                .map(p -> p.userId().equals(user.getId())
                        ? null
                        : followRepo.existsByFollowerIdAndFollowingId(p.userId(), user.getId()))
                .orElse(null);
        return toProfile(user, followed);
    }

    @Transactional
    public UserProfileResponse updateMe(UpdateProfileRequest req) {
        UUID myId = current.requireUserId();
        User user = userRepo.findById(myId)
                .orElseThrow(() -> new ResourceNotFoundException("user", myId));
        if (req.displayName() != null) user.setDisplayName(req.displayName());
        if (req.bio() != null)          user.setBio(req.bio());
        if (req.avatarUrl() != null)    user.setAvatarUrl(req.avatarUrl());
        return toProfile(user, null);
    }

    @Transactional
    public void follow(UUID targetUserId) {
        UUID myId = current.requireUserId();
        if (myId.equals(targetUserId)) {
            throw new IllegalArgumentException("cannot follow yourself");
        }
        User target = userRepo.findById(targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("user", targetUserId));
        if (followRepo.existsByFollowerIdAndFollowingId(myId, targetUserId)) return;

        User me = userRepo.findById(myId)
                .orElseThrow(() -> new ResourceNotFoundException("user", myId));
        followRepo.save(Follow.builder().follower(me).following(target).build());
    }

    @Transactional
    public void unfollow(UUID targetUserId) {
        UUID myId = current.requireUserId();
        followRepo.deleteByFollowerIdAndFollowingId(myId, targetUserId);
    }

    @Transactional(readOnly = true)
    public List<UserSummaryResponse> followers(String username) {
        User user = userRepo.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("user", username));
        return followRepo.findByFollowingId(user.getId()).stream()
                .map(f -> mapper.toSummary(f.getFollower()))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<UserSummaryResponse> following(String username) {
        User user = userRepo.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("user", username));
        return followRepo.findByFollowerId(user.getId()).stream()
                .map(f -> mapper.toSummary(f.getFollowing()))
                .toList();
    }

    /**
     * Typeahead-style user search. Returns up to {@code limit} compact
     * {@link UserSummaryResponse}s matching {@code q} on username OR
     * display name (case-insensitive substring).
     *
     * <p>Empty / 1-char queries return an empty list — same cheap-out as
     * {@code useFilmSearch} on the frontend.</p>
     */
    @Transactional(readOnly = true)
    public List<UserSummaryResponse> search(String q, int limit) {
        if (q == null || q.trim().length() < 2) return List.of();
        int safe = Math.min(Math.max(limit, 1), 20);
        return userRepo.searchByUsernameOrDisplayName(q.trim(), PageRequest.of(0, safe))
                .stream().map(mapper::toSummary).toList();
    }

    @Transactional(readOnly = true)
    public User loadByUsernameOrThrow(String username) {
        return userRepo.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("user", username));
    }

    // ---- internals ----------------------------------------------------------

    private UserProfileResponse toProfile(User user, Boolean isFollowedByMe) {
        return mapper.toProfile(
                user,
                (int) watchEntryRepo.countByUserId(user.getId()),
                (int) followRepo.countByFollowingId(user.getId()),
                (int) followRepo.countByFollowerId(user.getId()),
                isFollowedByMe
        );
    }
}
