"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { useUpdateMe } from "@/hooks/useUser";
import type { UserProfile } from "@/types";

interface EditProfileModalProps {
  user: UserProfile;
  open: boolean;
  onOpenChange: (next: boolean) => void;
}

export function EditProfileModal({ user, open, onOpenChange }: EditProfileModalProps) {
  const [displayName, setDisplayName] = React.useState(user.displayName ?? "");
  const [bio, setBio] = React.useState(user.bio ?? "");
  const [avatarUrl, setAvatarUrl] = React.useState(user.avatarUrl ?? "");

  const update = useUpdateMe();

  React.useEffect(() => {
    if (!open) return;
    setDisplayName(user.displayName ?? "");
    setBio(user.bio ?? "");
    setAvatarUrl(user.avatarUrl ?? "");
  }, [open, user]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    update.mutate(
      {
        displayName: displayName.trim() || undefined,
        bio: bio.trim() || undefined,
        avatarUrl: avatarUrl.trim() || undefined,
      },
      { onSuccess: () => onOpenChange(false) }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Change how you appear across CinemaDesi.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-4">
          <UserAvatar
            user={{
              username: user.username,
              displayName: displayName,
              avatarUrl,
            }}
            size="lg"
          />
          <div className="text-sm text-brand-textMuted">
            @{user.username}{" "}
            <span className="text-[10px] uppercase tracking-widest text-brand-textDim">
              · permanent
            </span>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="displayName">Display name</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
              maxLength={100}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="avatarUrl">Avatar URL</Label>
            <Input
              id="avatarUrl"
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://…"
            />
            <p className="text-[11px] text-brand-textMuted">
              Paste an image URL. Upload coming soon.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="bio">Bio</Label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={500}
              rows={4}
              placeholder="Tell people what you watch."
              className="flex w-full rounded-lg border border-brand-border bg-brand-surface3 px-4 py-2.5 text-sm text-brand-text placeholder:text-brand-textMuted focus:border-brand-gold focus:outline-none"
            />
            <p className="text-right text-[10px] uppercase tracking-widest text-brand-textMuted">
              {bio.length} / 500
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={update.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={update.isPending}>
              {update.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : (
                "Save profile"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
