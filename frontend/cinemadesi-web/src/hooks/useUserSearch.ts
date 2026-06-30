"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useDebounce } from "./useDebounce";

export function useUserSearch(query: string) {
  const debounced = useDebounce(query.trim(), 250);
  return useQuery({
    queryKey: ["users", "search", debounced],
    queryFn: () => api.users.search(debounced, 8),
    enabled: debounced.length >= 2,
    staleTime: 30_000,
  });
}
