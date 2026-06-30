"use client";

import * as React from "react";
import { Bookmark, Compass } from "lucide-react";
import { motion } from "framer-motion";
import { WatchlistCard } from "@/components/film/WatchlistCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyWatchlist } from "@/hooks/useWatchlist";
import { useRequireAuth } from "@/hooks/useAuth";
import { MOOD_TAGS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export default function WatchlistPage() {
  useRequireAuth();
  const watchlist = useMyWatchlist();
  const [filter, setFilter] = React.useState<string | null>(null);

  const items = watchlist.data ?? [];
  const filtered = filter
    ? items.filter((i) => i.moodTags?.includes(filter))
    : items;

  return (
    <div className="mx-auto max-w-7xl px-6 pt-8 pb-16 lg:px-10">
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="mb-8"
      >
        <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-textMuted">
          Your saves
        </p>
        <h1 className="mt-2 font-serif text-4xl font-bold leading-tight tracking-tight md:text-5xl">
          The watchlist.
        </h1>
        <p className="mt-3 text-brand-textMuted">
          {items.length} film{items.length === 1 ? "" : "s"} queued for later.
        </p>
      </motion.section>

      {/* Mood-tag filter chips */}
      {items.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          <FilterChip
            label="All"
            active={filter === null}
            onClick={() => setFilter(null)}
          />
          {MOOD_TAGS.map((tag) => {
            const count = items.filter((i) => i.moodTags?.includes(tag)).length;
            if (count === 0) return null;
            return (
              <FilterChip
                key={tag}
                label={`${tag.replace(/_/g, " ").toLowerCase()} · ${count}`}
                active={filter === tag}
                onClick={() => setFilter(filter === tag ? null : tag)}
              />
            );
          })}
        </div>
      )}

      {watchlist.isLoading && (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-xl" />
          ))}
        </div>
      )}

      {watchlist.isError && (
        <EmptyState
          icon={Compass}
          title="Couldn't load your watchlist"
          description="Try again — the backend may have hiccuped."
          action={{ label: "Retry", onClick: () => watchlist.refetch() }}
        />
      )}

      {watchlist.isSuccess && items.length === 0 && (
        <EmptyState
          icon={Bookmark}
          title="Nothing saved yet"
          description="Add films you want to watch later. We'll keep them queued for you."
          action={{ label: "Browse Discover", href: "/discover" }}
        />
      )}

      {watchlist.isSuccess && items.length > 0 && filtered.length === 0 && (
        <EmptyState
          icon={Bookmark}
          title="No matches"
          description="Nothing on your list has this mood tag yet."
        />
      )}

      {filtered.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((item, i) => (
            <WatchlistCard key={item.id} item={item} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wider transition-all",
        active
          ? "border-brand-gold bg-brand-goldGlow text-brand-gold"
          : "border-brand-border bg-brand-surface text-brand-textMuted hover:border-brand-borderHi hover:text-brand-text"
      )}
    >
      {label}
    </button>
  );
}
