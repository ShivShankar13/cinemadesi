"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Globe, Loader2, Lock } from "lucide-react";
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
import { useCreateList, useUpdateList } from "@/hooks/useLists";
import { cn } from "@/lib/utils";

interface ListModalProps {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  /** When provided, modal is in edit mode for this list. */
  list?: {
    id: string;
    title: string;
    description: string | null;
    isPublic: boolean | null;
  };
}

/**
 * Used for both creating and editing curated lists. Title required,
 * description optional, public/private toggle.
 */
export function ListModal({ open, onOpenChange, list }: ListModalProps) {
  const router = useRouter();
  const isEdit = !!list;

  const [title, setTitle] = React.useState(list?.title ?? "");
  const [description, setDescription] = React.useState(list?.description ?? "");
  const [isPublic, setIsPublic] = React.useState<boolean>(list?.isPublic ?? true);

  const create = useCreateList();
  const update = useUpdateList(list?.id);
  const pending = isEdit ? update.isPending : create.isPending;

  React.useEffect(() => {
    if (!open) return;
    setTitle(list?.title ?? "");
    setDescription(list?.description ?? "");
    setIsPublic(list?.isPublic ?? true);
  }, [open, list]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit) {
      update.mutate(
        { title, description, isPublic },
        { onSuccess: () => onOpenChange(false) }
      );
      return;
    }
    create.mutate(
      { title, description, isPublic },
      {
        onSuccess: (newList) => {
          onOpenChange(false);
          router.push(`/lists/${newList.id}`);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit list" : "New list"}</DialogTitle>
          <DialogDescription>
            Curate a list of films. Make it public so others can browse it.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Best Malayalam Thrillers"
              required
              maxLength={255}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description (optional)</Label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={2000}
              rows={3}
              placeholder="Why these films?"
              className="flex w-full rounded-lg border border-brand-border bg-brand-surface3 px-4 py-2.5 text-sm text-brand-text placeholder:text-brand-textMuted focus:border-brand-gold focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Visibility</Label>
            <div className="grid grid-cols-2 gap-2">
              <VisibilityToggle
                active={isPublic}
                onClick={() => setIsPublic(true)}
                icon={Globe}
                label="Public"
                hint="Browseable by everyone"
              />
              <VisibilityToggle
                active={!isPublic}
                onClick={() => setIsPublic(false)}
                icon={Lock}
                label="Private"
                hint="Only you"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending || !title.trim()}>
              {pending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : isEdit ? (
                "Save changes"
              ) : (
                "Create list"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function VisibilityToggle({
  active,
  onClick,
  icon: Icon,
  label,
  hint,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  label: string;
  hint: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition-all",
        active
          ? "border-brand-gold bg-brand-goldGlow"
          : "border-brand-border bg-brand-surface hover:border-brand-borderHi"
      )}
    >
      <div className={cn("flex items-center gap-2", active && "text-brand-gold")}>
        <Icon className="h-4 w-4" />
        <span className="text-sm font-semibold">{label}</span>
      </div>
      <p className="text-[11px] text-brand-textMuted">{hint}</p>
    </button>
  );
}
