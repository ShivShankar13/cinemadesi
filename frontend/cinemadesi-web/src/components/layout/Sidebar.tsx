"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bookmark,
  Compass,
  Home,
  Inbox,
  ListVideo,
  MonitorPlay,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  INDUSTRIES,
  INDUSTRY_COLORS,
  WATCH_PARTY_URL,
} from "@/lib/constants";

type Section = {
  href: string;
  label: string;
  icon: typeof Home;
  external?: boolean;
  badge?: string;
};

const SECTIONS: Section[] = [
  { href: "/",                label: "Home Feed",     icon: Home },
  { href: "/discover",        label: "Discover",      icon: Compass },
  { href: "/watchlist",       label: "My Watchlist",  icon: Bookmark },
  { href: "/groups",          label: "My Groups",     icon: Users },
  { href: "/recommendations", label: "Inbox",         icon: Inbox },
  { href: "/lists",           label: "My Lists",      icon: ListVideo },
  {
    href: WATCH_PARTY_URL,
    label: "Watch Party",
    icon: MonitorPlay,
    external: true,
    badge: "NEW",
  },
];

/**
 * Desktop-only side rail. Hidden under md.
 * Shown alongside main content on authenticated pages.
 */
export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-20 hidden h-fit w-56 shrink-0 md:block">
      <nav className="space-y-1">
        {SECTIONS.map((s) => {
          const Icon = s.icon;
          const active =
            !s.external &&
            (s.href === "/" ? pathname === "/" : pathname.startsWith(s.href));

          const inner = (
            <>
              <Icon
                className={cn(
                  "h-4 w-4 transition-colors",
                  active
                    ? "text-brand-gold"
                    : "text-brand-textMuted group-hover:text-brand-text"
                )}
              />
              <span className="flex-1">{s.label}</span>
              {s.badge && (
                <span className="rounded-full border border-brand-goldDim bg-brand-goldGlow px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-brand-gold">
                  {s.badge}
                </span>
              )}
            </>
          );

          const cls = cn(
            "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
            active
              ? "bg-brand-surface text-brand-text"
              : "text-brand-textMuted hover:bg-brand-surface/60 hover:text-brand-text"
          );

          return s.external ? (
            <a
              key={s.href}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className={cls}
            >
              {inner}
            </a>
          ) : (
            <Link key={s.href} href={s.href} className={cls}>
              {inner}
            </Link>
          );
        })}
      </nav>

      {/* Industry quick filters */}
      <div className="mt-8">
        <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-textMuted/80">
          By industry
        </p>
        <nav className="space-y-0.5">
          {INDUSTRIES.map((ind) => {
            const href = `/discover?industry=${ind.value}`;
            const active = pathname.startsWith("/discover") &&
              typeof window !== "undefined" &&
              new URLSearchParams(window.location.search).get("industry") ===
                ind.value;
            return (
              <Link
                key={ind.value}
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-1.5 text-sm transition-colors",
                  active
                    ? "bg-brand-surface text-brand-text"
                    : "text-brand-textMuted hover:bg-brand-surface/40 hover:text-brand-text"
                )}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{
                    backgroundColor: INDUSTRY_COLORS[ind.value],
                    boxShadow: `0 0 8px ${INDUSTRY_COLORS[ind.value]}80`,
                  }}
                  aria-hidden
                />
                {ind.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
