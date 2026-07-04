"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  ArrowRight,
  Check,
  Copy,
  Loader2,
  LogIn,
  MessageCircle,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { useGroup } from "@/hooks/useGroups";
import { useCurrentUser } from "@/hooks/useAuth";

/**
 * Public "join this group" landing.
 *
 * <p>Backend constraint: only group admins can add members. So this page's
 * job is to help the recipient and the admin coordinate — not to actually
 * add the recipient (they can't). The workflow:</p>
 *
 * <ol>
 *   <li>If not signed in → prompt to sign in (returns here after)</li>
 *   <li>If already a member → straight into the group</li>
 *   <li>Otherwise → show group preview + a "copy my username" button
 *       and instructions to send it to a group admin</li>
 * </ol>
 */
export default function JoinGroupPage() {
  const params = useParams<{ groupId: string }>();
  const groupId = params?.groupId;
  const router = useRouter();

  const { status } = useSession();
  const me = useCurrentUser();
  const group = useGroup(groupId);

  const [copied, setCopied] = React.useState(false);

  // ── Loading ─────────────────────────────────────────────────────────
  if (status === "loading" || (status === "authenticated" && group.isLoading)) {
    return <JoinSkeleton />;
  }

  // ── Not signed in → login gate ──────────────────────────────────────
  if (status === "unauthenticated") {
    const nextUrl = encodeURIComponent(`/groups/${groupId}/join`);
    return (
      <div className="mx-auto max-w-md px-6 pt-16 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-2xl border border-brand-border bg-brand-surface/80 p-8 text-center backdrop-blur"
        >
          <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-brand-goldDim bg-brand-goldGlow text-brand-gold">
            <LogIn className="h-5 w-5" />
          </div>
          <h1 className="font-serif text-2xl font-bold tracking-tight">
            Sign in to join
          </h1>
          <p className="mt-2 text-sm text-brand-textMuted">
            You've been invited to a watch group. Sign in to continue.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <Button asChild size="lg">
              <Link href={`/login?next=${nextUrl}`}>
                Sign in
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href={`/register?next=${nextUrl}`}>Create an account</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Group not found / not visible ───────────────────────────────────
  if (group.isError || !group.data) {
    return (
      <div className="mx-auto max-w-md px-6 pt-16 lg:px-10">
        <EmptyState
          icon={Users}
          title="Invite link isn't valid"
          description="This group may have been deleted, or the link is malformed."
          action={{ label: "Go home", href: "/" }}
        />
      </div>
    );
  }

  const g = group.data;
  const isMember = !!me.data && g.members.some((m) => m.user.id === me.data!.id);
  const admins = g.members.filter((m) => m.role === "ADMIN");

  // ── Already a member — fast path ────────────────────────────────────
  if (isMember) {
    return (
      <div className="mx-auto max-w-md px-6 pt-16 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-2xl border border-brand-border bg-brand-surface/80 p-8 text-center backdrop-blur"
        >
          <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-brand-goldDim bg-brand-goldGlow text-brand-gold">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h1 className="font-serif text-2xl font-bold tracking-tight">
            You're already in
          </h1>
          <p className="mt-2 text-sm text-brand-textMuted">
            You joined <span className="text-brand-text">{g.name}</span>.
          </p>
          <Button
            asChild
            size="lg"
            className="mt-6"
            onClick={() => router.push(`/groups/${g.id}`)}
          >
            <Link href={`/groups/${g.id}`}>
              Open group
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    );
  }

  // ── Ready to join — show preview + coordination steps ───────────────
  const myUsername = me.data?.username ?? "";

  const copyUsername = async () => {
    try {
      await navigator.clipboard.writeText(`@${myUsername}`);
      setCopied(true);
      toast.success("Username copied");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy — long-press to select");
    }
  };

  const openWhatsApp = () => {
    const text = encodeURIComponent(
      `hey — I'd like to join our CinemaDesi group "${g.name}". my username is @${myUsername}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  return (
    <div className="mx-auto max-w-lg px-6 pt-8 pb-16 lg:px-10">
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-2xl border border-brand-border bg-brand-surface"
      >
        {/* Cover */}
        <div className="relative h-32 w-full overflow-hidden">
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

        <div className="p-6">
          <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-textMuted">
            You've been invited
          </p>
          <h1 className="mt-2 font-serif text-3xl font-bold leading-tight tracking-tight">
            {g.name}
          </h1>
          {g.description && (
            <p className="mt-2 text-sm text-brand-textMuted">{g.description}</p>
          )}

          <div className="mt-4 flex items-center gap-3">
            <div className="flex -space-x-2">
              {g.members.slice(0, 4).map((m) => (
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

      {/* How to join */}
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mt-5 rounded-2xl border border-brand-goldDim/60 bg-brand-goldGlow p-5"
      >
        <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-gold">
          One more step
        </p>
        <h2 className="mt-2 font-serif text-lg font-semibold leading-tight text-brand-text">
          Send your username to a group admin
        </h2>
        <p className="mt-1 text-sm text-brand-textMuted">
          The admin will add you from their end. Once they do, you'll see the
          group in your list.
        </p>

        <div className="mt-4 flex items-center gap-2 rounded-lg border border-brand-border bg-brand-surface2 p-2 pl-3">
          <span className="min-w-0 flex-1 truncate font-mono text-sm text-brand-text">
            @{myUsername}
          </span>
          <button
            type="button"
            onClick={copyUsername}
            className="inline-flex items-center gap-1 rounded-md bg-brand-red/20 border border-brand-red/40 px-2.5 py-1 text-[11px] font-semibold text-brand-red transition-colors hover:bg-brand-red/30"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                Copy
              </>
            )}
          </button>
        </div>

        <Button
          onClick={openWhatsApp}
          className="mt-3 w-full"
          variant="outline"
        >
          <MessageCircle className="h-4 w-4" />
          Send via WhatsApp
        </Button>
      </motion.section>

      {/* Admin roster — recipient can DM them */}
      {admins.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-5"
        >
          <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-textMuted">
            Group admins
          </p>
          <div className="mt-2 space-y-2">
            {admins.map((m) => (
              <Link
                key={m.id}
                href={`/profile/${m.user.username}`}
                className="flex items-center gap-3 rounded-lg border border-brand-border bg-brand-surface p-3 transition-colors hover:border-brand-borderHi"
              >
                <UserAvatar user={m.user} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {m.user.displayName || m.user.username}
                  </p>
                  <p className="truncate text-[11px] text-brand-textMuted">
                    @{m.user.username}
                  </p>
                </div>
                <Badge variant="gold" size="sm">
                  admin
                </Badge>
              </Link>
            ))}
          </div>
        </motion.section>
      )}
    </div>
  );
}

function JoinSkeleton() {
  return (
    <div className="mx-auto max-w-lg px-6 pt-8 pb-16 lg:px-10">
      <Skeleton className="h-56 w-full rounded-2xl" />
      <Skeleton className="mt-5 h-40 w-full rounded-2xl" />
    </div>
  );
}
