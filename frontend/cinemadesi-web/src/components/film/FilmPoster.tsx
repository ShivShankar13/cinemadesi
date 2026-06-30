"use client";

import Image from "next/image";
import { Film as FilmIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilmPosterProps {
  src: string | null;
  alt: string;
  className?: string;
  /** Pass when laying the poster inside a flex parent; otherwise use width/height. */
  fill?: boolean;
  /** When fill=false, you can size with class on the wrapper or these. */
  width?: number;
  height?: number;
  priority?: boolean;
}

/**
 * Wrapped {@code next/image} with a graceful fallback for missing
 * posters — a dark gradient with a film glyph.
 */
export function FilmPoster({
  src,
  alt,
  className,
  fill = true,
  width,
  height,
  priority,
}: FilmPosterProps) {
  if (!src) {
    return (
      <div
        className={cn(
          "relative flex items-center justify-center overflow-hidden " +
            "bg-gradient-to-br from-brand-surface3 via-brand-surface2 to-brand-bg",
          className
        )}
      >
        <FilmIcon className="h-8 w-8 text-brand-textDim" aria-hidden />
        <span className="sr-only">{alt}</span>
      </div>
    );
  }

  const sizes = "(max-width: 768px) 40vw, (max-width: 1280px) 22vw, 240px";
  return fill ? (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className={cn("object-cover", className)}
    />
  ) : (
    <Image
      src={src}
      alt={alt}
      width={width ?? 240}
      height={height ?? 360}
      priority={priority}
      className={cn("object-cover", className)}
    />
  );
}
