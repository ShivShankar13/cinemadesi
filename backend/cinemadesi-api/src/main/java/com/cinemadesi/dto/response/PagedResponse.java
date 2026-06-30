package com.cinemadesi.dto.response;

import org.springframework.data.domain.Page;

import java.util.List;
import java.util.function.Function;

/**
 * Stable pagination envelope returned by every paginated endpoint.
 *
 * <p>We deliberately do <em>not</em> serialize Spring's {@code Page}
 * directly — its JSON shape is unstable across Spring versions and
 * leaks internal sort/pageable details we don't want in our public API.</p>
 *
 * @param content       items on this page
 * @param page          zero-based page index
 * @param size          requested page size
 * @param totalElements total matching items across all pages
 * @param totalPages    total number of pages
 */
public record PagedResponse<T>(
        List<T> content,
        int page,
        int size,
        long totalElements,
        int totalPages
) {

    /** Build a paged envelope directly from a Spring Data {@link Page}. */
    public static <T> PagedResponse<T> from(Page<T> p) {
        return new PagedResponse<>(
                p.getContent(),
                p.getNumber(),
                p.getSize(),
                p.getTotalElements(),
                p.getTotalPages()
        );
    }

    /**
     * Build a paged envelope from a {@link Page} of entities, mapping
     * each one to a response DTO via {@code mapper}.
     */
    public static <E, T> PagedResponse<T> from(Page<E> p, Function<E, T> mapper) {
        return new PagedResponse<>(
                p.getContent().stream().map(mapper).toList(),
                p.getNumber(),
                p.getSize(),
                p.getTotalElements(),
                p.getTotalPages()
        );
    }
}
