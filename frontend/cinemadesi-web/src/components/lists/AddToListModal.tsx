"use client";

import * as React from "react";
import { Check, ListPlus, Loader2, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ListModal } from "./ListModal";
import { useAddFilmToList, useMyLists } from "@/hooks/useLists";
import { cn } from "@/lib/utils";
import type { FilmSummary } from "@/types";

interface AddToListModalProps {
  film: FilmSummary | null;
  open: boolean;
  onOpenChange: (next: boolean) => void;
}

/**
 * Pick one of the user's lists to add this film to. Lists are radio-selectable;
 * "Add" submits to that list. Includes a "Create new list" inline shortcut.
 */
export function AddToListModal({ film, open, onOpenChange }: AddToListModalProps) {
  const myLists = useMyLists();
  const [selected, setSelected] = React.useState<string | null>(null);
  const [createOpen, setCreateOpen] = React.useState(false);

  // Add hook is tied to the chosen list — we instantiate one mutation
  // per chosen list because the hook captures listId.
  const add = useAddFilmToList(selected ?? undefined);

  React.useEffect(() => {
    if (!open) setSelected(null);
  }, [open]);

  if (!film) return null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    add.mutate(
      { filmId: film.id },
      { onSuccess: () => onOpenChange(false) }
    );
  };

  return (
    <>
      <ListModal open={createOpen} onOpenChange={setCreateOpen} />

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ListPlus className="h-5 w-5 text-brand-gold" />
              Add to a list
            </DialogTitle>
            <DialogDescription>
              "{film.title}" — pick the list you want this in.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={submit} className="space-y-3">
            {myLists.isLoading && (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 rounded-lg" />
                ))}
              </div>
            )}

            {myLists.isSuccess && myLists.data.length === 0 && (
              <div className="rounded-xl border border-dashed border-brand-border p-6 text-center text-sm text-brand-textMuted">
                You don't have any lists yet.
              </div>
            )}

            {myLists.data && myLists.data.length > 0 && (
              <div className="max-h-64 space-y-1 overflow-y-auto pr-1">
                {myLists.data.map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => setSelected(l.id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg border px-3 py-3 text-left transition-all",
                      selected === l.id
                        ? "border-brand-gold bg-brand-goldGlow"
                        : "border-brand-border bg-brand-surface hover:border-brand-borderHi"
                    )}
                  >
                    <div className={cn(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                      selected === l.id
                        ? "border-brand-gold bg-brand-gold"
                        : "border-brand-border"
                    )}>
                      {selected === l.id && (
                        <Check className="h-3 w-3 text-black" strokeWidth={3} />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-brand-text">
                        {l.title}
                      </p>
                      <p className="text-[11px] text-brand-textMuted">
                        {l.filmCount} film{l.filmCount === 1 ? "" : "s"} ·{" "}
                        {l.isPublic ? "public" : "private"}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="flex w-full items-center gap-2 rounded-lg border border-dashed border-brand-border px-3 py-2.5 text-sm text-brand-textMuted transition-colors hover:border-brand-borderHi hover:text-brand-text"
            >
              <Plus className="h-4 w-4" />
              Create new list
            </button>

            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                disabled={add.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={!selected || add.isPending}>
                {add.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Adding…
                  </>
                ) : (
                  "Add to list"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
