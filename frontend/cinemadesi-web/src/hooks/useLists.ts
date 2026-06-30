"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";

export function useMyLists() {
  return useQuery({
    queryKey: ["lists", "my"],
    queryFn: () => api.lists.myLists(),
    staleTime: 60_000,
  });
}

export function useList(listId: string | undefined) {
  return useQuery({
    queryKey: ["list", listId],
    queryFn: () => api.lists.byId(listId!),
    enabled: !!listId,
  });
}

export function usePublicLists() {
  return useInfiniteQuery({
    queryKey: ["lists", "public"],
    initialPageParam: 0,
    queryFn: ({ pageParam }) => api.lists.publicLists(pageParam as number, 20),
    getNextPageParam: (last) =>
      last.page + 1 < last.totalPages ? last.page + 1 : undefined,
  });
}

export function useCreateList() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { title: string; description?: string; isPublic?: boolean }) =>
      api.lists.create(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["lists", "my"] });
      toast.success("List created");
    },
    onError: () => toast.error("Could not create list"),
  });
}

export function useUpdateList(listId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<{ title: string; description: string; isPublic: boolean }>) =>
      api.lists.update(listId!, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["list", listId] });
      qc.invalidateQueries({ queryKey: ["lists", "my"] });
      toast.success("List updated");
    },
  });
}

export function useDeleteList() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (listId: string) => api.lists.delete(listId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["lists", "my"] });
      toast.success("List deleted");
    },
  });
}

export function useAddFilmToList(listId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { filmId: string; note?: string; sortOrder?: number }) =>
      api.lists.addFilm(listId!, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["list", listId] });
      toast.success("Added to list");
    },
    onError: () => toast.error("Could not add to list"),
  });
}

export function useRemoveFilmFromList(listId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (filmId: string) => api.lists.removeFilm(listId!, filmId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["list", listId] });
      toast.success("Removed from list");
    },
  });
}
