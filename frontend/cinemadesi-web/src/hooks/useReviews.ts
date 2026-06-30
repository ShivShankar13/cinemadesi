"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

const PAGE_SIZE = 10;

export function useFilmReviews(filmId: string | undefined) {
  return useInfiniteQuery({
    queryKey: ["film", filmId, "reviews"],
    initialPageParam: 0,
    queryFn: ({ pageParam }) => api.films.reviews(filmId!, pageParam as number, PAGE_SIZE),
    enabled: !!filmId,
    getNextPageParam: (last) =>
      last.page + 1 < last.totalPages ? last.page + 1 : undefined,
    staleTime: 60_000,
  });
}
