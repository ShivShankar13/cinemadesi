"use client";

import { cn } from "@/lib/utils";
import { FilmCard } from "./FilmCard";
import { Skeleton } from "@/components/ui/skeleton";
import type { FilmSummary } from "@/types";

interface FilmGridProps {
  films: FilmSummary[];
  loading?: boolean;
  skeletonCount?: number;
  onAddToWatchlist?: (film: FilmSummary) => void;
  className?: string;
}

/**
 * Responsive cinematic grid. Default grid:
 * 3 cols on mobile → 4 sm → 5 md → 6 lg.
 *
 * <p>When {@code loading}, renders matching-shape skeleton cards with
 * the same aspect ratio so the layout doesn't jump.</p>
 */
export function FilmGrid({
  films,
  loading,
  skeletonCount = 12,
  onAddToWatchlist,
  className,
}: FilmGridProps) {
  if (loading) {
    return (
      <div
        className={cn(
          "grid gap-4 grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6",
          className
        )}
      >
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <div key={i} className="space-y-2.5">
            <Skeleton className="aspect-[2/3] w-full rounded-lg" />
            <Skeleton className="h-4 w-3/4 rounded" />
            <Skeleton className="h-3 w-1/2 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid gap-4 grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6",
        className
      )}
    >
      {films.map((film, i) => (
        <FilmCard
          key={film.id}
          film={film}
          index={i}
          onAddToWatchlist={
            onAddToWatchlist ? () => onAddToWatchlist(film) : undefined
          }
        />
      ))}
    </div>
  );
}
