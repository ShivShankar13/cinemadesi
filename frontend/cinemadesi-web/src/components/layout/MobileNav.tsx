"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bookmark, Compass, Home, Inbox, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/",                label: "Home",     icon: Home },
  { href: "/discover",        label: "Discover", icon: Compass },
  { href: "/watchlist",       label: "Saved",    icon: Bookmark },
  { href: "/groups",          label: "Groups",   icon: Users },
  { href: "/recommendations", label: "Inbox",    icon: Inbox },
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
            it.href === "/" ? pathname === "/" : pathname.startsWith(it.href);
          return (
            <li key={it.href}>
              <Link
                href={it.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 rounded-md px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider transition-colors",
                  active
                    ? "text-brand-gold"
                    : "text-brand-textMuted hover:text-brand-text"
                )}
                aria-label={it.label}
                aria-current={active ? "page" : undefined}
              >
                <Icon className={cn("h-5 w-5", active && "drop-shadow-[0_0_8px_rgba(232,184,75,0.55)]")} />
                {it.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
