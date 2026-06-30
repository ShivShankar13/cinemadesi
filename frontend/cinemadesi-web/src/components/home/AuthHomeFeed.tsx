"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Compass, Loader2, UsersRound } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { FeedItem } from "@/components/diary/FeedItem";
import { FilmCard } from "@/components/film/FilmCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useFeed } from "@/hooks/useFeed";
import { useTrendingFilms } from "@/hooks/useFilms";
import { useCurrentUser } from "@/hooks/useAuth";
import { useIntersection } from "@/hooks/useIntersection";

/**
 * Authenticated home — what signed-in users see at /.
 *
 * <p>Left column: their following feed (infinite scroll).
 * Right column (lg+): trending this week + a starter prompt.</p>
 */
export function AuthHomeFeed() {
  const me = useCurrentUser();
  const feed = useFeed();
  const trending = useTrendingFilms();

  const greeting = niceGreeting(me.data?.displayName ?? me.data?.username);
  const entries = feed.data?.pages.flatMap((p) => p.content) ?? [];
  const hasEntries = entries.length > 0;

  const sentinelRef = useIntersection(() => {
    if (feed.hasNextPage && !feed.isFetchingNextPage) feed.fetchNextPage();
  });

  return (
    <div className="mx-auto flex max-w-7xl gap-10 px-6 pt-8 lg:px-10">
      <Sidebar />

      <div className="min-w-0 flex-1">
        {/* Greeting hero */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative mb-10 overflow-hidden rounded-2xl border border-brand-border bg-brand-surface px-6 py-8 md:px-8"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -left-12 -top-12 h-60 w-60 rounded-full bg-gold-radial blur-3xl opacity-60"
          />
          <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-textMuted">
            Tonight's feature
          </p>
          <h1 className="mt-2 font-serif text-3xl font-bold tracking-tight md:text-4xl">
            {greeting}
          </h1>
          <p className="mt-2 text-sm text-brand-textMuted">
            What did you watch today? Drop it into your diary in a few seconds.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button asChild>
              <Link href="/discover">Find a film to log</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/watchlist">Open watchlist</Link>
            </Button>
          </div>
        </motion.section>

        {/* Feed */}
        <section className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-3">
            <div className="flex items-end justify-between">
              <h2 className="font-serif text-2xl font-bold tracking-tight">
                Friends are watching
              </h2>
              <Link
                href="/discover"
                className="text-xs font-medium text-brand-gold underline-offset-4 hover:underline"
              >
                Find more
              </Link>
            </div>

            {feed.isLoading && <FeedSkeletons />}

            {feed.isError && (
              <EmptyState
                icon={Compass}
                title="Couldn't load your feed"
                description="The server is taking a nap. Try again in a moment."
                action={{ label: "Retry", onClick: () => feed.refetch() }}
              />
            )}

            {!feed.isLoading && !feed.isError && !hasEntries && (
              <EmptyState
                icon={UsersRound}
                title="Follow some film lovers"
                description="Your feed lights up once you start following people. Find them on Discover."
                action={{ label: "Discover films & people", href: "/discover" }}
              />
            )}

            {hasEntries && (
              <div className="space-y-3">
                {entries.map((entry, i) => (
                  <FeedItem key={entry.id} entry={entry} index={i} />
                ))}

                {/* Infinite-scroll sentinel */}
                {feed.hasNextPage && (
                  <div
                    ref={sentinelRef}
                    className="flex items-center justify-center py-6"
                  >
                    {feed.isFetchingNextPage && (
                      <Loader2 className="h-4 w-4 animate-spin text-brand-textMuted" />
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Trending sidebar (lg+) */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-2xl border border-brand-border bg-brand-surface p-5">
              <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-textMuted">
                Trending this week
              </p>
              <h3 className="mt-1 font-serif text-lg font-bold tracking-tight">
                What India's watching
              </h3>

              <div className="mt-4 grid grid-cols-2 gap-3">
                {trending.isLoading &&
                  Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="aspect-[2/3] rounded-md" />
                  ))}
                {trending.data?.slice(0, 4).map((film, i) => (
                  <FilmCard key={film.id} film={film} index={i} showIndustry={false} />
                ))}
                {trending.isSuccess && trending.data.length === 0 && (
                  <p className="col-span-2 text-xs text-brand-textMuted">
                    Trending will appear as people log films.
                  </p>
                )}
              </div>
            </div>
          </aside>
        </section>
      </div>
    </div>
  );
}

function FeedSkeletons() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="flex gap-4 rounded-xl border border-brand-border bg-brand-surface/60 p-4"
        >
          <Skeleton className="h-24 w-16 rounded-md" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-1/3 rounded" />
            <Skeleton className="h-4 w-2/3 rounded" />
            <Skeleton className="h-3 w-full rounded" />
            <Skeleton className="h-3 w-3/4 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

function niceGreeting(name?: string | null): string {
  const hour = new Date().getHours();
  const part =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  return name ? `${part}, ${name.split(" ")[0]}` : `${part}`;
}
