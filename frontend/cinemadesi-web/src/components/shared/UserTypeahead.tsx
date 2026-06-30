"use client";

import * as React from "react";
import { Loader2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { useUserSearch } from "@/hooks/useUserSearch";
import { cn } from "@/lib/utils";
import type { UserSummary } from "@/types";

interface UserTypeaheadProps {
  /** Currently selected user, if any. */
  value: UserSummary | null;
  onSelect: (user: UserSummary | null) => void;
  placeholder?: string;
  /** When provided, hide these userIds from the result list (e.g. group members). */
  excludeIds?: string[];
  autoFocus?: boolean;
}

/**
 * Username/displayname typeahead — debounced, keyboard-navigable.
 *
 * <p>Used by RecommendModal (pick a friend) and InviteMemberModal
 * (pick a user to invite). On select, the input collapses into a
 * chip showing the chosen user; clearing the chip returns to search.</p>
 */
export function UserTypeahead({
  value,
  onSelect,
  placeholder = "Search by username or name…",
  excludeIds = [],
  autoFocus,
}: UserTypeaheadProps) {
  const [q, setQ] = React.useState("");
  const [activeIdx, setActiveIdx] = React.useState(0);
  const { data, isFetching } = useUserSearch(q);

  const results = React.useMemo(
    () => (data ?? []).filter((u) => !excludeIds.includes(u.id)),
    [data, excludeIds]
  );

  React.useEffect(() => {
    setActiveIdx(0);
  }, [q]);

  // When a user is selected, show a chip instead of the search input.
  if (value) {
    return (
      <div className="flex items-center justify-between gap-2 rounded-lg border border-brand-goldDim bg-brand-goldGlow px-3 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <UserAvatar user={value} size="xs" />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-brand-text">
              {value.displayName || value.username}
            </p>
            <p className="truncate text-[11px] text-brand-textMuted">
              @{value.username}
            </p>
          </div>
        </div>
        <button
          type="button"
          aria-label="Clear selection"
          onClick={() => onSelect(null)}
          className="rounded-md p-1 text-brand-textMuted transition-colors hover:bg-brand-surface3 hover:text-brand-text"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      onSelect(results[activeIdx]);
      setQ("");
    }
  };

  return (
    <div className="relative">
      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        onKeyDown={onKey}
        className="pr-9"
        autoComplete="off"
      />
      {isFetching && (
        <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-brand-textMuted" />
      )}

      {q.trim().length >= 2 && results.length > 0 && (
        <ul
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+4px)] z-20 max-h-64 overflow-y-auto rounded-xl border border-brand-border bg-brand-surface2 p-1 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.7)]"
        >
          {results.map((u, i) => (
            <li
              key={u.id}
              role="option"
              aria-selected={i === activeIdx}
              onMouseEnter={() => setActiveIdx(i)}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onSelect(u);
                setQ("");
              }}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 transition-colors",
                i === activeIdx ? "bg-brand-surface3" : "hover:bg-brand-surface3/60"
              )}
            >
              <UserAvatar user={u} size="xs" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-brand-text">
                  {u.displayName || u.username}
                </p>
                <p className="truncate text-[11px] text-brand-textMuted">
                  @{u.username}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}

      {q.trim().length >= 2 && !isFetching && results.length === 0 && (
        <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-20 rounded-xl border border-brand-border bg-brand-surface2 px-4 py-3 text-sm text-brand-textMuted">
          No users found
        </div>
      )}
    </div>
  );
}
