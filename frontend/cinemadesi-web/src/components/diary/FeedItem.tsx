"use client";

import * as React from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import {
  Bookmark,
  EyeOff,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { FilmPoster } from "@/components/film/FilmPoster";
import { IndustryBadge } from "@/components/film/IndustryBadge";
import { StarRating } from "@/components/film/StarRating";
import { LogFilmModal } from "@/components/film/LogFilmModal";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuickAddToWatchlist } from "@/hooks/useWatchlist";
import { useDeleteDiaryEntry } from "@/hooks/useDiary";
import type { DiaryEntry } from "@/types";

export function FeedItem({
  entry,
  index = 0,
}: {
  entry: DiaryEntry;
  index?: number;
}) {
  const [showSpoiler, setShowSpoiler] = React.useState(false);
  const [expanded, setExpanded] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);

  const { data: session } = useSession();
  const isOwn = session?.user?.id === entry.user.id;

  const quickAdd = useQuickAddToWatchlist();
  const deleteEntry = useDeleteDiaryEntry();

  const review = entry.reviewText?.trim();
  const isSpoiler = entry.containsSpoilers && !showSpoiler;

  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: Math.min(index, 6) * 0.04 }}
        className="group relative flex gap-4 rounded-xl border border-brand-border bg-brand-surface/60 p-4 transition-colors hover:border-brand-borderHi"
      >
        <Link
          href={`/film/${entry.film.id}`}
          className="relative h-24 w-16 shrink-0 overflow-hidden rounded-md ring-1 ring-brand-border"
          aria-label={entry.film.title}
        >
          <FilmPoster src={entry.film.posterUrl} alt={entry.film.title} />
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-brand-textMuted">
            <Link
              href={`/profile/${entry.user.username}`}
              className="flex items-center gap-2 text-brand-text"
            >
              <UserAvatar user={entry.user} size="xs" />
              <span className="font-medium">
                {entry.user.displayName || entry.user.username}
              </span>
            </Link>
            <span>watched</span>
            <Link
              href={`/film/${entry.film.id}`}
              className="font-serif text-sm font-semibold text-brand-text hover:text-brand-gold"
            >
              {entry.film.title}
            </Link>
            {entry.film.releaseDate && (
              <span className="text-brand-textMuted">
                ({entry.film.releaseDate.slice(0, 4)})
              </span>
            )}
            <span aria-hidden>·</span>
            <span>
              {formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}
            </span>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-3">
            {entry.rating != null && <StarRating value={entry.rating} size="sm" />}
            <IndustryBadge industry={entry.film.industry} size="sm" />
            {entry.watchMode && (
              <span className="text-[10px] uppercase tracking-widest text-brand-textMuted">
                {modeLabel(entry.watchMode, entry.ottPlatform)}
              </span>
            )}
          </div>

          {review && (
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
                className={`text-sm leading-relaxed text-brand-textMuted ${
                  !expanded ? "line-clamp-3" : ""
                } ${isSpoiler ? "select-none" : ""}`}
              >
                {review}
              </p>
              {review.length > 240 && (
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

          <div className="mt-3 flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => quickAdd(entry.film)}
              aria-label={`Add ${entry.film.title} to my watchlist`}
            >
              <Bookmark className="h-3.5 w-3.5" />
              Save
            </Button>
          </div>
        </div>

        {/* Own-entry edit/delete menu */}
        {isOwn && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="Entry options"
                className="absolute right-3 top-3 inline-flex h-7 w-7 items-center justify-center rounded-md text-brand-textMuted opacity-0 transition-all hover:bg-brand-surface2 hover:text-brand-text group-hover:opacity-100"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => setEditOpen(true)}>
                <Pencil className="h-3.5 w-3.5" />
                Edit entry
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => {
                  if (window.confirm("Delete this diary entry?")) {
                    deleteEntry.mutate(entry.id);
                  }
                }}
                className="text-brand-red focus:text-brand-red"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </motion.article>

      {isOwn && (
        <LogFilmModal
          film={entry.film}
          entry={entry}
          open={editOpen}
          onOpenChange={setEditOpen}
        />
      )}
    </>
  );
}

function modeLabel(mode: string, ott: string | null) {
  if (mode === "THEATRE") return "Theatre 🎬";
  if (mode === "OTT") return `OTT · ${ott ?? "Streaming"}`;
  if (mode === "HOME") return "Home 🏠";
  return mode;
}
