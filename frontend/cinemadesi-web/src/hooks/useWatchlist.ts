"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { FilmSummary } from "@/types";

export function useMyWatchlist() {
  return useQuery({
    queryKey: ["watchlist", "me"],
    queryFn: () => api.watchlist.getAll(),
    staleTime: 30_000,
  });
}

export function useAddToWatchlist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { filmId: string; moodTags?: string[] }) =>
      api.watchlist.add(body),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["watchlist", "me"] });
      toast.success("Added to watchlist", {
        description: vars.filmId ? "Catch you on movie night." : undefined,
      });
    },
    onError: () => toast.error("Could not add to watchlist"),
  });
}

export function useRemoveFromWatchlist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => api.watchlist.remove(itemId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["watchlist", "me"] });
      toast.success("Removed from watchlist");
    },
  });
}

export function useMarkWatched() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      itemId,
      body,
    }: {
      itemId: string;
      body: {
        watchedAt: string;
        rating?: number;
        reviewText?: string;
        watchMode?: string;
        ottPlatform?: string;
      };
    }) => api.watchlist.markWatched(itemId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["watchlist", "me"] });
      qc.invalidateQueries({ queryKey: ["feed"] });
      toast.success("Logged to your diary");
    },
  });
}

/**
 * Convenience helper for the FilmCard quick-add button. Optimistically
 * updates the cache so the heart fills before the network round-trip.
 */
export function useQuickAddToWatchlist() {
  const add = useAddToWatchlist();
  return (film: FilmSummary) => add.mutate({ filmId: film.id });
}
