"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { motion } from "framer-motion";
import { Loader2, Search } from "lucide-react";
import { FilmPoster } from "./FilmPoster";
import { IndustryBadge } from "./IndustryBadge";
import { useFilmSearch } from "@/hooks/useFilms";
import { cn } from "@/lib/utils";

/**
 * Cmdk command palette for film search.
 *
 * <ul>
 *   <li>Global "/" hotkey opens it</li>
 *   <li>Esc closes</li>
 *   <li>Debounced 300ms via {@code useFilmSearch}</li>
 *   <li>Arrow keys + Enter to navigate results</li>
 * </ul>
 */
export function FilmSearch({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (next: boolean) => void;
}) {
  const router = useRouter();
  const [q, setQ] = React.useState("");
  const { data, isFetching } = useFilmSearch(q);

  // Global "/" hotkey
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/" && !isInputFocused()) {
        e.preventDefault();
        onOpenChange(true);
      }
      if (e.key === "Escape" && open) onOpenChange(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Search films"
      className="fixed inset-0 z-50 flex items-start justify-center p-6 pt-24 backdrop-blur-md"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="fixed inset-0 -z-10 bg-black/80"
        aria-hidden
      />
      <motion.div
        initial={{ opacity: 0, y: -8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-2xl overflow-hidden rounded-2xl border border-brand-border bg-brand-surface2 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.85)]"
        onClick={(e) => e.stopPropagation()}
      >
        <Command shouldFilter={false} className="w-full">
          <div className="flex items-center gap-3 border-b border-brand-border px-4 py-3">
            <Search className="h-4 w-4 text-brand-textMuted" />
            <Command.Input
              autoFocus
              value={q}
              onValueChange={setQ}
              placeholder="Search films, original titles…"
              className="w-full bg-transparent text-sm text-brand-text placeholder:text-brand-textMuted focus:outline-none"
            />
            {isFetching && (
              <Loader2 className="h-4 w-4 animate-spin text-brand-textMuted" />
            )}
            <kbd className="hidden rounded border border-brand-border bg-brand-surface3 px-1.5 py-0.5 font-mono text-[10px] text-brand-textMuted sm:inline-block">
              esc
            </kbd>
          </div>

          <Command.List className="max-h-[60vh] overflow-y-auto p-2">
            <Command.Empty className="p-8 text-center text-sm text-brand-textMuted">
              {q.trim().length < 2
                ? "Type at least 2 letters to search."
                : isFetching
                ? "Looking…"
                : "No films found. Try a different spelling."}
            </Command.Empty>

            {data?.content.map((film) => (
              <Command.Item
                key={film.id}
                value={`${film.title} ${film.tmdbId}`}
                onSelect={() => {
                  router.push(`/film/${film.id}`);
                  onOpenChange(false);
                }}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2",
                  "data-[selected=true]:bg-brand-surface3"
                )}
              >
                <div className="relative h-14 w-10 shrink-0 overflow-hidden rounded">
                  <FilmPoster src={film.posterUrl} alt={film.title} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-brand-text">
                    {film.title}
                  </p>
                  <div className="mt-0.5 flex items-center gap-2">
                    <IndustryBadge industry={film.industry} size="sm" />
                    {film.releaseDate && (
                      <span className="text-[10px] uppercase tracking-widest text-brand-textMuted">
                        {film.releaseDate.slice(0, 4)}
                      </span>
                    )}
                  </div>
                </div>
              </Command.Item>
            ))}
          </Command.List>
        </Command>
      </motion.div>
    </div>
  );
}

function isInputFocused(): boolean {
  const el = document.activeElement;
  if (!el) return false;
  const tag = el.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    (el as HTMLElement).isContentEditable
  );
}
