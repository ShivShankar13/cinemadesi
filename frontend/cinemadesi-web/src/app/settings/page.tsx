"use client";

import * as React from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { motion } from "framer-motion";
import {
  Bell,
  ExternalLink,
  KeyRound,
  LogOut,
  Settings as SettingsIcon,
  Trash2,
  User as UserIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { EditProfileModal } from "@/components/profile/EditProfileModal";
import { useCurrentUser, useRequireAuth } from "@/hooks/useAuth";

export default function SettingsPage() {
  useRequireAuth();
  const me = useCurrentUser();
  const [editOpen, setEditOpen] = React.useState(false);

  if (me.isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-6 pt-8 pb-16 lg:px-10">
        <Skeleton className="h-10 w-48 rounded" />
        <Skeleton className="mt-8 h-40 w-full rounded-2xl" />
        <Skeleton className="mt-4 h-40 w-full rounded-2xl" />
      </div>
    );
  }

  if (!me.data) {
    return (
      <div className="mx-auto max-w-3xl px-6 pt-16 lg:px-10">
        <EmptyState
          icon={SettingsIcon}
          title="Not signed in"
          description="Sign in to manage your account."
          action={{ label: "Sign in", href: "/login" }}
        />
      </div>
    );
  }

  return (
    <>
      <EditProfileModal
        user={me.data}
        open={editOpen}
        onOpenChange={setEditOpen}
      />

      <div className="mx-auto max-w-3xl px-6 pt-8 pb-16 lg:px-10">
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10"
        >
          <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-textMuted">
            Settings
          </p>
          <h1 className="mt-2 font-serif text-4xl font-bold leading-tight tracking-tight md:text-5xl">
            Account.
          </h1>
        </motion.section>

        {/* Profile section */}
        <Section icon={UserIcon} title="Profile">
          <Row
            label="Display name"
            value={me.data.displayName || "—"}
            action={
              <Button size="sm" variant="outline" onClick={() => setEditOpen(true)}>
                Edit
              </Button>
            }
          />
          <Row label="Username" value={`@${me.data.username}`} />
          <Row label="Email" value={me.data.email} />
          <Row
            label="Bio"
            value={me.data.bio || "—"}
            wrap
          />
          <Row
            label="Public profile"
            value={
              <Link
                href={`/profile/${me.data.username}`}
                className="inline-flex items-center gap-1 text-brand-gold hover:underline"
              >
                /profile/{me.data.username}
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            }
          />
        </Section>

        {/* Notifications stub */}
        <Section icon={Bell} title="Notifications">
          <Row
            label="Recommendation inbox"
            value="Email digest"
            action={
              <Button size="sm" variant="outline" disabled>
                Coming soon
              </Button>
            }
          />
        </Section>

        {/* Security stub */}
        <Section icon={KeyRound} title="Security">
          <Row
            label="Password"
            value="Last changed — never"
            action={
              <Button size="sm" variant="outline" disabled>
                Change
              </Button>
            }
          />
        </Section>

        {/* Danger */}
        <Section icon={Trash2} title="Danger zone" variant="danger">
          <p className="px-5 pb-5 text-sm text-brand-textMuted">
            Account deletion isn't available yet. Reach out via the feedback
            button when it lands.
          </p>
        </Section>

        <div className="mt-10 flex justify-end">
          <Button
            variant="destructive"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </div>
    </>
  );
}

function Section({
  icon: Icon,
  title,
  variant = "default",
  children,
}: {
  icon: React.ElementType;
  title: string;
  variant?: "default" | "danger";
  children: React.ReactNode;
}) {
  return (
    <section
      className={
        "mb-5 overflow-hidden rounded-2xl border bg-brand-surface " +
        (variant === "danger"
          ? "border-brand-red/30"
          : "border-brand-border")
      }
    >
      <header
        className={
          "flex items-center gap-2 border-b px-5 py-3 " +
          (variant === "danger"
            ? "border-brand-red/30 text-brand-red"
            : "border-brand-border text-brand-textMuted")
        }
      >
        <Icon className="h-4 w-4" />
        <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.22em]">
          {title}
        </p>
      </header>
      <div className="divide-y divide-brand-border">{children}</div>
    </section>
  );
}

function Row({
  label,
  value,
  action,
  wrap = false,
}: {
  label: string;
  value: React.ReactNode;
  action?: React.ReactNode;
  wrap?: boolean;
}) {
  return (
    <div className="flex items-center gap-4 px-5 py-3.5">
      <p className="w-32 shrink-0 text-[11px] font-semibold uppercase tracking-widest text-brand-textMuted">
        {label}
      </p>
      <div
        className={
          "flex-1 text-sm text-brand-text " +
          (wrap ? "whitespace-pre-wrap" : "truncate")
        }
      >
        {value}
      </div>
      {action}
    </div>
  );
}
