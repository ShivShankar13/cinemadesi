"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";

export function useDiary(username: string | undefined, page = 0, size = 20) {
  return useQuery({
    queryKey: ["diary", username, page],
    queryFn: () => api.diary.feed(page, size), // note: per-user endpoint lives under /users/:username/diary; we expose that separately
    enabled: !!username,
  });
}

/**
 * The big one — `POST /diary`. Invalidates feed + watchlist + my profile
 * stats so everything refreshes after a log.
 */
export function useLogFilm() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      filmId: string;
      watchedAt: string;
      rating?: number;
      reviewText?: string;
      watchMode?: string;
      ottPlatform?: string;
      containsSpoilers?: boolean;
    }) => api.diary.log(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["feed"] });
      qc.invalidateQueries({ queryKey: ["watchlist", "me"] });
      qc.invalidateQueries({ queryKey: ["me"] });
      toast.success("Logged.");
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Could not log this film";
      toast.error(msg);
    },
  });
}

export function useUpdateDiaryEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      entryId,
      body,
    }: {
      entryId: string;
      body: Partial<{
        watchedAt: string;
        rating: number;
        reviewText: string;
        watchMode: string;
        ottPlatform: string;
        containsSpoilers: boolean;
      }>;
    }) => api.diary.update(entryId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["feed"] });
      qc.invalidateQueries({ queryKey: ["user"] });
      toast.success("Diary entry updated");
    },
    onError: () => toast.error("Could not update the entry"),
  });
}

export function useDeleteDiaryEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (entryId: string) => api.diary.delete(entryId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["feed"] });
      qc.invalidateQueries({ queryKey: ["user"] });
      qc.invalidateQueries({ queryKey: ["me"] });
      toast.success("Diary entry deleted");
    },
    onError: () => toast.error("Could not delete the entry"),
  });
}
