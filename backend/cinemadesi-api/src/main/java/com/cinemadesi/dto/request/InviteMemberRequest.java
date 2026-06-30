package com.cinemadesi.dto.request;

import com.cinemadesi.entity.enums.GroupRole;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

/**
 * Body for {@code POST /api/v1/groups/{groupId}/members}.
 * Caller must be a group ADMIN. {@code role} defaults to MEMBER
 * service-side when null.
 */
public record InviteMemberRequest(

        @NotNull
        UUID userId,

        GroupRole role
) {}
