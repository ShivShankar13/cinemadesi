package com.cinemadesi.dto.response;

import com.cinemadesi.entity.enums.GroupRole;

import java.time.Instant;
import java.util.UUID;

/** A single member of a group, with their role and join date. */
public record GroupMemberResponse(
        UUID id,
        UserSummaryResponse user,
        GroupRole role,
        Instant joinedAt
) {}
