"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  /** Current value, 0 → 5, in 0.5 steps. */
  value: number;
  /** Pass to make it interactive. Receives the new value (0.5 → 5). */
  onChange?: (next: number) => void;
  size?: "sm" | "md" | "lg";
  className?: string;
  ariaLabel?: string;
}

const SIZE_MAP = { sm: 12, md: 18, lg: 28 } as const;

/**
 * Cinematic star rating — 5 stars, half-star support.
 *
 * <p>When interactive, clicking the left half of a star sets the X.5
 * rating; the right half sets the X.0. On hover, stars light up
 * left-to-right with a slight delay-cascade for a "sweep" feel.</p>
 */
export function StarRating({
  value,
  onChange,
  size = "md",
  className,
  ariaLabel = "Rating",
}: StarRatingProps) {
  const px = SIZE_MAP[size];
  const interactive = !!onChange;
  const [hover, setHover] = React.useState<number | null>(null);
  const display = hover ?? value;

  return (
    <div
      role={interactive ? "slider" : "img"}
      aria-label={ariaLabel}
      aria-valuemin={0}
      aria-valuemax={5}
      aria-valuenow={value}
      className={cn(
        "inline-flex items-center gap-0.5",
        interactive && "cursor-pointer",
        className
      )}
      onMouseLeave={() => setHover(null)}
    >
      {[1, 2, 3, 4, 5].map((i) => {
        const fill = clamp(display - (i - 1), 0, 1);
        return (
          <Star
            key={i}
            index={i}
            fillPct={fill}
            px={px}
            interactive={interactive}
            onHover={(half) => setHover(i - 1 + half)}
            onSelect={(half) => onChange?.(i - 1 + half)}
          />
        );
      })}
    </div>
  );
}

function Star({
  index,
  fillPct,
  px,
  interactive,
  onHover,
  onSelect,
}: {
  index: number;
  fillPct: number; // 0 → 1
  px: number;
  interactive: boolean;
  onHover: (half: number) => void;
  onSelect: (half: number) => void;
}) {
  // For interactive mode we overlay two transparent click-targets that
  // each set 0.5 / 1.0 respectively on this star.
  return (
    <span
      className="relative inline-block"
      style={{ width: px, height: px }}
    >
      <Glyph fillPct={fillPct} px={px} index={index} />
      {interactive && (
        <>
          <button
            type="button"
            aria-label={`${index - 0.5} stars`}
            className="absolute inset-y-0 left-0 w-1/2"
            onMouseEnter={() => onHover(0.5)}
            onClick={() => onSelect(0.5)}
          />
          <button
            type="button"
            aria-label={`${index} stars`}
            className="absolute inset-y-0 right-0 w-1/2"
            onMouseEnter={() => onHover(1)}
            onClick={() => onSelect(1)}
          />
        </>
      )}
    </span>
  );
}

function Glyph({
  fillPct,
  px,
  index,
}: {
  fillPct: number;
  px: number;
  index: number;
}) {
  const gradId = `star-grad-${index}`;
  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 24 24"
      className="drop-shadow-[0_0_6px_rgba(232,184,75,0.0)] transition-[filter] duration-200"
      style={
        fillPct > 0
          ? { filter: "drop-shadow(0 0 6px rgba(232,184,75,0.45))" }
          : undefined
      }
    >
      <defs>
        <linearGradient id={gradId}>
          <stop offset={`${fillPct * 100}%`} stopColor="#E8B84B" />
          <stop offset={`${fillPct * 100}%`} stopColor="#2E2E2E" />
        </linearGradient>
      </defs>
      <path
        d="M12 2.5l2.92 5.92 6.54.95-4.73 4.61 1.12 6.52L12 17.77 6.15 20.5l1.12-6.52L2.54 9.37l6.54-.95L12 2.5z"
        fill={`url(#${gradId})`}
        stroke="#A07C28"
        strokeWidth="0.6"
      />
    </svg>
  );
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}
