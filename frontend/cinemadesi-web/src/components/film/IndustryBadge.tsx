"use client";

import { cn } from "@/lib/utils";
import { INDUSTRY_COLORS } from "@/lib/constants";
import type { Industry } from "@/types";

/**
 * Color-coded industry pill. Uses the brand industry palette
 * (BOLLYWOOD → red, TAMIL → orange, TELUGU → green, MALAYALAM → blue,
 * KANNADA → yellow, MARATHI → purple).
 *
 * <p>Renders as a glowing dot + label so it reads at thumbnail size.</p>
 */
export function IndustryBadge({
  industry,
  size = "default",
  className,
}: {
  industry: Industry;
  size?: "sm" | "default";
  className?: string;
}) {
  const color = INDUSTRY_COLORS[industry];
  const label = industry === "OTHER" ? "World" : industry;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-semibold uppercase tracking-wider",
        size === "sm"
          ? "px-2 py-0.5 text-[9px]"
          : "px-2.5 py-1 text-[11px]",
        className
      )}
      style={{
        color,
        borderColor: `${color}44`,
        backgroundColor: `${color}1A`,
      }}
    >
      <span
        aria-hidden
        className="h-1.5 w-1.5 rounded-full"
        style={{
          backgroundColor: color,
          boxShadow: `0 0 8px ${color}80`,
        }}
      />
      {label.toLowerCase()}
    </span>
  );
}
