"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { ListVideo, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { ListCard } from "@/components/lists/ListCard";
import { ListModal } from "@/components/lists/ListModal";
import { useMyLists, usePublicLists } from "@/hooks/useLists";
import { useRequireAuth } from "@/hooks/useAuth";

export default function ListsPage() {
  useRequireAuth();
  const myLists = useMyLists();
  const publicLists = usePublicLists();
  const [createOpen, setCreateOpen] = React.useState(false);

  const publicListsFlat =
    publicLists.data?.pages.flatMap((p) => p.content) ?? [];

  return (
    <>
      <ListModal open={createOpen} onOpenChange={setCreateOpen} />

      <div className="mx-auto max-w-7xl px-6 pt-8 pb-16 lg:px-10">
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
        >
          <div>
            <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-textMuted">
              Curated
            </p>
            <h1 className="mt-2 font-serif text-4xl font-bold leading-tight tracking-tight md:text-5xl">
              Film lists.
            </h1>
            <p className="mt-3 max-w-xl text-brand-textMuted">
              Make your own canon. Browse what others have stitched together.
            </p>
          </div>

          <Button onClick={() => setCreateOpen(true)} size="lg">
            <Plus className="h-4 w-4" />
            New list
          </Button>
        </motion.section>

        <Tabs defaultValue="mine">
          <TabsList>
            <TabsTrigger value="mine">My lists</TabsTrigger>
            <TabsTrigger value="public">Browse public</TabsTrigger>
          </TabsList>

          <TabsContent value="mine">
            {myLists.isLoading && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-64 rounded-2xl" />
                ))}
              </div>
            )}
            {myLists.isSuccess && myLists.data.length === 0 && (
              <EmptyState
                icon={ListVideo}
                title="No lists yet"
                description="Curate a shortlist of your favorites. Send the link to friends."
                action={{ label: "Create your first list", onClick: () => setCreateOpen(true) }}
              />
            )}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {myLists.data?.map((list, i) => (
                <ListCard key={list.id} list={list} index={i} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="public">
            {publicLists.isLoading && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-64 rounded-2xl" />
                ))}
              </div>
            )}
            {publicLists.isSuccess && publicListsFlat.length === 0 && (
              <EmptyState
                icon={ListVideo}
                title="No public lists yet"
                description="Be the first — make a public list and share it."
              />
            )}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {publicListsFlat.map((list, i) => (
                <ListCard key={list.id} list={list} index={i} />
              ))}
            </div>
            {publicLists.hasNextPage && (
              <div className="mt-6 flex justify-center">
                <Button
                  variant="outline"
                  onClick={() => publicLists.fetchNextPage()}
                  disabled={publicLists.isFetchingNextPage}
                >
                  {publicLists.isFetchingNextPage ? "Loading…" : "Load more"}
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
