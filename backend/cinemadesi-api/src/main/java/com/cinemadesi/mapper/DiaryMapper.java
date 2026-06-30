package com.cinemadesi.mapper;

import com.cinemadesi.dto.response.DiaryEntryResponse;
import com.cinemadesi.entity.WatchEntry;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses = {FilmMapper.class, UserMapper.class})
public interface DiaryMapper {

    DiaryEntryResponse toResponse(WatchEntry entry);
}
