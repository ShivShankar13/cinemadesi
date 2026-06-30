"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Bookmark, Film as FilmIcon, ListVideo, Loader2, UserX } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { FollowButton } from "@/components/shared/FollowButton";
import { FeedItem } from "@/components/diary/FeedItem";
import { WatchlistCard } from "@/components/film/WatchlistCard";
import { EditProfileModal } from "@/components/profile/EditProfileModal";
import { Button } from "@/components/ui/button";
import {
  useUserDiary,
  useUserLists,
  useUserProfile,
  useUserWatchlist,
} from "@/hooks/useUser";
import { useIntersection } from "@/hooks/useIntersection";

export default function ProfilePage() {
  const params = useParams<{ username: string }>();
  const username = params?.username;
  const { data: session } = useSession();

  const profile = useUserProfile(username);
  const diary = useUserDiary(username);
  const watchlist = useUserWatchlist(username);
  const lists = useUserLists(username);

  const isMe = session?.user?.username === username;
  const [editOpen, setEditOpen] = React.useState(false);

  const diarySentinelRef = useIntersection(() => {
    if (diary.hasNextPage && !diary.isFetchingNextPage) diary.fetchNextPage();
  });

  if (profile.isLoading) return <ProfileSkeleton />;
  if (profile.isError || !profile.data) {
    return (
      <div className="mx-auto max-w-3xl px-6 pt-16 lg:px-10">
        <EmptyState
          icon={UserX}
          title="User not found"
          description="The profile you're looking for doesn't exist (or hasn't joined yet)."
        />
      </div>
    );
  }

  const p = profile.data;
  const diaryEntries = diary.data?.pages.flatMap((pg) => pg.content) ?? [];

  return (
    <div className="relative">
      {/* Cover gradient header */}
      <div className="relative h-44 overflow-hidden">
        <div aria-hidden className="absolute inset-0 bg-mesh-hero opacity-70" />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-b from-transparent to-brand-bg"
        />
      </div>

      <div className="mx-auto -mt-16 max-w-5xl px-6 lg:px-10">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"
        >
          <div className="flex items-end gap-5">
            <div className="ring-4 ring-brand-bg rounded-full">
              <UserAvatar user={p} size="xl" />
            </div>
            <div className="pb-1">
              <h1 className="font-serif text-3xl font-bold leading-tight tracking-tight md:text-4xl">
                {p.displayName || p.username}
              </h1>
              <p className="text-sm text-brand-textMuted">@{p.username}</p>
            </div>
          </div>

          {!isMe && (
            <FollowButton
              username={p.username}
              targetUserId={p.id}
              isFollowing={Boolean(p.isFollowedByMe)}
            />
          )}
          {isMe && (
            <Button variant="outline" onClick={() => setEditOpen(true)}>
              Edit profile
            </Button>
          )}
        </motion.section>

        {isMe && (
          <EditProfileModal
            user={p}
            open={editOpen}
            onOpenChange={setEditOpen}
          />
        )}

        {p.bio && (
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-brand-textMuted">
            {p.bio}
          </p>
        )}

        {/* Stats */}
        <div className="mt-6 flex flex-wrap items-center gap-6 border-y border-brand-border py-4">
          <Stat label="Films" value={p.totalFilmsWatched} />
          <Stat label="Followers" value={p.totalFollowers} />
          <Stat label="Following" value={p.totalFollowing} />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="diary" className="mt-8">
          <TabsList>
            <TabsTrigger value="diary">
              <FilmIcon className="h-3.5 w-3.5" /> Diary
            </TabsTrigger>
            <TabsTrigger value="watchlist">
              <Bookmark className="h-3.5 w-3.5" /> Watchlist
            </TabsTrigger>
            <TabsTrigger value="lists">
              <ListVideo className="h-3.5 w-3.5" /> Lists
            </TabsTrigger>
          </TabsList>

          <TabsContent value="diary">
            {diary.isLoading && <DiarySkeletons />}
            {diary.isSuccess && diaryEntries.length === 0 && (
              <EmptyState
                icon={FilmIcon}
                title="No diary entries yet"
                description={
                  isMe
                    ? "Log a film to start your diary."
                    : `${p.username} hasn't logged anything yet.`
                }
              />
            )}
            <div className="space-y-3">
              {diaryEntries.map((entry, i) => (
                <FeedItem key={entry.id} entry={entry} index={i} />
              ))}
              {diary.hasNextPage && (
                <div
                  ref={diarySentinelRef}
                  className="flex items-center justify-center py-6"
                >
                  {diary.isFetchingNextPage && (
                    <Loader2 className="h-4 w-4 animate-spin text-brand-textMuted" />
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="watchlist">
            {watchlist.isLoading && <Skeleton className="h-32 w-full rounded-xl" />}
            {watchlist.isSuccess && watchlist.data.length === 0 && (
              <EmptyState
                icon={Bookmark}
                title="Watchlist is empty"
                description={isMe ? "Save films you want to watch later." : `${p.username} hasn't saved any films.`}
              />
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              {watchlist.data?.map((item, i) => (
                <WatchlistCard key={item.id} item={item} index={i} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="lists">
            {lists.isLoading && <Skeleton className="h-32 w-full rounded-xl" />}
            {lists.isSuccess && lists.data.length === 0 && (
              <EmptyState
                icon={ListVideo}
                title="No public lists"
                description={isMe ? "Curate a list of your favorites." : `${p.username} doesn't have any public lists.`}
              />
            )}
            <div className="grid gap-4 md:grid-cols-2">
              {lists.data?.map((l) => (
                <div
                  key={l.id}
                  className="rounded-xl border border-brand-border bg-brand-surface p-4 hover:border-brand-borderHi transition-colors"
                >
                  <h3 className="font-serif text-lg font-semibold">{l.title}</h3>
                  {l.description && (
                    <p className="mt-1 text-sm text-brand-textMuted line-clamp-2">
                      {l.description}
                    </p>
                  )}
                  <p className="mt-3 text-[10px] uppercase tracking-widest text-brand-textMuted">
                    {l.filmCount} film{l.filmCount === 1 ? "" : "s"}
                  </p>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="font-serif text-2xl font-bold leading-none">{value}</p>
      <p className="mt-1 text-[10px] uppercase tracking-widest text-brand-textMuted">
        {label}
      </p>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div>
      <Skeleton className="h-44 rounded-none" />
      <div className="mx-auto -mt-16 max-w-5xl px-6 lg:px-10">
        <div className="flex items-end gap-5">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="space-y-2 pb-2">
            <Skeleton className="h-6 w-48 rounded" />
            <Skeleton className="h-3 w-24 rounded" />
          </div>
        </div>
        <Skeleton className="mt-6 h-4 w-2/3 rounded" />
        <div className="mt-8 flex gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-6 w-12 rounded" />
              <Skeleton className="h-3 w-16 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DiarySkeletons() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="flex gap-4 rounded-xl border border-brand-border bg-brand-surface/60 p-4"
        >
          <Skeleton className="h-24 w-16 rounded-md" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-1/3 rounded" />
            <Skeleton className="h-4 w-2/3 rounded" />
            <Skeleton className="h-3 w-full rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
