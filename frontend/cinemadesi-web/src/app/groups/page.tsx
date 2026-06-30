"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GroupCard } from "@/components/groups/GroupCard";
import { CreateGroupModal } from "@/components/groups/CreateGroupModal";
import { EmptyState } from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyGroups } from "@/hooks/useGroups";
import { useRequireAuth } from "@/hooks/useAuth";

export default function MyGroupsPage() {
  useRequireAuth();
  const groups = useMyGroups();
  const [createOpen, setCreateOpen] = React.useState(false);

  return (
    <>
      <CreateGroupModal open={createOpen} onOpenChange={setCreateOpen} />

      <div className="mx-auto max-w-7xl px-6 pt-8 pb-16 lg:px-10">
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
        >
          <div>
            <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-textMuted">
              Watch groups
            </p>
            <h1 className="mt-2 font-serif text-4xl font-bold leading-tight tracking-tight md:text-5xl">
              Your circles.
            </h1>
            <p className="mt-3 max-w-xl text-brand-textMuted">
              Small private groups. Merged watchlists, common-film finder, group polls.
            </p>
          </div>

          <Button onClick={() => setCreateOpen(true)} size="lg">
            <Plus className="h-4 w-4" />
            New group
          </Button>
        </motion.section>

        {groups.isLoading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-56 rounded-2xl" />
            ))}
          </div>
        )}

        {groups.isError && (
          <EmptyState
            icon={Users}
            title="Couldn't load your groups"
            description="Try again — the backend may have hiccuped."
            action={{ label: "Retry", onClick: () => groups.refetch() }}
          />
        )}

        {groups.isSuccess && groups.data.length === 0 && (
          <EmptyState
            icon={Users}
            title="No groups yet"
            description="Create one and invite your friends. Watch nights, sorted."
            action={{ label: "Create your first group", onClick: () => setCreateOpen(true) }}
          />
        )}

        {groups.data && groups.data.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {groups.data.map((g, i) => (
              <GroupCard key={g.id} group={g} index={i} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
