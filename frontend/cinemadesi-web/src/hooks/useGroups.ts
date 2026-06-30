"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";

export function useMyGroups() {
  return useQuery({
    queryKey: ["groups", "my"],
    queryFn: () => api.groups.myGroups(),
    staleTime: 60_000,
  });
}

export function useGroup(groupId: string | undefined) {
  return useQuery({
    queryKey: ["group", groupId],
    queryFn: () => api.groups.byId(groupId!),
    enabled: !!groupId,
  });
}

export function useGroupMergedWatchlist(groupId: string | undefined) {
  return useQuery({
    queryKey: ["group", groupId, "watchlist"],
    queryFn: () => api.groups.mergedWatchlist(groupId!),
    enabled: !!groupId,
  });
}

export function useGroupCommonFilms(groupId: string | undefined) {
  return useQuery({
    queryKey: ["group", groupId, "common"],
    queryFn: () => api.groups.commonFilms(groupId!),
    enabled: !!groupId,
  });
}

export function useGroupFeed(groupId: string | undefined) {
  return useInfiniteQuery({
    queryKey: ["group", groupId, "feed"],
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      api.groups.feed(groupId!, pageParam as number, 20),
    enabled: !!groupId,
    getNextPageParam: (last) =>
      last.page + 1 < last.totalPages ? last.page + 1 : undefined,
  });
}

export function useCreateGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { name: string; description?: string; coverImageUrl?: string }) =>
      api.groups.create(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["groups", "my"] });
      toast.success("Group created");
    },
    onError: () => toast.error("Could not create group"),
  });
}

export function useInviteMember(groupId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { userId: string; role?: "ADMIN" | "MEMBER" }) =>
      api.groups.invite(groupId!, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["group", groupId] });
      toast.success("Member added");
    },
    onError: () => toast.error("Could not add member"),
  });
}

export function useRemoveMember(groupId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => api.groups.removeMember(groupId!, userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["group", groupId] });
      toast.success("Member removed");
    },
  });
}
