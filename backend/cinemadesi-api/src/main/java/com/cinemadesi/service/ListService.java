package com.cinemadesi.service;

import com.cinemadesi.dto.request.AddFilmToListRequest;
import com.cinemadesi.dto.request.CreateListRequest;
import com.cinemadesi.dto.request.UpdateListRequest;
import com.cinemadesi.dto.response.ListFilmResponse;
import com.cinemadesi.dto.response.ListResponse;
import com.cinemadesi.dto.response.PagedResponse;
import com.cinemadesi.entity.Film;
import com.cinemadesi.entity.FilmList;
import com.cinemadesi.entity.ListFilm;
import com.cinemadesi.entity.User;
import com.cinemadesi.exception.ResourceNotFoundException;
import com.cinemadesi.exception.UnauthorizedException;
import com.cinemadesi.mapper.ListMapper;
import com.cinemadesi.repository.FilmListRepository;
import com.cinemadesi.repository.FilmRepository;
import com.cinemadesi.repository.ListFilmRepository;
import com.cinemadesi.repository.UserRepository;
import com.cinemadesi.security.CurrentUserProvider;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class ListService {

    private final FilmListRepository  listRepo;
    private final ListFilmRepository  listFilmRepo;
    private final FilmRepository      filmRepo;
    private final UserRepository      userRepo;
    private final ListMapper          mapper;
    private final CurrentUserProvider current;

    public ListService(
            FilmListRepository listRepo,
            ListFilmRepository listFilmRepo,
            FilmRepository filmRepo,
            UserRepository userRepo,
            ListMapper mapper,
            CurrentUserProvider current
    ) {
        this.listRepo     = listRepo;
        this.listFilmRepo = listFilmRepo;
        this.filmRepo     = filmRepo;
        this.userRepo     = userRepo;
        this.mapper       = mapper;
        this.current      = current;
    }

    @Transactional
    public ListResponse create(CreateListRequest req) {
        UUID myId = current.requireUserId();
        User me = userRepo.findById(myId)
                .orElseThrow(() -> new ResourceNotFoundException("user", myId));
        FilmList list = listRepo.save(FilmList.builder()
                .user(me)
                .title(req.title())
                .description(req.description())
                .isPublic(req.isPublic() == null ? Boolean.TRUE : req.isPublic())
                .build());
        return mapper.toResponse(list, List.of());
    }

    @Transactional(readOnly = true)
    public ListResponse get(UUID listId) {
        FilmList list = listRepo.findById(listId)
                .orElseThrow(() -> new ResourceNotFoundException("list", listId));
        ensureVisible(list);
        return mapper.toResponse(list, loadFilms(listId));
    }

    @Transactional
    public ListResponse update(UUID listId, UpdateListRequest req) {
        UUID myId = current.requireUserId();
        FilmList list = listRepo.findById(listId)
                .orElseThrow(() -> new ResourceNotFoundException("list", listId));
        ensureOwner(list, myId);
        if (req.title() != null)       list.setTitle(req.title());
        if (req.description() != null) list.setDescription(req.description());
        if (req.isPublic() != null)    list.setIsPublic(req.isPublic());
        return mapper.toResponse(list, loadFilms(listId));
    }

    @Transactional
    public void delete(UUID listId) {
        UUID myId = current.requireUserId();
        FilmList list = listRepo.findById(listId)
                .orElseThrow(() -> new ResourceNotFoundException("list", listId));
        ensureOwner(list, myId);
        listRepo.delete(list);
    }

    @Transactional
    public ListFilmResponse addFilm(UUID listId, AddFilmToListRequest req) {
        UUID myId = current.requireUserId();
        FilmList list = listRepo.findById(listId)
                .orElseThrow(() -> new ResourceNotFoundException("list", listId));
        ensureOwner(list, myId);
        Film film = filmRepo.findById(req.filmId())
                .orElseThrow(() -> new ResourceNotFoundException("film", req.filmId()));
        ListFilm row = listFilmRepo.save(ListFilm.builder()
                .list(list)
                .film(film)
                .note(req.note())
                .sortOrder(req.sortOrder() == null ? 0 : req.sortOrder())
                .build());
        return mapper.toFilmResponse(row);
    }

    @Transactional
    public void removeFilm(UUID listId, UUID filmId) {
        UUID myId = current.requireUserId();
        FilmList list = listRepo.findById(listId)
                .orElseThrow(() -> new ResourceNotFoundException("list", listId));
        ensureOwner(list, myId);
        listFilmRepo.deleteByListIdAndFilmId(listId, filmId);
    }

    @Transactional(readOnly = true)
    public List<ListResponse> myLists() {
        UUID myId = current.requireUserId();
        return listRepo.findByUserIdOrderByCreatedAtDesc(myId).stream()
                .map(list -> mapper.toResponse(list, loadFilms(list.getId())))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ListResponse> listsFor(String username) {
        User user = userRepo.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("user", username));
        return listRepo.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .filter(list -> Boolean.TRUE.equals(list.getIsPublic()))
                .map(list -> mapper.toResponse(list, loadFilms(list.getId())))
                .toList();
    }

    @Transactional(readOnly = true)
    public PagedResponse<ListResponse> publicLists(int page, int size) {
        Page<FilmList> p = listRepo.findByIsPublicTrueOrderByCreatedAtDesc(PageRequest.of(page, size));
        return PagedResponse.from(p, list -> mapper.toResponse(list, loadFilms(list.getId())));
    }

    // ---- helpers ------------------------------------------------------------

    private List<ListFilmResponse> loadFilms(UUID listId) {
        return listFilmRepo.findByListIdOrderBySortOrderAsc(listId).stream()
                .map(mapper::toFilmResponse).toList();
    }

    private void ensureOwner(FilmList list, UUID userId) {
        if (list.getUser() == null || !list.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("Not the owner of this list");
        }
    }

    /** Private lists are only visible to their owner. */
    private void ensureVisible(FilmList list) {
        if (Boolean.TRUE.equals(list.getIsPublic())) return;
        UUID myId = current.tryGet().map(p -> p.userId()).orElse(null);
        if (myId == null || list.getUser() == null
                || !list.getUser().getId().equals(myId)) {
            throw new UnauthorizedException("Private list");
        }
    }
}
