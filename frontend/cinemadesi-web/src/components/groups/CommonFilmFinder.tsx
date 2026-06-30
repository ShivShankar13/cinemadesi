"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Dices, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { FilmPoster } from "@/components/film/FilmPoster";
import { IndustryBadge } from "@/components/film/IndustryBadge";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { useGroupCommonFilms } from "@/hooks/useGroups";
import { cn } from "@/lib/utils";
import type { GroupWatchlistItem } from "@/types";

/**
 * The "Decide for me" centerpiece.
 *
 * <p>Renders the spotlight film (largest), with the rest of the common-films
 * laid out around it. The big button cycles through the films at a fast
 * tempo, then lands on one with a satisfying settle.</p>
 */
export function CommonFilmFinder({ groupId }: { groupId: string }) {
  const { data, isLoading, isError, refetch } = useGroupCommonFilms(groupId);
  const films = React.useMemo(() => data ?? [], [data]);
  const [spotlightIdx, setSpotlightIdx] = React.useState(0);
  const [spinning, setSpinning] = React.useState(false);

  // Pick the most-wanted by default.
  React.useEffect(() => {
    if (films.length > 0) setSpotlightIdx(0);
  }, [films.length]);

  const spotlight = films[spotlightIdx];

  const decide = () => {
    if (films.length < 2) return;
    setSpinning(true);
    // Cycle quickly for ~1.6s, then land on a random pick.
    const total = 1600;
    const intervalStart = 60;
    const intervalEnd = 220;
    let elapsed = 0;
    const tick = () => {
      setSpotlightIdx((i) => (i + 1) % films.length);
      elapsed += intervalStart;
      if (elapsed < total) {
        const delay =
          intervalStart +
          (intervalEnd - intervalStart) * (elapsed / total);
        window.setTimeout(tick, delay);
      } else {
        // Final pick: random but biased toward higher memberCount
        const totalWeight = films.reduce((s, f) => s + f.memberCount, 0);
        let r = Math.random() * totalWeight;
        let pick = 0;
        for (let i = 0; i < films.length; i++) {
          r -= films[i].memberCount;
          if (r <= 0) {
            pick = i;
            break;
          }
        }
        setSpotlightIdx(pick);
        setSpinning(false);
      }
    };
    window.setTimeout(tick, intervalStart);
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-[1fr_320px]">
        <Skeleton className="aspect-[3/2] rounded-2xl" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <EmptyState
        icon={Dices}
        title="Couldn't load common films"
        description="Try again — the backend may have hiccuped."
        action={{ label: "Retry", onClick: () => refetch() }}
      />
    );
  }

  if (films.length === 0) {
    return (
      <EmptyState
        icon={Sparkles}
        title="No films in common yet"
        description="Once two or more members add the same film to their watchlist, it shows up here."
      />
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-[1.4fr_1fr]">
      {/* Spotlight */}
      <div className="relative overflow-hidden rounded-2xl border border-brand-border bg-brand-surface p-6">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-12 -top-12 h-64 w-64 rounded-full bg-gold-radial blur-3xl"
        />
        <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-textMuted">
          spotlight
        </p>

        <AnimatePresence mode="wait">
          <motion.div
            key={spotlight?.film.id}
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ duration: 0.25 }}
            className="mt-4 flex flex-col items-center gap-5 text-center"
          >
            <Link
              href={`/film/${spotlight.film.id}`}
              className="relative h-72 w-48 overflow-hidden rounded-lg ring-1 ring-brand-border shadow-[0_24px_60px_-15px_rgba(0,0,0,0.85)]"
            >
              <FilmPoster
                src={spotlight.film.posterUrl}
                alt={spotlight.film.title}
              />
            </Link>

            <div className="space-y-2">
              <h3 className="font-serif text-2xl font-bold leading-tight">
                {spotlight.film.title}
              </h3>
              <div className="flex items-center justify-center gap-2">
                <IndustryBadge industry={spotlight.film.industry} size="sm" />
                {spotlight.film.releaseDate && (
                  <span className="text-[10px] uppercase tracking-widest text-brand-textMuted">
                    {spotlight.film.releaseDate.slice(0, 4)}
                  </span>
                )}
              </div>
              <p className="text-xs text-brand-textMuted">
                <span className="text-brand-gold font-semibold">
                  {spotlight.memberCount}
                </span>{" "}
                {spotlight.memberCount === 1 ? "member wants" : "members want"} to watch
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="relative mt-6 flex justify-center">
          <Button
            onClick={decide}
            disabled={spinning || films.length < 2}
            size="lg"
            className="bg-brand-gold text-black font-bold hover:bg-[#d9a83a]"
          >
            <Dices className={cn("h-5 w-5", spinning && "animate-spin")} />
            {spinning ? "Deciding…" : "Decide for me"}
          </Button>
        </div>
      </div>

      {/* Other common films */}
      <div className="space-y-3">
        <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-textMuted">
          others in common
        </p>
        <div className="space-y-2">
          {films
            .map((f, i) => ({ f, i }))
            .filter(({ i }) => i !== spotlightIdx)
            .slice(0, 6)
            .map(({ f, i }) => (
              <button
                key={f.film.id}
                type="button"
                onClick={() => setSpotlightIdx(i)}
                className="group flex w-full items-center gap-3 rounded-lg border border-brand-border bg-brand-surface/60 p-2.5 text-left transition-colors hover:border-brand-borderHi"
              >
                <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded">
                  <FilmPoster src={f.film.posterUrl} alt={f.film.title} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-brand-text">
                    {f.film.title}
                  </p>
                  <div className="mt-0.5 flex items-center gap-2">
                    <span className="text-[10px] uppercase tracking-widest text-brand-textMuted">
                      {f.memberCount} wanted
                    </span>
                  </div>
                </div>
                <MembersStack members={f.addedBy} />
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}

function MembersStack({ members }: { members: GroupWatchlistItem["addedBy"] }) {
  return (
    <div className="flex -space-x-1.5">
      {members.slice(0, 3).map((m) => (
        <div key={m.id} className="ring-2 ring-brand-surface rounded-full">
          <UserAvatar user={m} size="xs" />
        </div>
      ))}
    </div>
  );
}
