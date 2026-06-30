"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Industry } from "@/types";
import { useDebounce } from "./useDebounce";

/**
 * Debounced film search. Returns an empty page while query is &lt; 2 chars
 * so we don't spam the backend on the first keystroke.
 */
export function useFilmSearch(query: string, industry?: Industry) {
  const debounced = useDebounce(query.trim(), 300);
  const ready = debounced.length >= 2;

  return useQuery({
    queryKey: ["films", "search", debounced, industry ?? "ALL"],
    queryFn: () => api.films.search({ q: debounced, industry, page: 0, size: 12 }),
    enabled: ready,
    staleTime: 60_000,
  });
}

export function useTrendingFilms(industry?: Industry) {
  return useQuery({
    queryKey: ["films", "trending", industry ?? "ALL"],
    queryFn: () => api.films.trending(industry),
    staleTime: 5 * 60_000,
  });
}

export function useFilm(id: string | undefined) {
  return useQuery({
    queryKey: ["film", id],
    queryFn: () => api.films.byId(id!),
    enabled: !!id,
    staleTime: 5 * 60_000,
  });
}
