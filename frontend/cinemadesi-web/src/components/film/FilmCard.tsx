"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { FilmPoster } from "./FilmPoster";
import { IndustryBadge } from "./IndustryBadge";
import { StarRating } from "./StarRating";
import type { FilmSummary } from "@/types";

interface FilmCardProps {
  film: FilmSummary;
  /** When the caller has watched this film, shows the rating overlay. */
  userRating?: number;
  /** Show industry pill below the poster. Default true. */
  showIndustry?: boolean;
  /** Quick add-to-watchlist callback. Renders the + button on hover when provided. */
  onAddToWatchlist?: () => void;
  className?: string;
  /** Stagger index (0–5) — used by parent grids to cascade the entrance. */
  index?: number;
}

/**
 * The atom of every film grid on the site. Cinematic feel:
 * <ul>
 *   <li>Subtle lift + scale on hover (Framer Motion)</li>
 *   <li>Gradient overlay slides up from bottom</li>
 *   <li>Industry color glow ring matches the film's region</li>
 *   <li>If the user has watched it, the rating shows as a corner badge</li>
 * </ul>
 */
export function FilmCard({
  film,
  userRating,
  showIndustry = true,
  onAddToWatchlist,
  className,
  index = 0,
}: FilmCardProps) {
  const year = film.releaseDate ? film.releaseDate.slice(0, 4) : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: Math.min(index, 5) * 0.05,
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={{ y: -4 }}
      className={cn("group relative", className)}
    >
      <Link
        href={`/film/${film.id}`}
        className="block focus-visible:outline-none"
        aria-label={`${film.title}${year ? ` (${year})` : ""}`}
      >
        <div className="relative aspect-[2/3] overflow-hidden rounded-lg border border-brand-border bg-brand-surface2 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.7)] transition-all duration-200 group-hover:border-brand-borderHi group-hover:shadow-[0_20px_48px_-12px_rgba(0,0,0,0.85)]">
          <FilmPoster
            src={film.posterUrl}
            alt={film.title}
            className="transition-transform duration-500 group-hover:scale-[1.04]"
          />

          {/* User rating corner badge */}
          {userRating !== undefined && (
            <div className="absolute right-2 top-2 rounded-md bg-black/70 px-1.5 py-1 backdrop-blur-sm">
              <StarRating value={userRating} size="sm" />
            </div>
          )}

          {/* Hover gradient overlay */}
          <div
            className="poster-overlay pointer-events-none absolute inset-0 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
            aria-hidden
          />

          {/* Hover content */}
          <div className="absolute inset-x-0 bottom-0 z-10 translate-y-2 px-3 pb-3 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <h3 className="font-serif text-sm font-semibold leading-tight text-brand-text line-clamp-2">
              {film.title}
            </h3>
            {year && (
              <p className="mt-0.5 text-[10px] uppercase tracking-widest text-brand-textMuted">
                {year}
              </p>
            )}
          </div>

          {/* Quick add — gold accent on hover */}
          {onAddToWatchlist && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onAddToWatchlist();
              }}
              aria-label={`Add ${film.title} to watchlist`}
              className="absolute right-2 top-2 z-20 flex h-8 w-8 -translate-y-1 items-center justify-center rounded-lg border border-brand-goldDim bg-brand-goldGlow text-brand-gold opacity-0 backdrop-blur transition-all duration-200 hover:bg-[rgba(232,184,75,0.18)] hover:border-brand-gold group-hover:translate-y-0 group-hover:opacity-100"
              style={{ display: userRating !== undefined ? "none" : undefined }}
            >
              <Plus className="h-4 w-4" />
            </button>
          )}

          {/* Subtle sparkle when the film is freshly added */}
          {film.releaseDate && isRecent(film.releaseDate) && (
            <div
              className="absolute left-2 top-2 z-10 flex items-center gap-1 rounded-full bg-brand-bg/80 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-brand-gold backdrop-blur"
              aria-label="Recently released"
            >
              <Sparkles className="h-3 w-3" />
              new
            </div>
          )}
        </div>

        {/* Below-poster metadata */}
        <div className="mt-3 space-y-1.5">
          <h4 className="line-clamp-1 font-sans text-sm font-medium text-brand-text">
            {film.title}
          </h4>
          <div className="flex items-center gap-2">
            {showIndustry && <IndustryBadge industry={film.industry} size="sm" />}
            {year && (
              <span className="text-[10px] uppercase tracking-widest text-brand-textMuted">
                {year}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/** Returns true if release date is in the last 60 days. */
function isRecent(iso: string): boolean {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return false;
  const diffDays = (Date.now() - d.getTime()) / 86_400_000;
  return diffDays >= 0 && diffDays < 60;
}
