"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";

export function useUpdateMe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      displayName?: string;
      bio?: string;
      avatarUrl?: string;
    }) => api.users.updateMe(body),
    onSuccess: (updated) => {
      // Invalidate everywhere this user might be cached.
      qc.setQueryData(["me"], updated);
      qc.invalidateQueries({ queryKey: ["user", updated.username] });
      qc.invalidateQueries({ queryKey: ["me"] });
      toast.success("Profile updated");
    },
    onError: () => toast.error("Could not update profile"),
  });
}

export function useUserProfile(username: string | undefined) {
  return useQuery({
    queryKey: ["user", username],
    queryFn: () => api.users.byUsername(username!),
    enabled: !!username,
    staleTime: 60_000,
  });
}

export function useUserDiary(username: string | undefined) {
  return useInfiniteQuery({
    queryKey: ["user", username, "diary"],
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      api.users.diary(username!, pageParam as number, 20),
    enabled: !!username,
    getNextPageParam: (last) =>
      last.page + 1 < last.totalPages ? last.page + 1 : undefined,
  });
}

export function useUserWatchlist(username: string | undefined) {
  return useQuery({
    queryKey: ["user", username, "watchlist"],
    queryFn: () => api.users.watchlist(username!),
    enabled: !!username,
  });
}

export function useUserLists(username: string | undefined) {
  return useQuery({
    queryKey: ["user", username, "lists"],
    queryFn: () => api.users.lists(username!),
    enabled: !!username,
  });
}

/**
 * Follow / unfollow with optimistic UI — flips the `isFollowedByMe`
 * flag on the cached profile immediately, rolls back on error.
 */
export function useFollow(username: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, follow }: { userId: string; follow: boolean }) =>
      follow ? api.users.follow(userId) : api.users.unfollow(userId),
    onMutate: async ({ follow }) => {
      if (!username) return {};
      await qc.cancelQueries({ queryKey: ["user", username] });
      const prev = qc.getQueryData<unknown>(["user", username]);
      qc.setQueryData(["user", username], (old: unknown) => {
        if (!old || typeof old !== "object") return old;
        const o = old as Record<string, unknown>;
        return {
          ...o,
          isFollowedByMe: follow,
          totalFollowers:
            typeof o.totalFollowers === "number"
              ? o.totalFollowers + (follow ? 1 : -1)
              : o.totalFollowers,
        };
      });
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx && username && "prev" in ctx) {
        qc.setQueryData(["user", username], ctx.prev);
      }
      toast.error("Could not update follow");
    },
    onSettled: () => {
      if (username) qc.invalidateQueries({ queryKey: ["user", username] });
    },
  });
}
