"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Film, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/Logo";
import { INDUSTRIES, INDUSTRY_COLORS } from "@/lib/constants";

/**
 * Public landing — rendered by app/page.tsx when no session.
 * Cinematic mesh hero, scrolling regional marquee, feature trio, CTA, footer.
 */
export function LandingHero() {
  return (
    <div className="relative overflow-x-hidden">
      <section className="relative min-h-[92vh]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-mesh-hero"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 opacity-[0.04] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.6'/></svg>\")",
          }}
        />

        <div className="mx-auto max-w-7xl px-6 pt-28 pb-20 lg:px-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-3xl"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-goldDim bg-brand-goldGlow px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-gold">
              <Sparkles className="h-3 w-3" />
              now in research preview
            </div>

            <h1 className="font-serif text-5xl font-black leading-[1.02] tracking-tight md:text-7xl lg:text-[88px]">
              India watches.
              <br />
              <span className="relative inline-block">
                <span className="text-brand-gold">You log it.</span>
                <motion.span
                  aria-hidden
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{
                    delay: 0.6,
                    duration: 0.7,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="absolute -bottom-1 left-0 right-0 h-[3px] origin-left rounded-full bg-brand-gold"
                />
              </span>
            </h1>

            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-brand-textMuted md:text-xl">
              The film diary for Indian cinema. Rate every screening, build
              watch groups with friends, and discover Bollywood, Tamil,
              Telugu, Malayalam, Kannada and Marathi gems in one place.
            </p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.6 }}
              className="mt-10 flex flex-wrap items-center gap-3"
            >
              <Button size="lg" asChild>
                <Link href="/register">
                  Start your diary
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/discover">Browse films</Link>
              </Button>
              <span className="ml-1 text-xs text-brand-textMuted">
                Free forever. No ads.
              </span>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mt-20 grid max-w-3xl grid-cols-3 gap-6 border-t border-brand-border pt-10"
          >
            {[
              { value: "6", label: "Regional industries" },
              { value: "∞", label: "Films you can log" },
              { value: "₹0", label: "Forever" },
            ].map((s) => (
              <div key={s.label}>
                <p className="font-serif text-4xl font-bold text-brand-text md:text-5xl">
                  {s.value}
                </p>
                <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-textMuted">
                  {s.label}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="relative border-y border-brand-border bg-brand-surface/30 py-6">
        <div
          className="flex w-max animate-marquee gap-12 whitespace-nowrap will-change-transform"
          aria-hidden
        >
          {[...INDUSTRIES, ...INDUSTRIES, ...INDUSTRIES].map((ind, i) => (
            <div
              key={`${ind.value}-${i}`}
              className="flex items-center gap-3 font-serif text-2xl font-bold uppercase tracking-[0.2em] md:text-3xl"
            >
              <span style={{ color: INDUSTRY_COLORS[ind.value] }}>★</span>
              <span className="text-brand-textMuted">{ind.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
        <div className="mb-14 max-w-2xl">
          <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-textMuted">
            built for the way we actually watch
          </p>
          <h2 className="mt-3 font-serif text-3xl font-bold leading-tight tracking-tight md:text-5xl">
            More than just a film log.
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {FEATURES.map((f, i) => (
            <FeatureCard key={f.title} feature={f} index={i} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24 lg:px-10">
        <div className="relative overflow-hidden rounded-2xl border border-brand-border bg-brand-surface p-10 md:p-14">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-gold-radial blur-3xl"
          />
          <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl">
              <h3 className="font-serif text-3xl font-bold tracking-tight md:text-4xl">
                Your first review writes itself.
              </h3>
              <p className="mt-3 text-brand-textMuted">
                Sign up in 30 seconds. Log <em>Tumbbad</em> at 4.5 stars and
                start the fight in our group chat.
              </p>
            </div>
            <div className="flex gap-3">
              <Button size="lg" asChild>
                <Link href="/register">
                  Get the app feel
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/login">Sign in</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-brand-border">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-10 lg:flex-row lg:items-center lg:justify-between lg:px-10">
          <div className="flex items-center gap-4">
            <Logo size="sm" />
            <span className="text-xs text-brand-textMuted">
              Made for Indian film lovers.
            </span>
          </div>
          <p className="text-xs text-brand-textMuted">
            © {new Date().getFullYear()} CinemaDesi. Not affiliated with TMDB.
          </p>
        </div>
      </footer>
    </div>
  );
}

const FEATURES = [
  {
    icon: Film,
    title: "Diary, not feed",
    description:
      "Log every film. Star ratings, half-star precision, OTT tags, spoiler flags. Your viewing history lives here.",
    accent: "#E8B84B",
  },
  {
    icon: Users,
    title: "Watch groups",
    description:
      "Tiny private circles. Merged watchlists, common-film finder, group polls. Bye-bye 'what should we watch?'",
    accent: "#A855F7",
  },
  {
    icon: BookOpen,
    title: "Regional first",
    description:
      "Bollywood gets all the noise. We give Tamil, Telugu, Malayalam, Kannada and Marathi cinema equal weight.",
    accent: "#22C55E",
  },
] as const;

function FeatureCard({
  feature,
  index,
}: {
  feature: (typeof FEATURES)[number];
  index: number;
}) {
  const Icon = feature.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="group relative overflow-hidden rounded-2xl border border-brand-border bg-brand-surface p-6 transition-all duration-300 hover:border-brand-borderHi hover:-translate-y-0.5"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-0 blur-3xl transition-opacity duration-300 group-hover:opacity-50"
        style={{
          background: `radial-gradient(closest-side, ${feature.accent}33, transparent 70%)`,
        }}
      />

      <div
        className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl border"
        style={{
          color: feature.accent,
          borderColor: `${feature.accent}55`,
          backgroundColor: `${feature.accent}11`,
        }}
      >
        <Icon className="h-5 w-5" aria-hidden />
      </div>

      <h3 className="font-serif text-2xl font-semibold leading-tight tracking-tight">
        {feature.title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-brand-textMuted">
        {feature.description}
      </p>
    </motion.div>
  );
}
