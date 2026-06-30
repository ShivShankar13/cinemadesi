package com.cinemadesi.controller;

import com.cinemadesi.dto.request.AddFilmToListRequest;
import com.cinemadesi.dto.request.CreateListRequest;
import com.cinemadesi.dto.request.UpdateListRequest;
import com.cinemadesi.dto.response.ListFilmResponse;
import com.cinemadesi.dto.response.ListResponse;
import com.cinemadesi.dto.response.PagedResponse;
import com.cinemadesi.service.ListService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/lists")
public class ListController {

    private final ListService lists;

    public ListController(ListService lists) {
        this.lists = lists;
    }

    @PostMapping
    public ResponseEntity<ListResponse> create(@Valid @RequestBody CreateListRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(lists.create(request));
    }

    @GetMapping("/my")
    public List<ListResponse> myLists() {
        return lists.myLists();
    }

    @GetMapping("/public")
    public PagedResponse<ListResponse> publicLists(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size
    ) {
        return lists.publicLists(page, size);
    }

    @GetMapping("/{listId}")
    public ListResponse get(@PathVariable("listId") UUID listId) {
        return lists.get(listId);
    }

    @PatchMapping("/{listId}")
    public ListResponse update(
            @PathVariable("listId") UUID listId,
            @Valid @RequestBody UpdateListRequest request
    ) {
        return lists.update(listId, request);
    }

    @DeleteMapping("/{listId}")
    public ResponseEntity<Void> delete(@PathVariable("listId") UUID listId) {
        lists.delete(listId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{listId}/films")
    public ResponseEntity<ListFilmResponse> addFilm(
            @PathVariable("listId") UUID listId,
            @Valid @RequestBody AddFilmToListRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(lists.addFilm(listId, request));
    }

    @DeleteMapping("/{listId}/films/{filmId}")
    public ResponseEntity<Void> removeFilm(
            @PathVariable("listId") UUID listId,
            @PathVariable("filmId") UUID filmId
    ) {
        lists.removeFilm(listId, filmId);
        return ResponseEntity.noContent().build();
    }
}
