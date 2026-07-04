"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Compass, Search, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FilmGrid } from "@/components/film/FilmGrid";
import { FilmSearch } from "@/components/film/FilmSearch";
import { EmptyState } from "@/components/shared/EmptyState";
import { useTrendingFilms } from "@/hooks/useFilms";
import { useQuickAddToWatchlist } from "@/hooks/useWatchlist";
import { INDUSTRIES, INDUSTRY_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Industry } from "@/types";

export default function DiscoverPage() {
  return (
    <React.Suspense fallback={<div className="mx-auto max-w-7xl px-6 pt-8 lg:px-10"><div className="h-96 rounded-2xl border border-brand-border bg-brand-surface/70" /></div>}>
      <DiscoverContent />
    </React.Suspense>
  );
}

function DiscoverContent() {
  const router = useRouter();
  const params = useSearchParams();
  const industryParam = params.get("industry") as Industry | null;

  const [palette, setPalette] = React.useState(false);
  const trending = useTrendingFilms(industryParam ?? undefined);
  const quickAdd = useQuickAddToWatchlist();

  const setIndustry = (next: Industry | null) => {
    const sp = new URLSearchParams(window.location.search);
    if (next) sp.set("industry", next);
    else sp.delete("industry");
    router.replace(`/discover${sp.toString() ? "?" + sp.toString() : ""}`);
  };

  return (
    <>
      <FilmSearch open={palette} onOpenChange={setPalette} />

      <div className="mx-auto max-w-7xl px-6 pt-8 pb-16 lg:px-10">
        {/* Header */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10"
        >
          <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-textMuted">
            Discover
          </p>
          <h1 className="mt-2 font-serif text-4xl font-bold leading-tight tracking-tight md:text-5xl">
            What's playing across India.
          </h1>
          <p className="mt-3 max-w-2xl text-brand-textMuted">
            Trending this week, region by region. Tap any poster for the full
            page or hit{" "}
            <kbd className="rounded border border-brand-border bg-brand-surface3 px-1.5 py-0.5 font-mono text-[10px]">
              /
            </kbd>{" "}
            to search the catalog.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button onClick={() => setPalette(true)} className="gap-2">
              <Search className="h-4 w-4" />
              Search films
              <kbd className="ml-2 rounded bg-black/30 px-1.5 py-0.5 font-mono text-[10px]">
                /
              </kbd>
            </Button>
          </div>
        </motion.section>

        {/* Industry tabs */}
        <section className="mb-8 overflow-x-auto">
          <div className="flex min-w-max items-center gap-2 border-b border-brand-border">
            <IndustryTab
              active={industryParam === null}
              label="All"
              onClick={() => setIndustry(null)}
            />
            {INDUSTRIES.map((ind) => (
              <IndustryTab
                key={ind.value}
                active={industryParam === ind.value}
                label={ind.label}
                color={INDUSTRY_COLORS[ind.value]}
                onClick={() => setIndustry(ind.value)}
              />
            ))}
          </div>
        </section>

        {/* Trending grid */}
        <section className="space-y-5">
          <div className="flex items-center gap-3">
            <h2 className="font-serif text-2xl font-bold tracking-tight">
              <span className="border-l-2 border-brand-gold pl-3">
                {industryParam ? labelFor(industryParam) : "All industries"}
              </span>
            </h2>
            <span className="inline-flex items-center gap-1 text-xs text-brand-textMuted">
              <TrendingUp className="h-3.5 w-3.5" />
              Trending this week
            </span>
          </div>

          {trending.isError && (
            <EmptyState
              icon={Compass}
              title="Couldn't load trending"
              description="Backend isn't responding. Try again in a moment."
              action={{ label: "Retry", onClick: () => trending.refetch() }}
            />
          )}

          {trending.isSuccess && trending.data.length === 0 ? (
            <EmptyState
              icon={Compass}
              title="Nothing trending here yet"
              description="Try a different industry, or search the catalog with /."
              action={{ label: "Open search", onClick: () => setPalette(true) }}
            />
          ) : (
            <FilmGrid
              films={trending.data ?? []}
              loading={trending.isLoading}
              skeletonCount={12}
              onAddToWatchlist={(film) => quickAdd(film)}
            />
          )}
        </section>
      </div>
    </>
  );
}

function IndustryTab({
  label,
  color,
  active,
  onClick,
}: {
  label: string;
  color?: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative px-4 py-2.5 text-sm font-medium transition-colors",
        active ? "text-brand-gold" : "text-brand-textMuted hover:text-brand-text"
      )}
    >
      <span className="flex items-center gap-2">
        {color && (
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{
              backgroundColor: color,
              boxShadow: active ? `0 0 8px ${color}80` : undefined,
            }}
            aria-hidden
          />
        )}
        {label}
      </span>
      {active && (
        <motion.span
          layoutId="discover-active"
          className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-brand-gold"
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        />
      )}
    </button>
  );
}

function labelFor(industry: Industry): string {
  const found = INDUSTRIES.find((i) => i.value === industry);
  return found ? found.label : "Other";
}
