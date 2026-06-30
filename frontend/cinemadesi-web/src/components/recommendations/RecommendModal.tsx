"use client";

import * as React from "react";
import { Loader2, Send, UserRound, Users } from "lucide-react";
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
import { FilmPoster } from "@/components/film/FilmPoster";
import { IndustryBadge } from "@/components/film/IndustryBadge";
import { UserTypeahead } from "@/components/shared/UserTypeahead";
import { useMyGroups } from "@/hooks/useGroups";
import { useSendRecommendation } from "@/hooks/useRecommendations";
import { cn } from "@/lib/utils";
import type { FilmSummary, UserSummary } from "@/types";

interface RecommendModalProps {
  film: FilmSummary | null;
  open: boolean;
  onOpenChange: (next: boolean) => void;
}

export function RecommendModal({ film, open, onOpenChange }: RecommendModalProps) {
  const [mode, setMode] = React.useState<"friend" | "group">("friend");
  const [toUser, setToUser] = React.useState<UserSummary | null>(null);
  const [groupId, setGroupId] = React.useState("");
  const [note, setNote] = React.useState("");

  const groups = useMyGroups();
  const send = useSendRecommendation();

  React.useEffect(() => {
    if (!open) {
      setToUser(null);
      setGroupId("");
      setNote("");
      setMode("friend");
    }
  }, [open]);

  if (!film) return null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const body =
      mode === "friend"
        ? { filmId: film.id, toUserId: toUser?.id, note: note || undefined }
        : { filmId: film.id, toGroupId: groupId, note: note || undefined };

    send.mutate(body, { onSuccess: () => onOpenChange(false) });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send to…</DialogTitle>
          <DialogDescription>Push this film to a friend or a watch group.</DialogDescription>
        </DialogHeader>

        <div className="flex gap-3">
          <div className="relative h-24 w-16 shrink-0 overflow-hidden rounded-md ring-1 ring-brand-border">
            <FilmPoster src={film.posterUrl} alt={film.title} />
          </div>
          <div className="min-w-0">
            <h3 className="font-serif text-lg font-semibold leading-tight">
              {film.title}
            </h3>
            <div className="mt-1.5">
              <IndustryBadge industry={film.industry} size="sm" />
            </div>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <ModeButton
              active={mode === "friend"}
              onClick={() => setMode("friend")}
              icon={UserRound}
              label="A friend"
            />
            <ModeButton
              active={mode === "group"}
              onClick={() => setMode("group")}
              icon={Users}
              label="A group"
            />
          </div>

          {mode === "friend" ? (
            <div className="space-y-1.5">
              <Label>Friend</Label>
              <UserTypeahead value={toUser} onSelect={setToUser} autoFocus />
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label htmlFor="group">Pick a group</Label>
              <select
                id="group"
                value={groupId}
                onChange={(e) => setGroupId(e.target.value)}
                required
                className="flex h-10 w-full rounded-lg border border-brand-border bg-brand-surface3 px-3 text-sm text-brand-text focus:border-brand-gold focus:outline-none"
              >
                <option value="">
                  {groups.isLoading ? "Loading…" : "Choose a group"}
                </option>
                {groups.data?.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
              {groups.isSuccess && groups.data.length === 0 && (
                <p className="text-[11px] text-brand-textMuted">
                  No groups yet. Create one first.
                </p>
              )}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="note">Note (optional)</Label>
            <textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={200}
              rows={3}
              placeholder="trust me on this one"
              className="flex w-full rounded-lg border border-brand-border bg-brand-surface3 px-4 py-2.5 text-sm text-brand-text placeholder:text-brand-textMuted focus:border-brand-gold focus:outline-none"
            />
            <p className="text-right text-[10px] uppercase tracking-widest text-brand-textMuted">
              {note.length} / 200
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={send.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={send.isPending || (mode === "friend" ? !toUser : !groupId)}
            >
              {send.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending…
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ModeButton({
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
        "flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all",
        active
          ? "border-brand-gold bg-brand-goldGlow text-brand-gold"
          : "border-brand-border bg-brand-surface text-brand-textMuted hover:border-brand-borderHi hover:text-brand-text"
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}
