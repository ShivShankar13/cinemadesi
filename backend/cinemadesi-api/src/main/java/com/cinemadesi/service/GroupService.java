package com.cinemadesi.service;

import com.cinemadesi.dto.request.CreateGroupRequest;
import com.cinemadesi.dto.request.InviteMemberRequest;
import com.cinemadesi.dto.request.UpdateGroupRequest;
import com.cinemadesi.dto.response.DiaryEntryResponse;
import com.cinemadesi.dto.response.GroupMemberResponse;
import com.cinemadesi.dto.response.GroupResponse;
import com.cinemadesi.dto.response.GroupSummaryResponse;
import com.cinemadesi.dto.response.GroupWatchlistItemResponse;
import com.cinemadesi.dto.response.PagedResponse;
import com.cinemadesi.dto.response.UserSummaryResponse;
import com.cinemadesi.entity.Group;
import com.cinemadesi.entity.GroupMember;
import com.cinemadesi.entity.User;
import com.cinemadesi.entity.WatchEntry;
import com.cinemadesi.entity.WatchlistItem;
import com.cinemadesi.entity.enums.GroupRole;
import com.cinemadesi.exception.ResourceNotFoundException;
import com.cinemadesi.exception.UnauthorizedException;
import com.cinemadesi.mapper.DiaryMapper;
import com.cinemadesi.mapper.FilmMapper;
import com.cinemadesi.mapper.GroupMapper;
import com.cinemadesi.mapper.UserMapper;
import com.cinemadesi.repository.GroupMemberRepository;
import com.cinemadesi.repository.GroupRepository;
import com.cinemadesi.repository.UserRepository;
import com.cinemadesi.repository.WatchEntryRepository;
import com.cinemadesi.repository.WatchlistItemRepository;
import com.cinemadesi.security.CurrentUserProvider;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class GroupService {

    private final GroupRepository          groupRepo;
    private final GroupMemberRepository    memberRepo;
    private final WatchlistItemRepository  watchlistRepo;
    private final WatchEntryRepository     entryRepo;
    private final UserRepository           userRepo;
    private final GroupMapper              mapper;
    private final UserMapper               userMapper;
    private final FilmMapper               filmMapper;
    private final DiaryMapper              diaryMapper;
    private final CurrentUserProvider      current;

    public GroupService(
            GroupRepository groupRepo,
            GroupMemberRepository memberRepo,
            WatchlistItemRepository watchlistRepo,
            WatchEntryRepository entryRepo,
            UserRepository userRepo,
            GroupMapper mapper,
            UserMapper userMapper,
            FilmMapper filmMapper,
            DiaryMapper diaryMapper,
            CurrentUserProvider current
    ) {
        this.groupRepo     = groupRepo;
        this.memberRepo    = memberRepo;
        this.watchlistRepo = watchlistRepo;
        this.entryRepo     = entryRepo;
        this.userRepo      = userRepo;
        this.mapper        = mapper;
        this.userMapper    = userMapper;
        this.filmMapper    = filmMapper;
        this.diaryMapper   = diaryMapper;
        this.current       = current;
    }

    @Transactional
    public GroupResponse create(CreateGroupRequest req) {
        UUID myId = current.requireUserId();
        User me = userRepo.findById(myId)
                .orElseThrow(() -> new ResourceNotFoundException("user", myId));
        Group group = groupRepo.save(Group.builder()
                .name(req.name())
                .description(req.description())
                .coverImageUrl(req.coverImageUrl())
                .createdBy(me)
                .build());
        // Creator joins as ADMIN automatically.
        memberRepo.save(GroupMember.builder()
                .group(group)
                .user(me)
                .role(GroupRole.ADMIN)
                .build());
        return toResponse(group);
    }

    @Transactional(readOnly = true)
    public GroupResponse get(UUID groupId) {
        Group group = groupRepo.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("group", groupId));
        return toResponse(group);
    }

    @Transactional(readOnly = true)
    public List<GroupSummaryResponse> myGroups() {
        UUID myId = current.requireUserId();
        return groupRepo.findGroupsByMemberId(myId).stream()
                .map(this::toSummary).toList();
    }

    @Transactional
    public GroupResponse update(UUID groupId, UpdateGroupRequest req) {
        UUID myId = current.requireUserId();
        Group group = groupRepo.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("group", groupId));
        requireAdmin(groupId, myId);
        if (req.name() != null)          group.setName(req.name());
        if (req.description() != null)   group.setDescription(req.description());
        if (req.coverImageUrl() != null) group.setCoverImageUrl(req.coverImageUrl());
        return toResponse(group);
    }

    @Transactional
    public GroupMemberResponse invite(UUID groupId, InviteMemberRequest req) {
        UUID myId = current.requireUserId();
        requireAdmin(groupId, myId);
        if (memberRepo.existsByGroupIdAndUserId(groupId, req.userId())) {
            return memberRepo.findByGroupIdAndUserId(groupId, req.userId())
                    .map(mapper::toMember).orElseThrow();
        }
        Group group = groupRepo.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("group", groupId));
        User user = userRepo.findById(req.userId())
                .orElseThrow(() -> new ResourceNotFoundException("user", req.userId()));
        GroupMember member = memberRepo.save(GroupMember.builder()
                .group(group)
                .user(user)
                .role(req.role() == null ? GroupRole.MEMBER : req.role())
                .build());
        return mapper.toMember(member);
    }

    @Transactional
    public void removeMember(UUID groupId, UUID userId) {
        UUID myId = current.requireUserId();
        // Allowed: admin removing anyone, or any member self-leaving.
        boolean isSelfLeave = myId.equals(userId);
        if (!isSelfLeave) requireAdmin(groupId, myId);

        GroupMember member = memberRepo.findByGroupIdAndUserId(groupId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("group member", userId));
        memberRepo.delete(member);
    }

    @Transactional(readOnly = true)
    public List<GroupWatchlistItemResponse> mergedWatchlist(UUID groupId) {
        requireMember(groupId);
        return aggregateWatchlist(groupId, /*onlyCommon*/ false);
    }

    @Transactional(readOnly = true)
    public List<GroupWatchlistItemResponse> commonFilms(UUID groupId) {
        requireMember(groupId);
        return aggregateWatchlist(groupId, /*onlyCommon*/ true);
    }

    @Transactional(readOnly = true)
    public PagedResponse<DiaryEntryResponse> groupFeed(UUID groupId, int page, int size) {
        requireMember(groupId);
        Page<WatchEntry> p = entryRepo.findGroupFeed(groupId, PageRequest.of(page, size));
        return PagedResponse.from(p, diaryMapper::toResponse);
    }

    // ---- helpers ------------------------------------------------------------

    private GroupResponse toResponse(Group group) {
        List<GroupMember> members = memberRepo.findByGroupId(group.getId());
        List<GroupMemberResponse> mapped = members.stream().map(mapper::toMember).toList();
        return mapper.toResponse(group, mapped, members.size());
    }

    private GroupSummaryResponse toSummary(Group group) {
        List<GroupMember> members = memberRepo.findByGroupId(group.getId());
        List<UserSummaryResponse> preview = members.stream().limit(4)
                .map(m -> userMapper.toSummary(m.getUser())).toList();
        return mapper.toSummary(group, preview, members.size());
    }

    private void requireAdmin(UUID groupId, UUID userId) {
        if (!memberRepo.existsByGroupIdAndUserIdAndRole(groupId, userId, GroupRole.ADMIN)) {
            throw new UnauthorizedException("Group admin required");
        }
    }

    private void requireMember(UUID groupId) {
        UUID myId = current.requireUserId();
        if (!memberRepo.existsByGroupIdAndUserId(groupId, myId)) {
            throw new UnauthorizedException("Group membership required");
        }
    }

    /**
     * In-Java aggregation. Done in-memory because group sizes are small
     * (typically &lt;30 members, &lt;a few hundred items). The query itself
     * fans out via {@code idx_group_members_group_id} + {@code idx_watchlist_user_id}.
     */
    private List<GroupWatchlistItemResponse> aggregateWatchlist(UUID groupId, boolean onlyCommon) {
        List<WatchlistItem> items = watchlistRepo.findGroupMergedWatchlist(groupId);
        Map<UUID, List<WatchlistItem>> byFilm = new LinkedHashMap<>();
        for (WatchlistItem item : items) {
            byFilm.computeIfAbsent(item.getFilm().getId(), k -> new ArrayList<>()).add(item);
        }
        List<GroupWatchlistItemResponse> out = new ArrayList<>();
        for (List<WatchlistItem> rows : byFilm.values()) {
            int count = rows.size();
            if (onlyCommon && count < 2) continue;
            out.add(new GroupWatchlistItemResponse(
                    filmMapper.toSummary(rows.get(0).getFilm()),
                    rows.stream().map(r -> userMapper.toSummary(r.getUser())).toList(),
                    count
            ));
        }
        out.sort(Comparator.comparingInt(GroupWatchlistItemResponse::memberCount).reversed());
        return out;
    }
}
