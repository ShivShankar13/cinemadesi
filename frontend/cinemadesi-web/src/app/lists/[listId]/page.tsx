"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  Globe,
  ListVideo,
  Loader2,
  Lock,
  Pencil,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/EmptyState";
import { FilmCard } from "@/components/film/FilmCard";
import { ListModal } from "@/components/lists/ListModal";
import { UserAvatar } from "@/components/shared/UserAvatar";
import {
  useDeleteList,
  useList,
  useRemoveFilmFromList,
} from "@/hooks/useLists";
import Link from "next/link";

export default function ListDetailPage() {
  const params = useParams<{ listId: string }>();
  const listId = params?.listId;
  const router = useRouter();
  const { data: session } = useSession();

  const list = useList(listId);
  const remove = useDeleteList();
  const removeFilm = useRemoveFilmFromList(listId);

  const [editOpen, setEditOpen] = React.useState(false);

  if (list.isLoading) return <ListSkeleton />;
  if (list.isError || !list.data) {
    return (
      <div className="mx-auto max-w-3xl px-6 pt-16 lg:px-10">
        <EmptyState
          icon={ListVideo}
          title="List not found"
          description="It may have been deleted, or it's private and you're not the owner."
        />
      </div>
    );
  }

  const l = list.data;
  const isOwner = session?.user?.id === l.owner?.id;

  return (
    <>
      <ListModal
        open={editOpen}
        onOpenChange={setEditOpen}
        list={{
          id: l.id,
          title: l.title,
          description: l.description,
          isPublic: l.isPublic,
        }}
      />

      <div className="mx-auto max-w-7xl px-6 pt-8 pb-16 lg:px-10">
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between"
        >
          <div className="max-w-2xl">
            <div className="flex items-center gap-2">
              <Badge variant="default" size="default" className="gap-1.5">
                {l.isPublic ? (
                  <Globe className="h-3 w-3" />
                ) : (
                  <Lock className="h-3 w-3" />
                )}
                {l.isPublic ? "public" : "private"}
              </Badge>
              {l.owner && (
                <Link
                  href={`/profile/${l.owner.username}`}
                  className="inline-flex items-center gap-2 text-xs text-brand-textMuted hover:text-brand-text"
                >
                  <UserAvatar user={l.owner} size="xs" />
                  by @{l.owner.username}
                </Link>
              )}
            </div>
            <h1 className="mt-3 font-serif text-4xl font-bold leading-tight tracking-tight md:text-5xl">
              {l.title}
            </h1>
            {l.description && (
              <p className="mt-3 text-brand-textMuted">{l.description}</p>
            )}
            <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-textMuted">
              {l.filmCount} film{l.filmCount === 1 ? "" : "s"}
            </p>
          </div>

          {isOwner && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setEditOpen(true)}>
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (window.confirm("Delete this list?")) {
                    remove.mutate(l.id, {
                      onSuccess: () => router.push("/lists"),
                    });
                  }
                }}
                disabled={remove.isPending}
              >
                {remove.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Delete
              </Button>
            </div>
          )}
        </motion.section>

        {l.films.length === 0 ? (
          <EmptyState
            icon={ListVideo}
            title="No films in this list yet"
            description={
              isOwner
                ? "Open any film and add it to this list from there. (Coming soon — for now, the API endpoint works.)"
                : "Empty for now."
            }
          />
        ) : (
          <div className="grid gap-4 grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
            {l.films.map((row, i) => (
              <div key={row.id} className="relative">
                <FilmCard film={row.film} index={i} />
                {isOwner && (
                  <button
                    type="button"
                    onClick={() => removeFilm.mutate(row.film.id)}
                    aria-label={`Remove ${row.film.title} from list`}
                    className="absolute right-2 top-2 z-30 inline-flex h-7 w-7 items-center justify-center rounded-md bg-brand-bg/80 text-brand-textMuted opacity-0 transition-all group-hover:opacity-100 hover:text-brand-red"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function ListSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-6 pt-8 pb-16 lg:px-10">
      <Skeleton className="h-8 w-24 rounded-full" />
      <Skeleton className="mt-4 h-12 w-2/3 rounded" />
      <Skeleton className="mt-3 h-4 w-1/2 rounded" />
      <div className="mt-10 grid gap-4 grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[2/3] rounded-lg" />
        ))}
      </div>
    </div>
  );
}
