"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { Bookmark, Loader2, X } from "lucide-react";
import { FilmPoster } from "@/components/film/FilmPoster";
import { IndustryBadge } from "@/components/film/IndustryBadge";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { Badge } from "@/components/ui/badge";
import { useUpdateRecommendationStatus } from "@/hooks/useRecommendations";
import { cn } from "@/lib/utils";
import type { Recommendation } from "@/types";

interface RecommendationCardProps {
  rec: Recommendation;
  /** Inbox shows action buttons; sent just shows the status pill. */
  context: "inbox" | "sent";
  index?: number;
}

export function RecommendationCard({
  rec,
  context,
  index = 0,
}: RecommendationCardProps) {
  const updateStatus = useUpdateRecommendationStatus();
  const pending = rec.status === "PENDING";

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index, 6) * 0.04 }}
      className={cn(
        "flex gap-4 rounded-xl border p-4 transition-colors",
        pending
          ? "border-brand-goldDim/60 bg-brand-surface/80"
          : "border-brand-border bg-brand-surface/40"
      )}
    >
      <Link
        href={`/film/${rec.film.id}`}
        className="relative h-28 w-20 shrink-0 overflow-hidden rounded-md ring-1 ring-brand-border"
        aria-label={rec.film.title}
      >
        <FilmPoster src={rec.film.posterUrl} alt={rec.film.title} />
      </Link>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-brand-textMuted">
          <Link
            href={`/profile/${rec.fromUser.username}`}
            className="flex items-center gap-2 text-brand-text"
          >
            <UserAvatar user={rec.fromUser} size="xs" />
            <span className="font-medium">
              {rec.fromUser.displayName || rec.fromUser.username}
            </span>
          </Link>
          <span>recommended</span>
          <Link
            href={`/film/${rec.film.id}`}
            className="font-serif text-sm font-semibold text-brand-text hover:text-brand-gold"
          >
            {rec.film.title}
          </Link>
          <span aria-hidden>·</span>
          <span>{formatDistanceToNow(new Date(rec.createdAt), { addSuffix: true })}</span>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <IndustryBadge industry={rec.film.industry} size="sm" />
          {rec.toGroup && (
            <Badge variant="outline" size="sm">
              to {rec.toGroup.name}
            </Badge>
          )}
          {!pending && <StatusBadge status={rec.status} />}
        </div>

        {rec.note && (
          <p className="mt-3 rounded-md border-l-2 border-brand-goldDim bg-brand-surface3/40 px-3 py-2 text-sm italic text-brand-textMuted">
            "{rec.note}"
          </p>
        )}

        {context === "inbox" && pending && (
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() =>
                updateStatus.mutate({ recId: rec.id, status: "SAVED" })
              }
              disabled={updateStatus.isPending}
              className="inline-flex items-center gap-1 rounded-lg border border-brand-goldDim bg-brand-goldGlow px-3 py-1.5 text-xs font-semibold text-brand-gold transition-colors hover:border-brand-gold disabled:opacity-50"
            >
              {updateStatus.isPending && updateStatus.variables?.status === "SAVED" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Bookmark className="h-3.5 w-3.5" />
              )}
              Add to watchlist
            </button>
            <button
              type="button"
              onClick={() =>
                updateStatus.mutate({ recId: rec.id, status: "DISMISSED" })
              }
              disabled={updateStatus.isPending}
              className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-brand-textMuted transition-colors hover:bg-brand-surface2 hover:text-brand-red disabled:opacity-50"
            >
              <X className="h-3.5 w-3.5" />
              Dismiss
            </button>
          </div>
        )}
      </div>
    </motion.article>
  );
}

function StatusBadge({ status }: { status: Recommendation["status"] }) {
  if (status === "SAVED") {
    return (
      <Badge variant="gold" size="sm">
        saved
      </Badge>
    );
  }
  if (status === "DISMISSED") {
    return <Badge variant="default" size="sm">dismissed</Badge>;
  }
  return <Badge variant="outline" size="sm">pending</Badge>;
}
