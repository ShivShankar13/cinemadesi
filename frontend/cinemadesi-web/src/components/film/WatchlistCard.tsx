"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Loader2, X } from "lucide-react";
import { FilmPoster } from "./FilmPoster";
import { IndustryBadge } from "./IndustryBadge";
import { LogFilmModal } from "./LogFilmModal";
import { MoodTagsModal } from "./MoodTagsModal";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { useRemoveFromWatchlist } from "@/hooks/useWatchlist";
import { Tag } from "lucide-react";
import type { WatchlistItem } from "@/types";

/**
 * Card used on the /watchlist page. Different from FilmCard because:
 * <ul>
 *   <li>Shows mood tags as pills</li>
 *   <li>"Recommended by" line when the item came from a recommendation</li>
 *   <li>"Mark as watched" CTA → opens LogFilmModal pre-filled with this film</li>
 *   <li>Remove (×) icon</li>
 * </ul>
 */
export function WatchlistCard({
  item,
  index = 0,
}: {
  item: WatchlistItem;
  index?: number;
}) {
  const [logOpen, setLogOpen] = React.useState(false);
  const [tagsOpen, setTagsOpen] = React.useState(false);
  const remove = useRemoveFromWatchlist();

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: Math.min(index, 6) * 0.04 }}
        className="group relative overflow-hidden rounded-xl border border-brand-border bg-brand-surface p-3 transition-all hover:border-brand-borderHi"
      >
        <div className="flex gap-3">
          <Link
            href={`/film/${item.film.id}`}
            className="relative h-32 w-20 shrink-0 overflow-hidden rounded-md ring-1 ring-brand-border"
          >
            <FilmPoster src={item.film.posterUrl} alt={item.film.title} />
          </Link>

          <div className="min-w-0 flex-1">
            <Link href={`/film/${item.film.id}`}>
              <h3 className="line-clamp-2 font-serif text-base font-semibold leading-tight hover:text-brand-gold">
                {item.film.title}
              </h3>
            </Link>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <IndustryBadge industry={item.film.industry} size="sm" />
              {item.film.releaseDate && (
                <span className="text-[10px] uppercase tracking-widest text-brand-textMuted">
                  {item.film.releaseDate.slice(0, 4)}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => setTagsOpen(true)}
              className="mt-2 flex flex-wrap items-center gap-1 rounded-md text-left transition-colors hover:opacity-80"
              aria-label="Edit mood tags"
            >
              {item.moodTags && item.moodTags.length > 0 ? (
                item.moodTags.map((tag) => (
                  <Badge key={tag} variant="default" size="sm">
                    {tag.replace(/_/g, " ").toLowerCase()}
                  </Badge>
                ))
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest text-brand-textMuted hover:text-brand-text">
                  <Tag className="h-3 w-3" />
                  add mood tags
                </span>
              )}
            </button>

            {item.recommendedBy && (
              <Link
                href={`/profile/${item.recommendedBy.username}`}
                className="mt-3 flex items-center gap-2 text-[11px] text-brand-textMuted hover:text-brand-text"
              >
                <UserAvatar user={item.recommendedBy} size="xs" />
                rec by {item.recommendedBy.displayName ?? item.recommendedBy.username}
              </Link>
            )}

            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setLogOpen(true)}
                className="inline-flex items-center gap-1 rounded-lg border border-brand-goldDim bg-brand-goldGlow px-3 py-1.5 text-xs font-semibold text-brand-gold transition-colors hover:border-brand-gold"
              >
                <Check className="h-3.5 w-3.5" />
                Mark watched
              </button>

              <button
                type="button"
                onClick={() => remove.mutate(item.id)}
                disabled={remove.isPending}
                aria-label="Remove from watchlist"
                className="ml-auto inline-flex h-7 w-7 items-center justify-center rounded-md text-brand-textMuted transition-colors hover:bg-brand-surface2 hover:text-brand-red"
              >
                {remove.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <X className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      <LogFilmModal
        film={item.film}
        open={logOpen}
        onOpenChange={setLogOpen}
      />
      <MoodTagsModal
        itemId={item.id}
        initial={item.moodTags ?? []}
        open={tagsOpen}
        onOpenChange={setTagsOpen}
      />
    </>
  );
}
