package com.cinemadesi.controller;

import com.cinemadesi.dto.request.CreateGroupRequest;
import com.cinemadesi.dto.request.InviteMemberRequest;
import com.cinemadesi.dto.request.UpdateGroupRequest;
import com.cinemadesi.dto.response.DiaryEntryResponse;
import com.cinemadesi.dto.response.GroupMemberResponse;
import com.cinemadesi.dto.response.GroupResponse;
import com.cinemadesi.dto.response.GroupSummaryResponse;
import com.cinemadesi.dto.response.GroupWatchlistItemResponse;
import com.cinemadesi.dto.response.PagedResponse;
import com.cinemadesi.service.GroupService;
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

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/groups")
public class GroupController {

    private final GroupService groups;

    public GroupController(GroupService groups) {
        this.groups = groups;
    }

    @PostMapping
    public ResponseEntity<GroupResponse> create(@Valid @RequestBody CreateGroupRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(groups.create(request));
    }

    @GetMapping("/my")
    public List<GroupSummaryResponse> myGroups() {
        return groups.myGroups();
    }

    @GetMapping("/{groupId}")
    public GroupResponse get(@PathVariable("groupId") UUID groupId) {
        return groups.get(groupId);
    }

    @PatchMapping("/{groupId}")
    public GroupResponse update(
            @PathVariable("groupId") UUID groupId,
            @Valid @RequestBody UpdateGroupRequest request
    ) {
        return groups.update(groupId, request);
    }

    @PostMapping("/{groupId}/members")
    public ResponseEntity<GroupMemberResponse> invite(
            @PathVariable("groupId") UUID groupId,
            @Valid @RequestBody InviteMemberRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(groups.invite(groupId, request));
    }

    @DeleteMapping("/{groupId}/members/{userId}")
    public ResponseEntity<Void> removeMember(
            @PathVariable("groupId") UUID groupId,
            @PathVariable("userId") UUID userId
    ) {
        groups.removeMember(groupId, userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{groupId}/watchlist")
    public List<GroupWatchlistItemResponse> mergedWatchlist(@PathVariable("groupId") UUID groupId) {
        return groups.mergedWatchlist(groupId);
    }

    @GetMapping("/{groupId}/common")
    public List<GroupWatchlistItemResponse> commonFilms(@PathVariable("groupId") UUID groupId) {
        return groups.commonFilms(groupId);
    }

    @GetMapping("/{groupId}/feed")
    public PagedResponse<DiaryEntryResponse> feed(
            @PathVariable("groupId") UUID groupId,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size
    ) {
        return groups.groupFeed(groupId, page, size);
    }
}
