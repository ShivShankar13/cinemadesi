package com.cinemadesi.dto.response;

import java.util.List;
import java.util.UUID;

/**
 * Compact group reference — used on "my groups" cards and inside
 * recommendation payloads. Avoids loading the full member list.
 */
public record GroupSummaryResponse(
        UUID id,
        String name,
        String coverImageUrl,
        int memberCount,
        /** First few member avatars for the stacked-avatars UI. */
        List<UserSummaryResponse> previewMembers
) {}
