package com.cinemadesi.mapper;

import com.cinemadesi.dto.response.GroupMemberResponse;
import com.cinemadesi.dto.response.GroupResponse;
import com.cinemadesi.dto.response.GroupSummaryResponse;
import com.cinemadesi.dto.response.UserSummaryResponse;
import com.cinemadesi.entity.Group;
import com.cinemadesi.entity.GroupMember;
import org.mapstruct.Mapper;

import java.util.List;

/**
 * Group DTO assembly. The list-shaped fields (members, previewMembers,
 * memberCount) aren't on the entity — service composes those and passes
 * them in via {@link #toResponse(Group, List, int)} /
 * {@link #toSummary(Group, List, int)}.
 */
@Mapper(componentModel = "spring", uses = UserMapper.class)
public interface GroupMapper {

    GroupMemberResponse toMember(GroupMember member);

    default GroupResponse toResponse(Group group, List<GroupMemberResponse> members, int memberCount) {
        if (group == null) return null;
        return new GroupResponse(
                group.getId(),
                group.getName(),
                group.getDescription(),
                group.getCoverImageUrl(),
                group.getCreatedBy() == null ? null
                        : new UserSummaryResponse(
                                group.getCreatedBy().getId(),
                                group.getCreatedBy().getUsername(),
                                group.getCreatedBy().getDisplayName(),
                                group.getCreatedBy().getAvatarUrl()),
                members,
                memberCount,
                group.getCreatedAt()
        );
    }

    default GroupSummaryResponse toSummary(Group group, List<UserSummaryResponse> previewMembers, int memberCount) {
        if (group == null) return null;
        return new GroupSummaryResponse(
                group.getId(),
                group.getName(),
                group.getCoverImageUrl(),
                memberCount,
                previewMembers
        );
    }
}
