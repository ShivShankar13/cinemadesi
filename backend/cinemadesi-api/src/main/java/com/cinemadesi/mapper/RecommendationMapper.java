package com.cinemadesi.mapper;

import com.cinemadesi.dto.response.GroupSummaryResponse;
import com.cinemadesi.dto.response.RecommendationResponse;
import com.cinemadesi.entity.Recommendation;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.util.List;

@Mapper(componentModel = "spring", uses = {UserMapper.class, FilmMapper.class})
public interface RecommendationMapper {

    @Mapping(source = "toGroup", target = "toGroup", qualifiedByName = "groupToSummary")
    RecommendationResponse toResponse(Recommendation rec);

    /**
     * Minimal group → summary mapping for embedding inside a recommendation
     * (avatars / counts not needed in this card).
     */
    @Named("groupToSummary")
    default GroupSummaryResponse groupToSummary(com.cinemadesi.entity.Group group) {
        if (group == null) return null;
        return new GroupSummaryResponse(
                group.getId(),
                group.getName(),
                group.getCoverImageUrl(),
                0,
                List.of()
        );
    }
}
