"use client";

import * as React from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { EyeOff, MessageSquareText, Loader2 } from "lucide-react";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { StarRating } from "@/components/film/StarRating";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { useFilmReviews } from "@/hooks/useReviews";
import { useIntersection } from "@/hooks/useIntersection";
import type { DiaryEntry } from "@/types";

/**
 * Paginated public reviews for a film. Each review is a diary entry
 * that has a non-empty {@code reviewText}. Spoilers blur until tapped.
 *
 * <p>Uses infinite scroll — a sentinel at the bottom loads the next page.</p>
 */
export function CommunityReviews({ filmId }: { filmId: string }) {
  const reviews = useFilmReviews(filmId);
  const flat = reviews.data?.pages.flatMap((p) => p.content) ?? [];

  const sentinelRef = useIntersection(() => {
    if (reviews.hasNextPage && !reviews.isFetchingNextPage) reviews.fetchNextPage();
  });

  if (reviews.isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    );
  }

  if (reviews.isError) {
    return (
      <EmptyState
        icon={MessageSquareText}
        title="Couldn't load reviews"
        description="Try again in a moment."
        action={{ label: "Retry", onClick: () => reviews.refetch() }}
      />
    );
  }

  if (flat.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-brand-border bg-brand-surface/40 p-10 text-center">
        <p className="text-sm text-brand-textMuted">
          No reviews yet. Be the first — log this film above.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {flat.map((r, i) => (
        <ReviewRow key={r.id} review={r} index={i} />
      ))}
      {reviews.hasNextPage && (
        <div ref={sentinelRef} className="flex items-center justify-center py-6">
          {reviews.isFetchingNextPage && (
            <Loader2 className="h-4 w-4 animate-spin text-brand-textMuted" />
          )}
        </div>
      )}
    </div>
  );
}

function ReviewRow({ review, index }: { review: DiaryEntry; index: number }) {
  const [showSpoiler, setShowSpoiler] = React.useState(false);
  const [expanded, setExpanded] = React.useState(false);
  const isSpoiler = review.containsSpoilers && !showSpoiler;
  const long = (review.reviewText?.length ?? 0) > 280;

  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index, 6) * 0.03 }}
      className="rounded-xl border border-brand-border bg-brand-surface/60 p-4"
    >
      <div className="flex items-center gap-3">
        <Link
          href={`/profile/${review.user.username}`}
          className="flex items-center gap-2"
        >
          <UserAvatar user={review.user} size="sm" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-brand-text">
              {review.user.displayName || review.user.username}
            </p>
            <p className="text-[11px] text-brand-textMuted">
              @{review.user.username}
            </p>
          </div>
        </Link>

        {review.rating != null && (
          <div className="ml-auto">
            <StarRating value={review.rating} size="sm" />
          </div>
        )}
      </div>

      {review.reviewText && (
        <div className="relative mt-3">
          {isSpoiler && (
            <button
              type="button"
              onClick={() => setShowSpoiler(true)}
              className="absolute inset-0 z-10 flex items-center justify-center gap-2 rounded-md bg-brand-bg/40 text-xs font-semibold uppercase tracking-widest text-brand-text backdrop-blur-md transition-colors hover:bg-brand-bg/50"
            >
              <EyeOff className="h-4 w-4" />
              Spoiler — tap to reveal
            </button>
          )}
          <p
            className={`text-sm leading-relaxed text-brand-text ${
              !expanded ? "line-clamp-4" : ""
            } ${isSpoiler ? "select-none" : ""}`}
          >
            {review.reviewText}
          </p>
          {long && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="mt-1 text-xs font-medium text-brand-gold hover:underline"
            >
              {expanded ? "Show less" : "Read more"}
            </button>
          )}
        </div>
      )}

      <p className="mt-3 text-[10px] uppercase tracking-widest text-brand-textMuted">
        {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
        {review.watchedAt && ` · watched ${review.watchedAt}`}
      </p>
    </motion.article>
  );
}
