"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Bookmark,
  Clapperboard,
  Clock,
  ListPlus,
  Loader2,
  PenLine,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/EmptyState";
import { FilmPoster } from "@/components/film/FilmPoster";
import { IndustryBadge } from "@/components/film/IndustryBadge";
import { LogFilmModal } from "@/components/film/LogFilmModal";
import { RecommendModal } from "@/components/recommendations/RecommendModal";
import { AddToListModal } from "@/components/lists/AddToListModal";
import { CommunityReviews } from "@/components/film/CommunityReviews";
import { useFilm } from "@/hooks/useFilms";
import { useAddToWatchlist } from "@/hooks/useWatchlist";
import { cn } from "@/lib/utils";

export default function FilmDetailPage() {
  const params = useParams<{ id: string }>();
  const film = useFilm(params?.id);
  const addToWatchlist = useAddToWatchlist();

  const [logOpen, setLogOpen] = React.useState(false);
  const [recOpen, setRecOpen] = React.useState(false);
  const [listOpen, setListOpen] = React.useState(false);

  if (film.isLoading) return <FilmDetailSkeleton />;
  if (film.isError || !film.data) {
    return (
      <div className="mx-auto max-w-7xl px-6 pt-12 lg:px-10">
        <EmptyState
          icon={Clapperboard}
          title="Couldn't find this film"
          description="The film may have been removed, or the backend is asleep."
          action={{ label: "Try again", onClick: () => film.refetch() }}
        />
      </div>
    );
  }

  const f = film.data;
  const year = f.releaseDate ? f.releaseDate.slice(0, 4) : "";
  const summary = { ...f, posterUrl: f.posterUrl };

  return (
    <>
      <LogFilmModal film={summary} open={logOpen} onOpenChange={setLogOpen} />
      <RecommendModal film={summary} open={recOpen} onOpenChange={setRecOpen} />
      <AddToListModal film={summary} open={listOpen} onOpenChange={setListOpen} />

      {/* ─── Backdrop hero ─────────────────────────────────────────────── */}
      <section className="relative">
        <div className="relative h-[40vh] min-h-[280px] w-full overflow-hidden">
          {f.backdropUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={f.backdropUrl}
              alt=""
              className="h-full w-full object-cover opacity-40 blur-[2px] scale-105"
            />
          ) : (
            <div aria-hidden className="h-full w-full bg-mesh-hero opacity-60" />
          )}
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-b from-transparent via-brand-bg/60 to-brand-bg"
          />
        </div>

        <div className="mx-auto -mt-44 max-w-7xl px-6 lg:px-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="grid gap-8 md:grid-cols-[220px_1fr]"
          >
            {/* Poster with thick shadow */}
            <div className="relative h-80 w-56 overflow-hidden rounded-xl ring-1 ring-brand-border shadow-[0_30px_80px_-20px_rgba(0,0,0,0.95)]">
              <FilmPoster src={f.posterUrl} alt={f.title} priority />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <IndustryBadge industry={f.industry} />
                {year && (
                  <Badge variant="outline" size="default">
                    {year}
                  </Badge>
                )}
                {f.runtimeMinutes && (
                  <Badge variant="default" size="default" className="gap-1.5">
                    <Clock className="h-3 w-3" />
                    {f.runtimeMinutes}m
                  </Badge>
                )}
              </div>

              <h1 className="mt-3 font-serif text-4xl font-black leading-[1.05] tracking-tight md:text-6xl">
                {f.title}
              </h1>
              {f.originalTitle && f.originalTitle !== f.title && (
                <p className="mt-1 font-serif text-lg italic text-brand-textMuted">
                  {f.originalTitle}
                </p>
              )}

              {/* Director + genres */}
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-brand-textMuted">
                {f.director && (
                  <span>
                    Directed by{" "}
                    <span className="text-brand-text">{f.director}</span>
                  </span>
                )}
                {f.genres && f.genres.length > 0 && (
                  <span className="flex flex-wrap items-center gap-1.5">
                    {f.genres.map((g) => (
                      <Badge key={g} variant="default" size="sm">
                        {g}
                      </Badge>
                    ))}
                  </span>
                )}
              </div>

              {/* Overview */}
              {f.overview && (
                <p className="mt-6 max-w-3xl text-base leading-relaxed text-brand-textMuted">
                  {f.overview}
                </p>
              )}

              {/* Actions */}
              <div className="mt-7 flex flex-wrap gap-3">
                <Button size="lg" onClick={() => setLogOpen(true)}>
                  <PenLine className="h-4 w-4" />
                  Log this film
                </Button>
                <Button
                  size="lg"
                  variant="gold"
                  onClick={() => addToWatchlist.mutate({ filmId: f.id })}
                  disabled={addToWatchlist.isPending}
                >
                  {addToWatchlist.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Bookmark className="h-4 w-4" />
                  )}
                  Add to watchlist
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setRecOpen(true)}
                >
                  <Send className="h-4 w-4" />
                  Recommend
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setListOpen(true)}
                >
                  <ListPlus className="h-4 w-4" />
                  Add to list
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Community reviews ─────────────────────────────────────────── */}
      <section className="mx-auto mt-20 max-w-7xl px-6 lg:px-10">
        <h2 className="font-serif text-2xl font-bold tracking-tight">
          <span className="border-l-2 border-brand-gold pl-3">
            Community reviews
          </span>
        </h2>
        <div className="mt-6">
          <CommunityReviews filmId={f.id} />
        </div>
      </section>
    </>
  );
}

function FilmDetailSkeleton() {
  return (
    <div className="relative">
      <Skeleton className="h-[40vh] w-full rounded-none" />
      <div className="mx-auto -mt-44 max-w-7xl px-6 lg:px-10">
        <div className="grid gap-8 md:grid-cols-[220px_1fr]">
          <Skeleton className="h-80 w-56 rounded-xl" />
          <div className="space-y-3">
            <Skeleton className="h-5 w-32 rounded" />
            <Skeleton className="h-12 w-3/4 rounded" />
            <Skeleton className="h-4 w-1/2 rounded" />
            <Skeleton className="h-24 w-full rounded" />
            <div className="flex gap-3 pt-4">
              <Skeleton className="h-12 w-40 rounded-lg" />
              <Skeleton className="h-12 w-44 rounded-lg" />
              <Skeleton className={cn("h-12 w-36 rounded-lg")} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
