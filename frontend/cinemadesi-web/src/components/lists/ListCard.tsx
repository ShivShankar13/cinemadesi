"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Globe, ListVideo, Lock } from "lucide-react";
import { FilmPoster } from "@/components/film/FilmPoster";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { Badge } from "@/components/ui/badge";
import type { FilmList } from "@/types";

/**
 * Browseable list card — shown on /lists, /profile/[username] lists tab,
 * and the public-lists feed.
 *
 * <p>Surfaces up to 4 poster thumbnails of the first films as a teaser
 * collage. Falls back to a film-icon empty state.</p>
 */
export function ListCard({
  list,
  index = 0,
}: {
  list: FilmList;
  index?: number;
}) {
  const previewFilms = list.films?.slice(0, 4) ?? [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index, 6) * 0.04 }}
    >
      <Link
        href={`/lists/${list.id}`}
        className="group block overflow-hidden rounded-2xl border border-brand-border bg-brand-surface transition-all hover:-translate-y-0.5 hover:border-brand-borderHi"
      >
        {/* Poster collage */}
        <div className="relative h-36 w-full overflow-hidden bg-brand-surface2">
          {previewFilms.length > 0 ? (
            <div className="absolute inset-0 grid grid-cols-4 gap-px">
              {previewFilms.map((f, i) => (
                <div key={f.id} className="relative h-full w-full overflow-hidden">
                  <FilmPoster
                    src={f.film.posterUrl}
                    alt={f.film.title}
                    className="transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              ))}
              {/* Fill the rest with placeholder slots */}
              {Array.from({ length: Math.max(0, 4 - previewFilms.length) }).map(
                (_, i) => (
                  <div
                    key={`empty-${i}`}
                    className="bg-gradient-to-br from-brand-surface3 to-brand-surface2"
                    aria-hidden
                  />
                )
              )}
            </div>
          ) : (
            <div
              aria-hidden
              className="flex h-full w-full items-center justify-center bg-mesh-hero opacity-50"
            >
              <ListVideo className="h-7 w-7 text-brand-textDim" />
            </div>
          )}
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-brand-surface via-brand-surface/40 to-transparent"
          />
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <h3 className="line-clamp-2 font-serif text-lg font-semibold leading-tight">
              {list.title}
            </h3>
            <Badge variant="default" size="sm" className="shrink-0 gap-1">
              {list.isPublic ? (
                <Globe className="h-2.5 w-2.5" />
              ) : (
                <Lock className="h-2.5 w-2.5" />
              )}
              {list.isPublic ? "public" : "private"}
            </Badge>
          </div>

          {list.description && (
            <p className="mt-1 line-clamp-2 text-sm text-brand-textMuted">
              {list.description}
            </p>
          )}

          <div className="mt-3 flex items-center justify-between text-xs text-brand-textMuted">
            {list.owner ? (
              <div className="flex items-center gap-2">
                <UserAvatar user={list.owner} size="xs" />
                <span>@{list.owner.username}</span>
              </div>
            ) : (
              <span />
            )}
            <span className="font-medium">
              {list.filmCount} film{list.filmCount === 1 ? "" : "s"}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
