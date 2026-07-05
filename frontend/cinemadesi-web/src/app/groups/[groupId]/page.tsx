"use client";

import * as React from "react";
import { useParams, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import {
  Dices,
  Film as FilmIcon,
  Loader2,
  LogOut,
  MonitorPlay,
  Sparkles,
  UserMinus,
  UserPlus,
  Users,
  UsersRound,
} from "lucide-react";
import { WATCH_PARTY_URL } from "@/lib/constants";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { FilmCard } from "@/components/film/FilmCard";
import { FeedItem } from "@/components/diary/FeedItem";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { Badge } from "@/components/ui/badge";
import { CommonFilmFinder } from "@/components/groups/CommonFilmFinder";
import { InviteMemberModal } from "@/components/groups/InviteMemberModal";
import {
  useGroup,
  useGroupFeed,
  useGroupMergedWatchlist,
  useRemoveMember,
} from "@/hooks/useGroups";
import { useIntersection } from "@/hooks/useIntersection";

export default function GroupDetailPage() {
  return (
    <React.Suspense fallback={null}>
      <GroupDetailContent />
    </React.Suspense>
  );
}

function GroupDetailContent() {
  const params = useParams<{ groupId: string }>();
  const searchParams = useSearchParams();
  const groupId = params?.groupId;
  const presetUsername = searchParams.get("invite") ?? undefined;

  const { data: session } = useSession();

  const group = useGroup(groupId);
  const merged = useGroupMergedWatchlist(groupId);
  const feed = useGroupFeed(groupId);
  const removeMember = useRemoveMember(groupId);

  const [inviteOpen, setInviteOpen] = React.useState(false);

  // Compute membership + role once — used by hooks below and by JSX later.
  const myId = session?.user?.id;
  const myMembership = group.data?.members?.find((m) => m.user.id === myId);
  const isAdmin = myMembership?.role === "ADMIN";

  // If we landed with ?invite=<username>, open the invite modal automatically
  // (only if we're an admin — the modal is admin-only).
  React.useEffect(() => {
    if (presetUsername && isAdmin && !inviteOpen) setInviteOpen(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [presetUsername, isAdmin]);

  const feedSentinelRef = useIntersection(() => {
    if (feed.hasNextPage && !feed.isFetchingNextPage) feed.fetchNextPage();
  });

  if (group.isLoading) return <GroupSkeleton />;
  if (group.isError || !group.data) {
    return (
      <div className="mx-auto max-w-3xl px-6 pt-16 lg:px-10">
        <EmptyState
          icon={Users}
          title="Couldn't load this group"
          description="It might have been deleted, or you may not be a member."
        />
      </div>
    );
  }

  const g = group.data;
  const feedEntries = feed.data?.pages.flatMap((p) => p.content) ?? [];

  return (
    <div className="mx-auto max-w-7xl px-6 pt-8 pb-16 lg:px-10">
      {/* Header */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-2xl border border-brand-border"
      >
        <div className="relative h-40 w-full overflow-hidden">
          {g.coverImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={g.coverImageUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div aria-hidden className="h-full w-full bg-mesh-hero" />
          )}
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-brand-surface to-transparent"
          />
        </div>

        <div className="px-6 pb-6 pt-2 md:px-8 md:pb-8">
          <h1 className="font-serif text-3xl font-bold tracking-tight md:text-4xl">
            {g.name}
          </h1>
          {g.description && (
            <p className="mt-2 max-w-2xl text-sm text-brand-textMuted">
              {g.description}
            </p>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <div className="flex -space-x-2">
              {g.members?.slice(0, 5).map((m) => (
                <div key={m.id} className="ring-2 ring-brand-surface rounded-full">
                  <UserAvatar user={m.user} size="sm" />
                </div>
              ))}
            </div>
            <Badge variant="default" size="default" className="gap-1.5">
              <Users className="h-3 w-3" />
              {g.memberCount} member{g.memberCount === 1 ? "" : "s"}
            </Badge>
          </div>
        </div>
      </motion.section>

      {/* Watch Party CTA — synchronous viewing with voice + text chat */}
      <motion.a
        href={WATCH_PARTY_URL}
        target="_blank"
        rel="noopener noreferrer"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="group relative mt-6 flex items-center gap-4 overflow-hidden rounded-2xl border border-brand-goldDim bg-gradient-to-br from-brand-goldGlow via-brand-surface to-brand-surface p-5 transition-all hover:border-brand-gold hover:-translate-y-0.5 hover:shadow-[0_18px_36px_-15px_rgba(232,184,75,0.35)]"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-gold-radial blur-3xl opacity-70"
        />
        <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-brand-goldDim bg-brand-bg text-brand-gold">
          <MonitorPlay className="h-5 w-5" />
        </div>
        <div className="relative min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-gold">
              new
            </p>
            <Sparkles className="h-3 w-3 text-brand-gold" />
          </div>
          <h3 className="mt-1 font-serif text-lg font-semibold text-brand-text">
            Watch this movie together
          </h3>
          <p className="mt-0.5 text-sm text-brand-textMuted">
            Sync a YouTube or local video with voice + text chat. Anyone in the
            call can play, pause, or scrub.
          </p>
        </div>
        <div className="relative hidden shrink-0 rounded-lg border border-brand-goldDim bg-brand-bg px-3 py-2 text-[11px] font-semibold uppercase tracking-widest text-brand-gold transition-all group-hover:bg-brand-goldGlow sm:block">
          Start party →
        </div>
      </motion.a>

      {/* Tabs */}
      <Tabs defaultValue="common" className="mt-10">
        <TabsList>
          <TabsTrigger value="common">
            <Dices className="h-3.5 w-3.5" /> Common
          </TabsTrigger>
          <TabsTrigger value="watchlist">
            <FilmIcon className="h-3.5 w-3.5" /> Watchlist
          </TabsTrigger>
          <TabsTrigger value="feed">
            <UsersRound className="h-3.5 w-3.5" /> Feed
          </TabsTrigger>
          <TabsTrigger value="members">
            <Users className="h-3.5 w-3.5" /> Members
          </TabsTrigger>
        </TabsList>

        <TabsContent value="common">
          {groupId && <CommonFilmFinder groupId={groupId} />}
        </TabsContent>

        <TabsContent value="watchlist">
          {merged.isLoading && (
            <div className="grid gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[2/3] rounded-lg" />
              ))}
            </div>
          )}
          {merged.isSuccess && merged.data.length === 0 && (
            <EmptyState
              icon={FilmIcon}
              title="No saved films in this group"
              description="Once members start adding films to their watchlists, they'll all appear here."
            />
          )}
          <div className="grid gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {merged.data?.map((item, i) => (
              <div key={item.film.id} className="relative">
                <FilmCard film={item.film} index={i} />
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex -space-x-1.5">
                    {item.addedBy.slice(0, 3).map((u) => (
                      <div
                        key={u.id}
                        className="ring-2 ring-brand-bg rounded-full"
                      >
                        <UserAvatar user={u} size="xs" />
                      </div>
                    ))}
                  </div>
                  <Badge variant="default" size="sm">
                    {item.memberCount}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="feed">
          {feed.isLoading && (
            <Skeleton className="h-32 w-full rounded-xl" />
          )}
          {feed.isSuccess && feedEntries.length === 0 && (
            <EmptyState
              icon={UsersRound}
              title="Group is quiet"
              description="Once members log films, their entries show up here."
            />
          )}
          <div className="space-y-3">
            {feedEntries.map((entry, i) => (
              <FeedItem key={entry.id} entry={entry} index={i} />
            ))}
            {feed.hasNextPage && (
              <div
                ref={feedSentinelRef}
                className="flex items-center justify-center py-6"
              >
                {feed.isFetchingNextPage && (
                  <Loader2 className="h-4 w-4 animate-spin text-brand-textMuted" />
                )}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="members">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-brand-textMuted">
              {g.memberCount} member{g.memberCount === 1 ? "" : "s"}
            </p>
            <div className="flex gap-2">
              {isAdmin && (
                <Button size="sm" onClick={() => setInviteOpen(true)}>
                  <UserPlus className="h-4 w-4" />
                  Invite member
                </Button>
              )}
              {myMembership && !isAdmin && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    if (
                      window.confirm("Leave this group? You can be re-invited later.")
                    ) {
                      removeMember.mutate(myMembership.user.id);
                    }
                  }}
                  disabled={removeMember.isPending}
                >
                  <LogOut className="h-4 w-4" />
                  Leave group
                </Button>
              )}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {g.members.map((m) => {
              const isSelf = m.user.id === myId;
              return (
                <div
                  key={m.id}
                  className="flex items-center gap-3 rounded-xl border border-brand-border bg-brand-surface p-3"
                >
                  <UserAvatar user={m.user} size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">
                      {m.user.displayName || m.user.username}
                    </p>
                    <p className="text-xs text-brand-textMuted">
                      @{m.user.username}
                    </p>
                  </div>
                  {m.role === "ADMIN" && (
                    <Badge variant="gold" size="sm">
                      admin
                    </Badge>
                  )}
                  {isAdmin && !isSelf && (
                    <button
                      type="button"
                      onClick={() => {
                        if (
                          window.confirm(
                            `Remove ${m.user.username} from this group?`
                          )
                        ) {
                          removeMember.mutate(m.user.id);
                        }
                      }}
                      disabled={removeMember.isPending}
                      aria-label={`Remove ${m.user.username}`}
                      className="rounded-md p-1.5 text-brand-textMuted transition-colors hover:bg-brand-surface2 hover:text-brand-red"
                    >
                      <UserMinus className="h-4 w-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {groupId && (
            <InviteMemberModal
              groupId={groupId}
              excludeIds={g.members.map((m) => m.user.id)}
              open={inviteOpen}
              onOpenChange={setInviteOpen}
              presetUsername={presetUsername}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function GroupSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-6 pt-8 pb-16 lg:px-10">
      <Skeleton className="h-56 w-full rounded-2xl" />
      <div className="mt-6 flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-24 rounded-md" />
        ))}
      </div>
    </div>
  );
}
