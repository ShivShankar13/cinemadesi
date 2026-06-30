package com.cinemadesi.mapper;

import com.cinemadesi.dto.response.ListFilmResponse;
import com.cinemadesi.dto.response.ListResponse;
import com.cinemadesi.entity.FilmList;
import com.cinemadesi.entity.ListFilm;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring", uses = {UserMapper.class, FilmMapper.class})
public interface ListMapper {

    ListFilmResponse toFilmResponse(ListFilm listFilm);

    /**
     * The {@code films} sub-list is fetched separately (different repo),
     * so the service supplies it here.
     */
    default ListResponse toResponse(FilmList list, List<ListFilmResponse> films) {
        if (list == null) return null;
        return new ListResponse(
                list.getId(),
                list.getUser() == null ? null
                        : new com.cinemadesi.dto.response.UserSummaryResponse(
                                list.getUser().getId(),
                                list.getUser().getUsername(),
                                list.getUser().getDisplayName(),
                                list.getUser().getAvatarUrl()),
                list.getTitle(),
                list.getDescription(),
                list.getIsPublic(),
                films,
                films == null ? 0 : films.size(),
                list.getCreatedAt()
        );
    }
}
