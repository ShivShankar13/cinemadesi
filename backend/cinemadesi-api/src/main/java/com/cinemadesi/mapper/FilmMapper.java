package com.cinemadesi.mapper;

import com.cinemadesi.dto.response.FilmResponse;
import com.cinemadesi.dto.response.FilmSummaryResponse;
import com.cinemadesi.entity.Film;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface FilmMapper {

    FilmSummaryResponse toSummary(Film film);

    FilmResponse toResponse(Film film);
}
