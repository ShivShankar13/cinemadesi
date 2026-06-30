"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { RecommendationStatus } from "@/types";

export function useInbox() {
  return useQuery({
    queryKey: ["recommendations", "inbox"],
    queryFn: () => api.recommendations.inbox(),
    staleTime: 30_000,
  });
}

export function useSent() {
  return useQuery({
    queryKey: ["recommendations", "sent"],
    queryFn: () => api.recommendations.sent(),
  });
}

export function useSendRecommendation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      filmId: string;
      toUserId?: string;
      toGroupId?: string;
      note?: string;
    }) => api.recommendations.send(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["recommendations", "sent"] });
      toast.success("Recommendation sent");
    },
    onError: () => toast.error("Could not send recommendation"),
  });
}

/**
 * SAVED → backend also creates a watchlist item for me, so invalidate
 * the watchlist cache too.
 */
export function useUpdateRecommendationStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      recId,
      status,
    }: {
      recId: string;
      status: RecommendationStatus;
    }) => api.recommendations.updateStatus(recId, status),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["recommendations", "inbox"] });
      if (vars.status === "SAVED") {
        qc.invalidateQueries({ queryKey: ["watchlist", "me"] });
        toast.success("Added to your watchlist");
      } else {
        toast.success("Recommendation dismissed");
      }
    },
  });
}
