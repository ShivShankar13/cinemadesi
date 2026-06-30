"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?:
    | { label: string; href: string }
    | { label: string; onClick: () => void };
  className?: string;
}

/**
 * Cinematic empty / error state. Used everywhere a list returns nothing
 * or the API errored. Tries to feel like a thoughtful pause, not a wall.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "mx-auto flex max-w-md flex-col items-center gap-4 rounded-2xl border border-brand-border bg-brand-surface/60 px-8 py-12 text-center backdrop-blur",
        className
      )}
    >
      <div className="relative">
        <div className="absolute inset-0 -z-10 rounded-full bg-gold-radial blur-2xl opacity-50" />
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-brand-goldDim bg-brand-goldGlow">
          <Icon className="h-7 w-7 text-brand-gold" aria-hidden />
        </div>
      </div>

      <div className="space-y-1.5">
        <h3 className="font-serif text-xl font-semibold text-brand-text">
          {title}
        </h3>
        <p className="text-sm text-brand-textMuted">{description}</p>
      </div>

      {action && "href" in action && (
        <Button variant="gold" asChild>
          <Link href={action.href}>{action.label}</Link>
        </Button>
      )}
      {action && "onClick" in action && (
        <Button variant="gold" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </motion.div>
  );
}
