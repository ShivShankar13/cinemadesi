"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Users } from "lucide-react";
import { UserAvatar } from "@/components/shared/UserAvatar";
import type { GroupSummary } from "@/types";

export function GroupCard({
  group,
  index = 0,
}: {
  group: GroupSummary;
  index?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index, 6) * 0.05 }}
    >
      <Link
        href={`/groups/${group.id}`}
        className="group block overflow-hidden rounded-2xl border border-brand-border bg-brand-surface transition-all hover:-translate-y-0.5 hover:border-brand-borderHi hover:shadow-[0_18px_36px_-15px_rgba(0,0,0,0.7)]"
      >
        {/* Cover */}
        <div className="relative h-32 w-full overflow-hidden">
          {group.coverImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={group.coverImageUrl}
              alt={group.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div
              aria-hidden
              className="h-full w-full bg-mesh-hero"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-brand-surface to-transparent" />
        </div>

        <div className="p-4">
          <h3 className="font-serif text-lg font-semibold leading-tight">
            {group.name}
          </h3>

          <div className="mt-3 flex items-center gap-3">
            {/* Stacked avatars */}
            <div className="flex -space-x-2">
              {group.previewMembers?.slice(0, 4).map((m) => (
                <div
                  key={m.id}
                  className="ring-2 ring-brand-surface rounded-full"
                >
                  <UserAvatar user={m} size="xs" />
                </div>
              ))}
            </div>
            <span className="inline-flex items-center gap-1 text-xs text-brand-textMuted">
              <Users className="h-3.5 w-3.5" />
              {group.memberCount} member{group.memberCount === 1 ? "" : "s"}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
