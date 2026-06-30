"use client";

import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import type { UserSummary } from "@/types";

const SIZES = {
  xs: "h-6 w-6 text-[10px]",
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-base",
  xl: "h-20 w-20 text-xl",
} as const;

export function UserAvatar({
  user,
  size = "md",
  className,
}: {
  user: Pick<UserSummary, "username" | "displayName" | "avatarUrl"> | null;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const fallback = (user?.displayName ?? user?.username ?? "?")
    .split(/\s+/)
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <Avatar className={cn(SIZES[size], className)}>
      {user?.avatarUrl ? <AvatarImage src={user.avatarUrl} alt={user.username} /> : null}
      <AvatarFallback>{fallback || "?"}</AvatarFallback>
    </Avatar>
  );
}
