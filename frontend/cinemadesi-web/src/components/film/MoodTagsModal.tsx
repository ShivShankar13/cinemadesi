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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { MOOD_TAGS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface MoodTagsModalProps {
  itemId: string;
  initial: string[];
  open: boolean;
  onOpenChange: (next: boolean) => void;
}

/**
 * Toggle which mood tags this watchlist item has. Submitting replaces
 * the whole set (the backend's contract is "replace, not merge").
 */
export function MoodTagsModal({
  itemId,
  initial,
  open,
  onOpenChange,
}: MoodTagsModalProps) {
  const qc = useQueryClient();
  const [selected, setSelected] = React.useState<Set<string>>(
    () => new Set(initial)
  );

  React.useEffect(() => {
    if (open) setSelected(new Set(initial));
  }, [open, initial]);

  const update = useMutation({
    mutationFn: (tags: string[]) => api.watchlist.updateMoodTags(itemId, tags),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["watchlist", "me"] });
      toast.success("Tags updated");
      onOpenChange(false);
    },
    onError: () => toast.error("Could not update tags"),
  });

  const toggle = (tag: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    update.mutate(Array.from(selected));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mood tags</DialogTitle>
          <DialogDescription>
            Pick the moods that match this film. Used by the watchlist filters.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {MOOD_TAGS.map((tag) => {
              const active = selected.has(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggle(tag)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider transition-all",
                    active
                      ? "border-brand-gold bg-brand-goldGlow text-brand-gold"
                      : "border-brand-border bg-brand-surface text-brand-textMuted hover:border-brand-borderHi hover:text-brand-text"
                  )}
                >
                  {tag.replace(/_/g, " ").toLowerCase()}
                </button>
              );
            })}
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
                "Save tags"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
