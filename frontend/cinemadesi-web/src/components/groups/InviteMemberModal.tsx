"use client";

import * as React from "react";
import { toast } from "sonner";
import { Check, Copy, Link2, Loader2, Search, UserPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { UserTypeahead } from "@/components/shared/UserTypeahead";
import { useInviteMember } from "@/hooks/useGroups";
import { cn } from "@/lib/utils";
import type { GroupRole, UserSummary } from "@/types";

interface InviteMemberModalProps {
  groupId: string;
  excludeIds: string[];
  open: boolean;
  onOpenChange: (next: boolean) => void;
  /** Pre-fill the typeahead when opening from a `?invite=username` URL param. */
  presetUsername?: string;
}

type Tab = "search" | "share";

export function InviteMemberModal({
  groupId,
  excludeIds,
  open,
  onOpenChange,
  presetUsername,
}: InviteMemberModalProps) {
  const [tab, setTab] = React.useState<Tab>("search");
  const [user, setUser] = React.useState<UserSummary | null>(null);
  const [role, setRole] = React.useState<GroupRole>("MEMBER");
  const [copied, setCopied] = React.useState(false);

  const invite = useInviteMember(groupId);

  React.useEffect(() => {
    if (!open) {
      setUser(null);
      setRole("MEMBER");
      setTab("search");
      setCopied(false);
    }
  }, [open]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    invite.mutate(
      { userId: user.id, role },
      { onSuccess: () => onOpenChange(false) }
    );
  };

  // ── Share link ────────────────────────────────────────────────────────
  const inviteUrl = React.useMemo(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/groups/${groupId}/join`;
  }, [groupId]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      toast.success("Link copied");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy — long-press to select the link");
    }
  };

  const openWhatsApp = () => {
    const text = encodeURIComponent(
      `Join my CinemaDesi group: ${inviteUrl}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-brand-gold" />
            Invite to group
          </DialogTitle>
          <DialogDescription>
            Find a user, or share a link they can use to join.
          </DialogDescription>
        </DialogHeader>

        {/* Tabs */}
        <div className="grid grid-cols-2 gap-2 rounded-lg border border-brand-border bg-brand-surface p-1">
          <TabButton
            active={tab === "search"}
            onClick={() => setTab("search")}
            icon={Search}
            label="Find user"
          />
          <TabButton
            active={tab === "share"}
            onClick={() => setTab("share")}
            icon={Link2}
            label="Share link"
          />
        </div>

        {tab === "search" ? (
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Who?</Label>
              <UserTypeahead
                value={user}
                onSelect={setUser}
                excludeIds={excludeIds}
                autoFocus
              />
              {presetUsername && !user && (
                <p className="text-[11px] text-brand-textMuted">
                  Search for <span className="text-brand-gold">@{presetUsername}</span>
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>Role</Label>
              <div className="grid grid-cols-2 gap-2">
                {(["MEMBER", "ADMIN"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={cn(
                      "rounded-lg border px-4 py-2.5 text-sm font-medium transition-all",
                      role === r
                        ? "border-brand-gold bg-brand-goldGlow text-brand-gold"
                        : "border-brand-border bg-brand-surface text-brand-textMuted hover:border-brand-borderHi hover:text-brand-text"
                    )}
                  >
                    {r.toLowerCase()}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-brand-textMuted">
                Admins can invite, remove, and edit the group.
              </p>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                disabled={invite.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={invite.isPending || !user}>
                {invite.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Inviting…
                  </>
                ) : (
                  "Add to group"
                )}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Invite link</Label>
              <div className="flex items-center gap-2 rounded-lg border border-brand-border bg-brand-surface3 p-2 pl-3">
                <span className="min-w-0 flex-1 truncate font-mono text-xs text-brand-textMuted">
                  {inviteUrl}
                </span>
                <button
                  type="button"
                  onClick={copyLink}
                  className="inline-flex items-center gap-1 rounded-md bg-brand-goldGlow border border-brand-goldDim px-2.5 py-1 text-[11px] font-semibold text-brand-gold transition-colors hover:bg-[rgba(232,184,75,0.18)]"
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
              <p className="text-[11px] text-brand-textMuted">
                Anyone with this link can request to join. You'll still need
                to approve them from the Members tab.
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={openWhatsApp}
              >
                Send via WhatsApp
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function TabButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-brand-surface2 text-brand-gold shadow-[inset_0_-2px_0_0_rgba(232,184,75,0.6)]"
          : "text-brand-textMuted hover:text-brand-text"
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}
