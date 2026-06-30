package com.cinemadesi.dto.response;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/** Full group payload — {@code GET /api/v1/groups/{groupId}}. */
public record GroupResponse(
        UUID id,
        String name,
        String description,
        String coverImageUrl,
        UserSummaryResponse createdBy,
        List<GroupMemberResponse> members,
        int memberCount,
        Instant createdAt
) {}
