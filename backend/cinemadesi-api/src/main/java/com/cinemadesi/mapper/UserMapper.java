package com.cinemadesi.mapper;

import com.cinemadesi.dto.response.UserProfileResponse;
import com.cinemadesi.dto.response.UserSummaryResponse;
import com.cinemadesi.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Named;

/**
 * <p>{@code totalFilmsWatched}, {@code totalFollowers}, {@code totalFollowing},
 * and {@code isFollowedByMe} aren't on the entity — UserService composes them
 * separately and uses {@link #toProfile(User, int, int, int, Boolean)}.</p>
 */
@Mapper(componentModel = "spring")
public interface UserMapper {

    UserSummaryResponse toSummary(User user);

    @Named("toProfileWithStats")
    default UserProfileResponse toProfile(
            User user,
            int totalFilmsWatched,
            int totalFollowers,
            int totalFollowing,
            Boolean isFollowedByMe
    ) {
        if (user == null) return null;
        return new UserProfileResponse(
                user.getId(),
                user.getUsername(),
                user.getDisplayName(),
                user.getAvatarUrl(),
                user.getBio(),
                user.getEmail(),
                totalFilmsWatched,
                totalFollowers,
                totalFollowing,
                isFollowedByMe
        );
    }
}
