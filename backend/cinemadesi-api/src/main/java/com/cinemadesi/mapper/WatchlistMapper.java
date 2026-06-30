package com.cinemadesi.mapper;

import com.cinemadesi.dto.response.WatchlistItemResponse;
import com.cinemadesi.entity.WatchlistItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {FilmMapper.class, UserMapper.class})
public interface WatchlistMapper {

    @Mapping(source = "film", target = "film")
    @Mapping(source = "recommendedBy", target = "recommendedBy")
    WatchlistItemResponse toResponse(WatchlistItem item);
}
