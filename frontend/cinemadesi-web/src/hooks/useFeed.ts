"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

const PAGE_SIZE = 20;

/**
 * Infinite home feed — diary entries from the users we follow.
 * Pages by Spring Data's zero-based page number.
 */
export function useFeed() {
  return useInfiniteQuery({
    queryKey: ["feed"],
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      api.diary.feed(pageParam as number, PAGE_SIZE),
    getNextPageParam: (last) => {
      if (last.page + 1 < last.totalPages) return last.page + 1;
      return undefined;
    },
    staleTime: 30_000,
  });
}
