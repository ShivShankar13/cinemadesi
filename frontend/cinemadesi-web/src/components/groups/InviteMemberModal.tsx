"use client";

import * as React from "react";
import { Loader2, UserPlus } from "lucide-react";
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
  /** IDs of users already in the group — hidden from typeahead. */
  excludeIds: string[];
  open: boolean;
  onOpenChange: (next: boolean) => void;
}

export function InviteMemberModal({
  groupId,
  excludeIds,
  open,
  onOpenChange,
}: InviteMemberModalProps) {
  const [user, setUser] = React.useState<UserSummary | null>(null);
  const [role, setRole] = React.useState<GroupRole>("MEMBER");

  const invite = useInviteMember(groupId);

  React.useEffect(() => {
    if (!open) {
      setUser(null);
      setRole("MEMBER");
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-brand-gold" />
            Invite to group
          </DialogTitle>
          <DialogDescription>
            Find a user by username or display name.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Who?</Label>
            <UserTypeahead
              value={user}
              onSelect={setUser}
              excludeIds={excludeIds}
              autoFocus
            />
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
      </DialogContent>
    </Dialog>
  );
}
