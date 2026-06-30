"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Brand wordmark — "Cinema" in light text, "Desi" in gold with a
 * very subtle pulsing glow. Hoverable. Used in Navbar + footer.
 */
export function Logo({
  className,
  size = "default",
}: {
  className?: string;
  size?: "sm" | "default" | "xl";
}) {
  const cls =
    size === "sm"
      ? "text-lg"
      : size === "xl"
      ? "text-5xl md:text-6xl"
      : "text-xl";

  return (
    <Link
      href="/"
      aria-label="CinemaDesi home"
      className={cn(
        "group inline-flex items-baseline font-serif font-black tracking-tight text-brand-text",
        cls,
        className
      )}
    >
      <span>Cinema</span>
      <motion.span
        animate={{ opacity: [0.85, 1, 0.85] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        className="text-brand-gold transition-[text-shadow] duration-300 group-hover:[text-shadow:0_0_22px_rgba(232,184,75,0.55)]"
      >
        Desi
      </motion.span>
    </Link>
  );
}
