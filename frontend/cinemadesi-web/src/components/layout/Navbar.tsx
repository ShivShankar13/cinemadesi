"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { motion } from "framer-motion";
import { Bell, LogOut, Search, Settings, User as UserIcon } from "lucide-react";
import { Logo } from "@/components/shared/Logo";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { FilmSearch } from "@/components/film/FilmSearch";
import { Button } from "@/components/ui/button";
import { useSearchPalette } from "@/store/searchPaletteStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/",          label: "Home" },
  { href: "/discover",  label: "Discover" },
  { href: "/groups",    label: "Groups" },
];

export function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [scrolled, setScrolled] = React.useState(false);
  const paletteOpen = useSearchPalette((s) => s.isOpen);
  const setPaletteOpen = useSearchPalette((s) => s.setOpen);
  const openPalette = useSearchPalette((s) => s.open);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "fixed inset-x-0 top-0 z-40 h-16 transition-all duration-300",
        scrolled
          ? "border-b border-brand-border bg-brand-bg/80 backdrop-blur-xl"
          : "bg-transparent"
      )}
    >
      <div className="mx-auto flex h-full max-w-7xl items-center gap-6 px-6 lg:px-10">
        <Logo />

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((l) => {
            const active =
              l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "relative rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "text-brand-text"
                    : "text-brand-textMuted hover:text-brand-text"
                )}
              >
                {l.label}
                {active && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-brand-gold"
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Search pill (desktop) — opens the global command palette */}
        <div className="ml-auto hidden flex-1 max-w-md md:flex">
          <button
            type="button"
            onClick={openPalette}
            aria-label="Search films"
            className="group flex w-full items-center gap-3 rounded-full border border-brand-border bg-brand-surface/60 px-4 py-2 text-sm text-brand-textMuted transition-colors hover:border-brand-borderHi hover:bg-brand-surface hover:text-brand-text"
          >
            <Search className="h-4 w-4" />
            <span className="flex-1 text-left">Search films, people, lists…</span>
            <kbd className="rounded border border-brand-border bg-brand-surface3 px-1.5 py-0.5 text-[10px] font-mono font-semibold text-brand-textMuted">
              /
            </kbd>
          </button>
        </div>

        <div className="ml-auto flex items-center gap-2 md:ml-0">
          {/* Mobile-only icon trigger (the pill is hidden under md) */}
          <button
            type="button"
            onClick={openPalette}
            aria-label="Search films"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-brand-textMuted transition-colors hover:bg-brand-surface2 hover:text-brand-text md:hidden"
          >
            <Search className="h-5 w-5" />
          </button>

          {status === "authenticated" ? (
            <>
              <Button
                variant="ghost"
                size="icon"
                asChild
                aria-label="Recommendations inbox"
              >
                <Link href="/recommendations">
                  <span className="relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-brand-red ring-2 ring-brand-bg" />
                  </span>
                </Link>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    aria-label="Open profile menu"
                    className="rounded-full outline-none ring-offset-2 transition-all focus-visible:ring-2 focus-visible:ring-brand-gold"
                  >
                    <UserAvatar
                      user={{
                        username: session?.user?.username ?? "",
                        displayName: session?.user?.name ?? null,
                        avatarUrl: session?.user?.image ?? null,
                      }}
                      size="sm"
                    />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[12rem]">
                  <DropdownMenuLabel>
                    @{session?.user?.username ?? "you"}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={`/profile/${session?.user?.username ?? ""}`}>
                      <UserIcon className="h-4 w-4" /> Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/watchlist">
                      <Bell className="h-4 w-4" /> Watchlist
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings">
                      <Settings className="h-4 w-4" /> Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={() => signOut({ callbackUrl: "/" })}
                    className="text-brand-red focus:text-brand-red"
                  >
                    <LogOut className="h-4 w-4" /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Sign in</Link>
              </Button>
              <Button variant="default" size="sm" asChild>
                <Link href="/register">Join</Link>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* The one global FilmSearch instance. Its own `/` hotkey still works
          anywhere on the site — and the navbar's search pill / icon also
          calls open() to trigger it. */}
      <FilmSearch open={paletteOpen} onOpenChange={setPaletteOpen} />
    </motion.header>
  );
}
