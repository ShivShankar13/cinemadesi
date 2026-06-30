"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StarRating } from "./StarRating";
import { IndustryBadge } from "./IndustryBadge";
import { FilmPoster } from "./FilmPoster";
import { OTT_PLATFORMS } from "@/lib/constants";
import { useLogFilm, useUpdateDiaryEntry } from "@/hooks/useDiary";
import { cn } from "@/lib/utils";
import type { DiaryEntry, FilmSummary, OttPlatform, WatchMode } from "@/types";

interface LogFilmModalProps {
  /** Film to log against. Ignored when {@code entry} is provided (edit mode). */
  film: FilmSummary | null;
  open: boolean;
  onOpenChange: (next: boolean) => void;
  /** When present, the modal goes into edit mode and PATCHes this entry. */
  entry?: DiaryEntry;
  onLogged?: () => void;
}

const MODES: { value: WatchMode; label: string; emoji: string }[] = [
  { value: "THEATRE", label: "Theatre", emoji: "🎬" },
  { value: "OTT",     label: "OTT",     emoji: "📺" },
  { value: "HOME",    label: "Home",    emoji: "🏠" },
];

export function LogFilmModal({
  film,
  open,
  onOpenChange,
  entry,
  onLogged,
}: LogFilmModalProps) {
  const isEdit = !!entry;
  // In edit mode we always render with the entry's film; in create mode, the prop.
  const renderedFilm = entry?.film ?? film;

  const [watchedAt, setWatchedAt] = React.useState(today());
  const [rating, setRating] = React.useState<number>(0);
  const [review, setReview] = React.useState("");
  const [mode, setMode] = React.useState<WatchMode | null>(null);
  const [ott, setOtt] = React.useState<OttPlatform | "">("");
  const [spoiler, setSpoiler] = React.useState(false);

  const log = useLogFilm();
  const update = useUpdateDiaryEntry();
  const pending = isEdit ? update.isPending : log.isPending;

  // Hydrate from entry on open in edit mode; reset in create mode.
  React.useEffect(() => {
    if (!open) return;
    if (entry) {
      setWatchedAt(entry.watchedAt);
      setRating(entry.rating ?? 0);
      setReview(entry.reviewText ?? "");
      setMode(entry.watchMode);
      setOtt((entry.ottPlatform ?? "") as OttPlatform | "");
      setSpoiler(!!entry.containsSpoilers);
    } else {
      setWatchedAt(today());
      setRating(0);
      setReview("");
      setMode(null);
      setOtt("");
      setSpoiler(false);
    }
  }, [open, entry]);

  if (!renderedFilm) return null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const common = {
      watchedAt,
      rating: rating || undefined,
      reviewText: review.trim() || undefined,
      watchMode: mode ?? undefined,
      ottPlatform: ott || undefined,
      containsSpoilers: spoiler,
    };

    if (isEdit && entry) {
      update.mutate(
        { entryId: entry.id, body: common },
        {
          onSuccess: () => {
            onOpenChange(false);
            onLogged?.();
          },
        }
      );
    } else if (film) {
      log.mutate(
        { filmId: film.id, ...common },
        {
          onSuccess: () => {
            onOpenChange(false);
            onLogged?.();
          },
        }
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit diary entry" : "Log this film"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Tweak any of these fields. Changes save instantly."
              : "Add to your diary. You can edit it later."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-4">
          <div className="relative h-32 w-20 shrink-0 overflow-hidden rounded-md ring-1 ring-brand-border">
            <FilmPoster src={renderedFilm.posterUrl} alt={renderedFilm.title} />
          </div>
          <div className="min-w-0">
            <h3 className="font-serif text-xl font-semibold leading-tight">
              {renderedFilm.title}
            </h3>
            <div className="mt-1.5 flex items-center gap-2">
              <IndustryBadge industry={renderedFilm.industry} size="sm" />
              {renderedFilm.releaseDate && (
                <span className="text-[10px] uppercase tracking-widest text-brand-textMuted">
                  {renderedFilm.releaseDate.slice(0, 4)}
                </span>
              )}
            </div>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="watchedAt">Watched on</Label>
              <Input
                id="watchedAt"
                type="date"
                value={watchedAt}
                max={today()}
                onChange={(e) => setWatchedAt(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label>Rating</Label>
              <div className="flex h-10 items-center">
                <StarRating
                  value={rating}
                  onChange={setRating}
                  size="lg"
                  ariaLabel="Pick a rating"
                />
                {rating > 0 && (
                  <button
                    type="button"
                    onClick={() => setRating(0)}
                    className="ml-3 text-[10px] uppercase tracking-widest text-brand-textMuted hover:text-brand-text"
                  >
                    clear
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Watch mode</Label>
            <div className="grid grid-cols-3 gap-2">
              {MODES.map((m) => {
                const active = mode === m.value;
                return (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setMode(active ? null : m.value)}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-lg border px-3 py-2 text-sm transition-all",
                      active
                        ? "border-brand-gold bg-brand-goldGlow text-brand-gold"
                        : "border-brand-border bg-brand-surface text-brand-textMuted hover:border-brand-borderHi hover:text-brand-text"
                    )}
                  >
                    <span className="text-base">{m.emoji}</span>
                    <span className="text-[11px] font-semibold uppercase tracking-wider">
                      {m.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {mode === "OTT" && (
            <div className="space-y-1.5">
              <Label htmlFor="ott">Which OTT?</Label>
              <select
                id="ott"
                value={ott}
                onChange={(e) => setOtt(e.target.value as OttPlatform | "")}
                required
                className="flex h-10 w-full rounded-lg border border-brand-border bg-brand-surface3 px-3 text-sm text-brand-text focus:border-brand-gold focus:outline-none"
              >
                <option value="">Pick a platform…</option>
                {OTT_PLATFORMS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="review">Review (optional)</Label>
            <textarea
              id="review"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="What did you think? Be honest."
              rows={4}
              maxLength={5000}
              className="flex w-full rounded-lg border border-brand-border bg-brand-surface3 px-4 py-2.5 text-sm text-brand-text placeholder:text-brand-textMuted transition-colors focus:border-brand-gold focus:outline-none"
            />
            <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-brand-textMuted">
              <span>{review.length} / 5000</span>
              <label className="flex items-center gap-2 normal-case tracking-normal">
                <input
                  type="checkbox"
                  checked={spoiler}
                  onChange={(e) => setSpoiler(e.target.checked)}
                  className="accent-brand-red"
                />
                <span className="text-xs">Contains spoilers</span>
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {isEdit ? "Saving…" : "Logging…"}
                </>
              ) : isEdit ? (
                "Save changes"
              ) : (
                "Log film"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function today(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
