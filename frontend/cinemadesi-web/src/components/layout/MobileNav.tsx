"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bookmark, Compass, Home, MonitorPlay, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { WATCH_PARTY_URL } from "@/lib/constants";

type Item = {
  href: string;
  label: string;
  icon: typeof Home;
  external?: boolean;
  badge?: boolean;
};

const ITEMS: Item[] = [
  { href: "/",                label: "Home",     icon: Home },
  { href: "/discover",        label: "Discover", icon: Compass },
  { href: WATCH_PARTY_URL,    label: "Party",    icon: MonitorPlay, external: true, badge: true },
  { href: "/watchlist",       label: "Saved",    icon: Bookmark },
  { href: "/groups",          label: "Groups",   icon: Users },
];

/**
 * Mobile-only bottom navigation. Fixed to the viewport bottom on
 * small screens; hidden on md+ where the sidebar takes over.
 */
export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-brand-border bg-brand-bg/85 backdrop-blur-xl md:hidden"
      aria-label="Bottom navigation"
    >
      <ul className="mx-auto flex max-w-md justify-around px-2 py-2">
        {ITEMS.map((it) => {
          const Icon = it.icon;
          const active =
            !it.external &&
            (it.href === "/" ? pathname === "/" : pathname.startsWith(it.href));

          const cls = cn(
            "relative flex flex-col items-center gap-0.5 rounded-md px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider transition-colors",
            active ? "text-brand-gold" : "text-brand-textMuted hover:text-brand-text"
          );

          const inner = (
            <>
              <Icon className={cn("h-5 w-5", active && "drop-shadow-[0_0_8px_rgba(232,184,75,0.55)]")} />
              {it.label}
              {it.badge && (
                <span
                  aria-hidden
                  className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-brand-gold shadow-[0_0_6px_rgba(232,184,75,0.8)]"
                />
              )}
            </>
          );

          return (
            <li key={it.href}>
              {it.external ? (
                <a
                  href={it.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cls}
                  aria-label={it.label}
                >
                  {inner}
                </a>
              ) : (
                <Link
                  href={it.href}
                  className={cls}
                  aria-label={it.label}
                  aria-current={active ? "page" : undefined}
                >
                  {inner}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
